const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Order = require("../models/Order");
const Product = require("../models/Product");

// Load .env file
dotenv.config();

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/brandstore";

async function seedOrders() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Fetch sample products
    const products = await Product.find().limit(5);
    if (products.length === 0) {
      console.log("❌ No products found. Seed products before seeding orders.");
      return;
    }

    // Clear existing orders
    await Order.deleteMany();
    console.log("🗑️ Cleared previous orders");

    // Generate 3 sample orders
    const orders = [];

    for (let i = 1; i <= 3; i++) {
      const selectedItems = products.slice(0, 2);
      const items = selectedItems.map((product) => ({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: Math.floor(Math.random() * 3) + 1,
      }));

      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const shipping = 50;
      const tax = parseFloat((subtotal * 0.14).toFixed(2));
      const total = subtotal + shipping + tax;

      const order = {
        orderId: `ORD-${Date.now()}-${i}`,
        customer: {
          fullName: `Test User ${i}`,
          email: `user${i}@example.com`,
          phone: `01000000${i}`,
          address: {
            street: `123 Test Street ${i}`,
            city: "Cairo",
            postalCode: `1000${i}`,
          },
        },
        payment: {
          method: "creditCard",
          cardLast4: "1234",
        },
        items,
        totals: {
          subtotal,
          shipping,
          tax,
          total,
        },
        status: "processing",
      };

      orders.push(order);
    }

    await Order.insertMany(orders);
    console.log(`✅ Inserted ${orders.length} fake orders`);
  } catch (error) {
    console.error("❌ Error seeding orders:", error.message);
  } finally {
    mongoose.connection.close();
    console.log("🔌 Connection closed");
  }
}

seedOrders();
