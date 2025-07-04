const products = [
  {
    name: 'Samsung Galaxy S21',
    description: 'Brand new Samsung Galaxy S21 with 128GB storage, 8GB RAM, and a stunning display. Comes with 1-year warranty.',
    price: 150000,
    category: 'Electronics',
    brand: 'Samsung',
    condition: 'New',
    images: [
      'https://example.com/images/samsung-s21-1.jpg',
      'https://example.com/images/samsung-s21-2.jpg'
    ],
    url: 'https://www.samsung.com/pk/smartphones/galaxy-s21/',
    keywords: ['smartphone', 'android', 'samsung', 'galaxy', 'mobile phone'],
    isActive: true
  },
  {
    name: 'Apple MacBook Pro 2022',
    description: 'Apple MacBook Pro with M1 chip, 16GB RAM, 512GB SSD. Perfect for professionals and creatives.',
    price: 350000,
    category: 'Electronics',
    brand: 'Apple',
    condition: 'New',
    images: [
      'https://example.com/images/macbook-pro-1.jpg',
      'https://example.com/images/macbook-pro-2.jpg'
    ],
    url: 'https://www.apple.com/pk/macbook-pro/',
    keywords: ['laptop', 'macbook', 'apple', 'computer'],
    isActive: true
  },
  {
    name: 'Sony PlayStation 5',
    description: 'Sony PS5 console with one controller. Limited stock available. Grab yours now!',
    price: 120000,
    category: 'Electronics',
    brand: 'Sony',
    condition: 'New',
    images: [
      'https://example.com/images/ps5-1.jpg',
      'https://example.com/images/ps5-2.jpg'
    ],
    url: 'https://www.playstation.com/en-pk/ps5/',
    keywords: ['gaming', 'console', 'playstation', 'ps5', 'sony'],
    isActive: true
  },
  {
    name: 'Khaadi Embroidered Lawn Suit',
    description: 'Beautiful 3-piece embroidered lawn suit by Khaadi. Perfect for summer wear.',
    price: 7500,
    category: 'Clothing',
    brand: 'Khaadi',
    condition: 'New',
    images: [
      'https://example.com/images/khaadi-suit-1.jpg',
      'https://example.com/images/khaadi-suit-2.jpg'
    ],
    url: 'https://www.khaadi.com/pk/lawn-collection',
    keywords: ['clothing', 'women', 'lawn', 'suit', 'khaadi', 'embroidered'],
    isActive: true
  },
  {
    name: 'Outfitters Men\'s Denim Jacket',
    description: 'Stylish denim jacket for men by Outfitters. Available in multiple sizes.',
    price: 4500,
    category: 'Clothing',
    brand: 'Outfitters',
    condition: 'New',
    images: [
      'https://example.com/images/denim-jacket-1.jpg',
      'https://example.com/images/denim-jacket-2.jpg'
    ],
    url: 'https://outfitters.com.pk/collections/men-jackets',
    keywords: ['clothing', 'men', 'jacket', 'denim', 'outfitters'],
    isActive: true
  },
  {
    name: 'IKEA MALM Bed Frame',
    description: 'IKEA MALM bed frame, queen size, with storage. Easy to assemble.',
    price: 45000,
    category: 'Furniture',
    brand: 'IKEA',
    condition: 'New',
    images: [
      'https://example.com/images/ikea-bed-1.jpg',
      'https://example.com/images/ikea-bed-2.jpg'
    ],
    url: 'https://www.ikea.com/pk/en/p/malm-bed-frame-high-w-2-storage-boxes-white-luroey-s29129608/',
    keywords: ['furniture', 'bed', 'ikea', 'malm', 'bedroom'],
    isActive: true
  },
  {
    name: 'Honda Civic 2020',
    description: 'Honda Civic 2020 model, 1.8L engine, automatic transmission, low mileage, excellent condition.',
    price: 4500000,
    category: 'Vehicles',
    brand: 'Honda',
    condition: 'Like New',
    images: [
      'https://example.com/images/honda-civic-1.jpg',
      'https://example.com/images/honda-civic-2.jpg'
    ],
    url: null,
    keywords: ['car', 'honda', 'civic', 'vehicle', 'automobile'],
    isActive: true
  },
  {
    name: 'Suzuki Alto 2022',
    description: 'Suzuki Alto VXL 2022, only 5000 km driven, first owner, maintained by authorized dealer.',
    price: 2800000,
    category: 'Vehicles',
    brand: 'Suzuki',
    condition: 'Like New',
    images: [
      'https://example.com/images/suzuki-alto-1.jpg',
      'https://example.com/images/suzuki-alto-2.jpg'
    ],
    url: null,
    keywords: ['car', 'suzuki', 'alto', 'vehicle', 'automobile'],
    isActive: true
  },
  {
    name: '5 Marla House in Bahria Town',
    description: 'Beautiful 5 marla house in Bahria Town Phase 8, 3 bedrooms, 2 bathrooms, modern kitchen, small garden.',
    price: 18000000,
    category: 'Real Estate',
    brand: null,
    condition: 'Good',
    images: [
      'https://example.com/images/bahria-house-1.jpg',
      'https://example.com/images/bahria-house-2.jpg'
    ],
    url: null,
    keywords: ['house', 'real estate', 'bahria town', 'property', '5 marla'],
    isActive: true
  },
  {
    name: 'Web Development Services',
    description: 'Professional web development services. We create responsive, modern websites for businesses and individuals.',
    price: 50000,
    category: 'Services',
    brand: null,
    condition: 'New',
    images: [
      'https://example.com/images/web-dev-1.jpg',
      'https://example.com/images/web-dev-2.jpg'
    ],
    url: 'https://webdevpk.com',
    keywords: ['service', 'web development', 'website', 'programming'],
    isActive: true
  }
];

module.exports = products;
