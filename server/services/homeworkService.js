const Homework = require("../models/homeworkModel");

class HomeworkService {
  async createHomework(homeworkData) {
    try {
      console.log('Creating homework with data:', homeworkData);
      
      // Validate that required fields exist
      if (!homeworkData.teacherId) {
        throw new Error('teacherId is required');
      }
      if (!homeworkData.classId) {
        throw new Error('classId is required');
      }
      if (!homeworkData.subjectId) {
        throw new Error('subjectId is required');
      }
      if (!homeworkData.title) {
        throw new Error('title is required');
      }
      if (!homeworkData.description) {
        throw new Error('description is required');
      }
      if (!homeworkData.deadline) {
        throw new Error('deadline is required');
      }
      
      console.log('All required fields present, creating homework...');
      const homework = await Homework.create(homeworkData);
      console.log('Homework created successfully:', homework._id);
      
      // Verify the created record
      const createdHomework = await Homework.findById(homework._id);
      console.log('Created homework record:', {
        id: createdHomework._id,
        title: createdHomework.title,
        teacherId: createdHomework.teacherId,
        classId: createdHomework.classId,
        subjectId: createdHomework.subjectId,
        deadline: createdHomework.deadline
      });
      
      return homework;
    } catch (err) {
      console.error('Error creating homework:', err);
      throw err;
    }
  }

  async getHomework(homeworkId) {
    const homework = await Homework.findById(homeworkId)
      .populate('teacherId', 'name email')
      .populate('classId', 'name section')
      .populate('subjectId', 'name');
    return homework;
  }
  
  async updateHomework(homeworkId, homeworkData) {
    const homework = await Homework.findByIdAndUpdate(homeworkId, homeworkData, { new: true })
      .populate('teacherId', 'name email')
      .populate('classId', 'name section')
      .populate('subjectId', 'name');
    return homework;
  }
  
  async deleteHomework(homeworkId) {
    await Homework.findByIdAndDelete(homeworkId);
  }

  async getHomeworkByClass(classId) {
    const homework = await Homework.find({ classId })
      .populate('teacherId', 'name email')
      .populate('classId', 'name section')
      .populate('subjectId', 'name')
      .sort({ deadline: 1 });
    return homework;
  }

  async getAllHomework() {
    try {
      console.log('Attempting to fetch all homework...');
      
      // First, let's see what we have without population
      const rawHomework = await Homework.find().sort({ deadline: 1 });
      console.log(`Raw homework records found: ${rawHomework.length}`);
      
      if (rawHomework.length > 0) {
        console.log('Sample raw homework record:', {
          id: rawHomework[0]._id,
          title: rawHomework[0].title,
          teacherId: rawHomework[0].teacherId,
          classId: rawHomework[0].classId,
          subjectId: rawHomework[0].subjectId,
          deadline: rawHomework[0].deadline
        });
      }
      
      // Now try with population
      const homework = await Homework.find()
        .populate('teacherId', 'name email')
        .populate('classId', 'name section')
        .populate('subjectId', 'name')
        .sort({ deadline: 1 });
      
      console.log(`Successfully fetched ${homework.length} homework records with population`);
      
      if (homework.length > 0) {
        console.log('Sample populated homework record:', {
          id: homework[0]._id,
          title: homework[0].title,
          teacherId: homework[0].teacherId,
          classId: homework[0].classId,
          subjectId: homework[0].subjectId,
          deadline: homework[0].deadline
        });
      }
      
      return homework;
    } catch (err) {
      console.error('Error in getAllHomework:', err);
      // If population fails, try without population
      try {
        console.log('Population failed, trying without population...');
        const homeworkWithoutPopulate = await Homework.find().sort({ deadline: 1 });
        console.log(`Successfully fetched ${homeworkWithoutPopulate.length} homework records without population`);
        return homeworkWithoutPopulate;
      } catch (fallbackErr) {
        console.error('Fallback query also failed:', fallbackErr);
        throw err; // Throw the original error
      }
    }
  }

  async getHomeworkByTeacher(teacherId) {
    const homework = await Homework.find({ teacherId })
      .populate('teacherId', 'name email')
      .populate('classId', 'name section')
      .populate('subjectId', 'name')
      .sort({ deadline: 1 });
    return homework;
  }


}

module.exports = new HomeworkService();
