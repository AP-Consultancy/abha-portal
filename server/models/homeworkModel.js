const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teacher",
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "class",
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subject",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
}, {
  // Add strict: false to allow fields not in schema (for backward compatibility)
  strict: false,
  // Add timestamps for better tracking
  timestamps: true
});

// Pre-save middleware to remove section field if it exists
homeworkSchema.pre('save', function(next) {
  if (this.section !== undefined) {
    delete this.section;
  }
  next();
});

// Pre-update middleware to remove section field
homeworkSchema.pre('findOneAndUpdate', function(next) {
  if (this._update && this._update.section !== undefined) {
    delete this._update.section;
  }
  next();
});

homeworkSchema.pre('updateMany', function(next) {
  if (this._update && this._update.section !== undefined) {
    delete this._update.section;
  }
  next();
});

const Homework = mongoose.model("Homework", homeworkSchema);

module.exports = Homework;