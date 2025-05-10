const mongoose = require("mongoose");
const Discount = require("../models/discount");
const dotenv = require("dotenv");

mongoose
  .connect("mongodb://localhost:27017/jwt-auth", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to jwt-auth database"))
  .catch((err) => console.error("Database connection error:", err));

async function seedDiscounts() {
  await Discount.deleteMany({});
  await Discount.create([
    {
      code: "WELCOME10",
      discountType: "percentage",
      value: 10,
      startDate: new Date(),
      endDate: new Date("2025-12-31"),
      usageLimit: 100,
    },
    {
      code: "FLAT50",
      discountType: "fixed",
      value: 50,
      startDate: new Date(),
      endDate: new Date("2025-12-31"),
    },
  ]);
  console.log("Discounts seeded!");
  mongoose.disconnect();
}

seedDiscounts();
