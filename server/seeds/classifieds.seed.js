const classifieds = [
  {
    title: 'iPhone 13 Pro Max - 256GB - Barely Used',
    description: 'Selling my iPhone 13 Pro Max, 256GB storage, Sierra Blue color. Purchased 3 months ago, barely used, in perfect condition with no scratches. Comes with original box, charger, and accessories. Still under Apple warranty.',
    price: 230000,
    category: 'Electronics',
    region: 'Lahore',
    images: [
      'https://example.com/images/iphone-13-1.jpg',
      'https://example.com/images/iphone-13-2.jpg'
    ],
    condition: 'Like New',
    contactPhone: '+92 321 1234567',
    contactEmail: 'seller@example.com',
    isActive: true,
    isPromoted: true,
    views: 145
  },
  {
    title: '10 Marla House for Sale in DHA Phase 6',
    description: 'Beautiful 10 marla house in DHA Phase 6, Lahore. 5 bedrooms, 4 bathrooms, modern kitchen, spacious living room, dining area, servant quarters, and a lovely garden. Recently renovated with high-quality materials. Close to commercial area, mosque, and park.',
    price: 45000000,
    category: 'Real Estate',
    region: 'Lahore',
    images: [
      'https://example.com/images/dha-house-1.jpg',
      'https://example.com/images/dha-house-2.jpg',
      'https://example.com/images/dha-house-3.jpg'
    ],
    condition: 'Good',
    contactPhone: '+92 300 9876543',
    contactEmail: 'realtor@example.com',
    isActive: true,
    isPromoted: true,
    views: 320
  },
  {
    title: 'Toyota Corolla GLi 2019 - Well Maintained',
    description: 'Toyota Corolla GLi 2019 model, manual transmission, white color. Only 25,000 km driven, first owner, maintained by Toyota dealership. New tires, perfect engine condition, no accidents.',
    price: 3200000,
    category: 'Vehicles',
    region: 'Karachi',
    images: [
      'https://example.com/images/corolla-1.jpg',
      'https://example.com/images/corolla-2.jpg'
    ],
    condition: 'Good',
    contactPhone: '+92 333 5555555',
    contactEmail: 'carseller@example.com',
    isActive: true,
    isPromoted: false,
    views: 210
  },
  {
    title: 'Professional Photography Services',
    description: 'Professional photography services for weddings, corporate events, product shoots, and portraits. Using high-end Canon equipment. Packages start from Rs. 25,000. Book now for the upcoming wedding season!',
    price: 25000,
    category: 'Services',
    region: 'Islamabad',
    images: [
      'https://example.com/images/photography-1.jpg',
      'https://example.com/images/photography-2.jpg'
    ],
    condition: 'New',
    contactPhone: '+92 345 1122334',
    contactEmail: 'photographer@example.com',
    isActive: true,
    isPromoted: false,
    views: 95
  },
  {
    title: 'Gaming PC - RTX 3070, Ryzen 7, 32GB RAM',
    description: 'High-end gaming PC with RTX 3070 graphics card, AMD Ryzen 7 5800X processor, 32GB DDR4 RAM, 1TB NVMe SSD, 2TB HDD, liquid cooling, RGB lighting. Perfect for gaming and content creation. Barely used, selling due to relocation.',
    price: 350000,
    category: 'Electronics',
    region: 'Karachi',
    images: [
      'https://example.com/images/gaming-pc-1.jpg',
      'https://example.com/images/gaming-pc-2.jpg'
    ],
    condition: 'Like New',
    contactPhone: '+92 312 9988776',
    contactEmail: 'gamer@example.com',
    isActive: true,
    isPromoted: false,
    views: 178
  },
  {
    title: 'Shalwar Kameez Collection - Wholesale',
    description: 'Wholesale collection of men\'s and women\'s shalwar kameez. High-quality fabric, various designs and sizes available. Minimum order quantity: 10 pieces. Great opportunity for retailers and boutique owners.',
    price: 15000,
    category: 'Clothing',
    region: 'Faisalabad',
    images: [
      'https://example.com/images/shalwar-kameez-1.jpg',
      'https://example.com/images/shalwar-kameez-2.jpg'
    ],
    condition: 'New',
    contactPhone: '+92 321 7788990',
    contactEmail: 'clothing@example.com',
    isActive: true,
    isPromoted: false,
    views: 85
  },
  {
    title: 'Accounting & Tax Filing Services',
    description: 'Professional accounting and tax filing services for individuals and businesses. Income tax returns, sales tax registration, company registration, and bookkeeping services. Certified accountant with 10+ years of experience.',
    price: 10000,
    category: 'Services',
    region: 'Lahore',
    images: [
      'https://example.com/images/accounting-1.jpg'
    ],
    condition: 'New',
    contactPhone: '+92 333 4455667',
    contactEmail: 'accountant@example.com',
    isActive: true,
    isPromoted: false,
    views: 65
  },
  {
    title: 'Samsung 55" 4K Smart TV - 1 Year Old',
    description: 'Samsung 55-inch 4K Ultra HD Smart LED TV, 1 year old, in excellent condition. All features working perfectly. Selling due to upgrade. Original remote and box included.',
    price: 85000,
    category: 'Electronics',
    region: 'Islamabad',
    images: [
      'https://example.com/images/samsung-tv-1.jpg',
      'https://example.com/images/samsung-tv-2.jpg'
    ],
    condition: 'Good',
    contactPhone: '+92 345 1122334',
    contactEmail: 'electronics@example.com',
    isActive: true,
    isPromoted: false,
    views: 110
  },
  {
    title: 'Honda CD 70 2021 - Low Mileage',
    description: 'Honda CD 70 2021 model, red color, only 5,000 km driven. First owner, all documents complete, excellent fuel average. Perfect condition, regular maintenance.',
    price: 95000,
    category: 'Vehicles',
    region: 'Rawalpindi',
    images: [
      'https://example.com/images/honda-70-1.jpg',
      'https://example.com/images/honda-70-2.jpg'
    ],
    condition: 'Like New',
    contactPhone: '+92 312 9988776',
    contactEmail: 'bike@example.com',
    isActive: true,
    isPromoted: false,
    views: 130
  },
  {
    title: 'Office Space for Rent - Blue Area',
    description: 'Commercial office space available for rent in Blue Area, Islamabad. 1,200 sq ft, fully furnished with 4 cabins, conference room, reception area, and kitchen. 24/7 security, backup power, and parking available.',
    price: 150000,
    category: 'Real Estate',
    region: 'Islamabad',
    images: [
      'https://example.com/images/office-1.jpg',
      'https://example.com/images/office-2.jpg'
    ],
    condition: 'Good',
    contactPhone: '+92 321 7788990',
    contactEmail: 'property@example.com',
    isActive: true,
    isPromoted: true,
    views: 200
  }
];

module.exports = classifieds;
