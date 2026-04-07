require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/modules/users/user.model");

const ADMIN = {
  name: "Admin",
  email: "admin@sellify.com",
  password: "Admin@1234",
  role: "admin",
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    console.log("⚠️  Admin already exists:", existing.email);
    process.exit(0);
  }

  await User.create(ADMIN);
  console.log("🎉 Admin created successfully!");
  console.log("   Email   :", ADMIN.email);
  console.log("   Password:", ADMIN.password);
  console.log("   Role    :", ADMIN.role);

  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
