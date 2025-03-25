const mongoose = require("mongoose");
const { createAdmin } = require("../controller/admin.controller"); // Function to create the default admin user

const dbConfiguration = {
  connect: async () => {
    try {
      // Connect to MongoDB using environment variable
      await mongoose.connect(process.env.MONGODB_CONNECTION_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log("✅ Connected to MongoDB successfully.");

      // Create the admin user during server startup
      await createAdmin();
    } catch (error) {
      console.error("❌ Error connecting to MongoDB:", error);

      // Exit the process to prevent running in a broken state
      process.exit(1);
    }
  },
};

module.exports = dbConfiguration;
