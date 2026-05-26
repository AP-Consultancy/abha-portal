const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_VbJ8WwqnzrM1@ep-rapid-block-aq0pnt5i-pooler.c-8.us-east-1.aws.neon.tech/school_management?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false,
  },
});

// HANDLE DB ERRORS
pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL Error");

  console.error(err);
});

// CONNECT DATABASE
const connectDB = async () => {
  try {
    const client = await pool.connect();

    console.log("PostgreSQL Connected Successfully");

    client.release();
  } catch (error) {
    console.error("Database Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = {
  pool,
  connectDB,
};
