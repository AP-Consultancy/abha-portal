const mongoose = require('mongoose');
require('dotenv').config();

// Import models
require('./models/homeworkModel');
require('./models/teacherModel');
require('./models/classModel');
require('./models/subjectModel');

const Homework = require('./models/homeworkModel');

async function testHomework() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Test 1: Check raw homework data
    console.log('\n=== Test 1: Raw Homework Data ===');
    const rawHomework = await Homework.find().limit(5);
    console.log(`Found ${rawHomework.length} homework records`);
    
    if (rawHomework.length > 0) {
      console.log('Sample homework record:');
      console.log(JSON.stringify(rawHomework[0], null, 2));
    }

    // Test 2: Check homework with population
    console.log('\n=== Test 2: Homework with Population ===');
    const populatedHomework = await Homework.find()
      .populate('teacherId', 'name email')
      .populate('classId', 'name section')
      .populate('subjectId', 'name')
      .limit(5);
    
    console.log(`Found ${populatedHomework.length} populated homework records`);
    
    if (populatedHomework.length > 0) {
      console.log('Sample populated homework record:');
      console.log(JSON.stringify(populatedHomework[0], null, 2));
    }

    // Test 3: Check if references exist
    console.log('\n=== Test 3: Reference Validation ===');
    if (rawHomework.length > 0) {
      const sample = rawHomework[0];
      console.log('Sample homework references:');
      console.log('teacherId:', sample.teacherId);
      console.log('classId:', sample.classId);
      console.log('subjectId:', sample.subjectId);
      
      // Check if these IDs exist in their respective collections
      const Teacher = require('./models/teacherModel');
      const Class = require('./models/classModel');
      const Subject = require('./models/subjectModel');
      
      const teacherExists = await Teacher.findById(sample.teacherId);
      const classExists = await Class.findById(sample.classId);
      const subjectExists = await Subject.findById(sample.subjectId);
      
      console.log('Teacher exists:', !!teacherExists);
      console.log('Class exists:', !!classExists);
      console.log('Subject exists:', !!subjectExists);
    }

  } catch (error) {
    console.error('Error testing homework:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testHomework();
