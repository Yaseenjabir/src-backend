import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from "../constants/productCategories.js";

dotenv.config();

const PRODUCT_COUNT = 50;
const CUSTOMER_COUNT = 10;
const PRICE_SLABS = [
  50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1500,
  1800, 2000, 2500, 3000,
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function categoryPrefix(category: string): string {
  const words = category.split("_").filter(Boolean);
  if (words.length === 0) return "PRD";
  if (words.length === 1) return words[0].slice(0, 3);
  return words.map((w) => w[0]).join("");
}

async function generateProductSku(category: string): Promise<string> {
  const prefix = categoryPrefix(category).toUpperCase();

  for (let attempt = 0; attempt < 15; attempt += 1) {
    const stamp = Date.now().toString().slice(-6);
    const rand = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const candidate = `${prefix}-${stamp}${rand}`;

    const exists = await Product.exists({ sku: candidate });
    if (!exists) return candidate;
  }

  throw new Error("Unable to generate unique product SKU");
}

function buildCustomer(index: number) {
  const seq = (index + 1).toString().padStart(2, "0");
  return {
    name: `Customer ${seq}`,
    shop_name: `Shop ${seq}`,
    address: `Street ${seq}, Gujrat`,
    phone: `0300${randomInt(1000000, 9999999)}`,
    notes: "Seeded dummy customer",
    is_active: true,
  };
}

function buildProductName(category: ProductCategory, index: number): string {
  const seq = (index + 1).toString().padStart(2, "0");
  return `${category.replace(/_/g, " ")} ${seq}`;
}

function randomPriceFromSlabs(): number {
  const index = randomInt(0, PRICE_SLABS.length - 1);
  return PRICE_SLABS[index];
}

async function seedProducts() {
  const products = [];

  for (let i = 0; i < PRODUCT_COUNT; i += 1) {
    const category = PRODUCT_CATEGORIES[i % PRODUCT_CATEGORIES.length];
    const sku = await generateProductSku(category);

    products.push({
      sku,
      name: buildProductName(category, i),
      category,
      price: randomPriceFromSlabs(),
      is_active: true,
    });
  }

  await Product.insertMany(products);
  return products.length;
}

async function seedCustomers() {
  const customers = Array.from({ length: CUSTOMER_COUNT }, (_, i) =>
    buildCustomer(i),
  );

  await Customer.insertMany(customers);
  return customers.length;
}

async function main() {
  try {
    await connectDB();

    const [insertedProducts, insertedCustomers] = await Promise.all([
      seedProducts(),
      seedCustomers(),
    ]);

    console.log(
      `Seed completed: ${insertedProducts} products, ${insertedCustomers} customers inserted.`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Seed failed:", message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void main();
