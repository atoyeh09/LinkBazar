const bcrypt = require('bcrypt');

const users = [
  {
    name: 'Admin User',
    email: 'admin@linkbzaar.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    phone: '+92 300 1234567',
    address: 'Blue Area',
    city: 'Islamabad',
    region: 'Islamabad',
    isActive: true
  },
  {
    name: 'Seller User',
    email: 'seller@linkbzaar.com',
    password: bcrypt.hashSync('seller123', 10),
    role: 'seller',
    phone: '+92 321 9876543',
    address: 'Gulberg',
    city: 'Lahore',
    region: 'Punjab',
    isActive: true
  },
  {
    name: 'Regular User',
    email: 'user@linkbzaar.com',
    password: bcrypt.hashSync('user123', 10),
    role: 'user',
    phone: '+92 333 5555555',
    address: 'Clifton',
    city: 'Karachi',
    region: 'Sindh',
    isActive: true
  },
  {
    name: 'Ali Khan',
    email: 'ali@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'seller',
    phone: '+92 345 1122334',
    address: 'DHA Phase 5',
    city: 'Karachi',
    region: 'Sindh',
    isActive: true
  },
  {
    name: 'Fatima Ahmed',
    email: 'fatima@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'seller',
    phone: '+92 312 9988776',
    address: 'Bahria Town',
    city: 'Islamabad',
    region: 'Islamabad',
    isActive: true
  },
  {
    name: 'Usman Malik',
    email: 'usman@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'user',
    phone: '+92 333 4455667',
    address: 'Model Town',
    city: 'Lahore',
    region: 'Punjab',
    isActive: true
  },
  {
    name: 'Ayesha Siddiqui',
    email: 'ayesha@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'user',
    phone: '+92 321 7788990',
    address: 'Saddar',
    city: 'Peshawar',
    region: 'KPK',
    isActive: true
  }
];

module.exports = users;
