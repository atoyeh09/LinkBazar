const Classified = require('../models/classified.model');

// @desc    Create a new classified ad
// @route   POST /api/classifieds
// @access  Private
exports.createClassified = async (req, res) => {
  try {
    // Add seller ID from authenticated user
    req.body.sellerId = req.user._id;

    // Create classified ad
    const classified = await Classified.create(req.body);

    res.status(201).json({
      success: true,
      data: classified
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all classified ads
// @route   GET /api/classifieds
// @access  Public
exports.getClassifieds = async (req, res) => {
  try {
    const { category, region, minPrice, maxPrice, condition, sort, seller, status } = req.query;
    const queryObject = {};

    // Filter by category
    if (category) {
      queryObject.category = category;
    }

    // Filter by region
    if (region) {
      queryObject.region = region;
    }

    // Filter by condition
    if (condition) {
      queryObject.condition = condition;
    }

    // Filter by price range
    if (minPrice && maxPrice) {
      queryObject.price = { $gte: minPrice, $lte: maxPrice };
    } else if (minPrice) {
      queryObject.price = { $gte: minPrice };
    } else if (maxPrice) {
      queryObject.price = { $lte: maxPrice };
    }

    // Filter by seller
    if (seller) {
      queryObject.sellerId = seller;
    }

    // Filter by status if provided, otherwise only show active classifieds for public view
    if (status) {
      if (status === 'active') {
        queryObject.isActive = true;
      } else if (status === 'inactive') {
        queryObject.isActive = false;
      }
    } else if (!seller) {
      // Only apply isActive filter for public listings (not when viewing seller's own listings)
      queryObject.isActive = true;
    }

    // Build query
    let query = Classified.find(queryObject).populate('sellerId', 'name email');

    // Sort
    if (sort) {
      const sortBy = sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      // Sort by promoted first, then by creation date
      query = query.sort('-isPromoted -createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Classified.countDocuments(queryObject);

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const classifieds = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: classifieds.length,
      pagination,
      data: classifieds
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single classified ad
// @route   GET /api/classifieds/:id
// @access  Public
exports.getClassified = async (req, res) => {
  try {
    const classified = await Classified.findById(req.params.id).populate(
      'sellerId',
      'name email'
    );

    if (!classified) {
      return res.status(404).json({
        success: false,
        message: 'Classified ad not found'
      });
    }

    // Increment views
    classified.views += 1;
    await classified.save();

    res.status(200).json({
      success: true,
      data: classified
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update classified ad
// @route   PUT /api/classifieds/:id
// @access  Private
exports.updateClassified = async (req, res) => {
  try {
    let classified = await Classified.findById(req.params.id);

    if (!classified) {
      return res.status(404).json({
        success: false,
        message: 'Classified ad not found'
      });
    }

    // Check if user is the owner of the classified ad
    if (classified.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this classified ad'
      });
    }

    // Handle status field conversion between frontend and backend
    if (req.body.status) {
      req.body.isActive = req.body.status === 'active';
      delete req.body.status;
    }

    // Update classified ad
    classified = await Classified.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: classified
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete classified ad
// @route   DELETE /api/classifieds/:id
// @access  Private
exports.deleteClassified = async (req, res) => {
  try {
    const classified = await Classified.findById(req.params.id);

    if (!classified) {
      return res.status(404).json({
        success: false,
        message: 'Classified ad not found'
      });
    }

    // Check if user is the owner of the classified ad
    if (classified.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this classified ad'
      });
    }

    await classified.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
