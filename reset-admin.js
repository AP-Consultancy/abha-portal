// Reset admin password script
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './server/.env' });

// Admin model
const adminSchema = new mongoose.Schema({
  enrollmentNo: String,
  name: String,
  email: String,
  password: String,
  role: String,
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    // Delete existing admin
    await Admin.deleteMany({ enrollmentNo: 'admin@school.com' });
    console.log('Deleted existing admin');

    // Create new admin with correct password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const admin = await Admin.create({
      enrollmentNo: 'admin@school.com',
      name: 'System Administrator',
      email: 'admin@school.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('✅ Admin created successfully!');
    console.log('Login ID: admin@school.com');
    console.log('Password: admin123');
    console.log('Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAdmin();