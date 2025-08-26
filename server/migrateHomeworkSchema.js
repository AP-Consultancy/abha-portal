const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB for migration");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

// Migration function
async function migrateHomeworkSchema() {
  try {
    console.log("🔄 Starting homework schema migration...");
    
    // Get the homework collection
    const db = mongoose.connection.db;
    const homeworkCollection = db.collection("homeworks");
    
    // Find all homework documents that still have the section field
    const homeworkWithSection = await homeworkCollection.find({ section: { $exists: true } }).toArray();
    
    if (homeworkWithSection.length === 0) {
      console.log("✅ No homework records with section field found. Schema is already up to date.");
      return;
    }
    
    console.log(`📝 Found ${homeworkWithSection.length} homework records with section field`);
    
    // Remove the section field from all homework documents
    const result = await homeworkCollection.updateMany(
      { section: { $exists: true } },
      { $unset: { section: "" } }
    );
    
    console.log(`✅ Successfully removed section field from ${result.modifiedCount} homework records`);
    
    // Verify the migration
    const remainingWithSection = await homeworkCollection.find({ section: { $exists: true } }).toArray();
    if (remainingWithSection.length === 0) {
      console.log("✅ Migration completed successfully!");
    } else {
      console.log(`⚠️  Warning: ${remainingWithSection.length} records still have section field`);
    }
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await connectToDatabase();
    await migrateHomeworkSchema();
    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("💥 Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { migrateHomeworkSchema };
