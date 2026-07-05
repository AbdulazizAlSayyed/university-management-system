// Run once, manually, from the backend folder: node src/scripts/seedAdmin.js
// Creates the single admin account if one doesn't already exist yet.

require('dotenv').config();
const bcrypt = require('bcrypt');
const connectDB = require('../config/db');
const User = require('../models/User');

const ADMIN_EMAIL = 'admin@unihub.edu';
const ADMIN_PASSWORD = 'Admin@123'; // change this after first login

async function seedAdmin() {
  await connectDB();

  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('An admin already exists:', existing.email);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await User.create({
    firstName: 'System',
    lastName: 'Admin',
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: 'admin',
    status: 'active'
  });

  console.log('Admin created:');
  console.log('  Email:', admin.email);
  console.log('  Password:', ADMIN_PASSWORD, '(change this after logging in)');
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
