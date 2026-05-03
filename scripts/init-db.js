const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'bannu_masala.db');
const db = new Database(dbPath);

console.log('Initializing database at:', dbPath);

// Create Products table
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    gradient TEXT,
    badge TEXT,
    gallery TEXT DEFAULT '[]',
    custom_variants TEXT DEFAULT '[]',
    price_250g INTEGER NOT NULL,
    price_500g INTEGER NOT NULL,
    price_1kg INTEGER NOT NULL
  )
`);

// Backfill columns for older local DBs
try { db.exec(`ALTER TABLE products ADD COLUMN gallery TEXT DEFAULT '[]'`); } catch {}
try { db.exec(`ALTER TABLE products ADD COLUMN custom_variants TEXT DEFAULT '[]'`); } catch {}

// Create Orders table
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    subtotal INTEGER NOT NULL,
    shipping INTEGER NOT NULL,
    total INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create Order Items table
db.exec(`
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    variant TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
  )
`);

console.log('Tables created successfully.');

// Check if products exist, otherwise seed
const countStmt = db.prepare('SELECT count(*) as count FROM products');
const row = countStmt.get();

if (row.count === 0) {
  console.log('Seeding initial dummy products...');
  
  const insertProduct = db.prepare(`
    INSERT INTO products (name, slug, description, image, gradient, badge, price_250g, price_500g, price_1kg) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const products = [
    {
      name: "Bannu Kabab Masala",
      slug: "bannu-kabab-masala",
      description: "The authentic taste of Bannu! A specially crafted blend of spices that gives your kebabs a rich, smoky flavor unique to the Khyber Pakhtunkhwa region.",
      image: "/products/kabab-masala.png",
      gradient: "linear-gradient(135deg, #7B1C1C 0%, #C9932A 100%)",
      badge: "Bestseller",
      price_250g: 280, price_500g: 520, price_1kg: 950
    },
    {
      name: "Garam Masala",
      slug: "garam-masala",
      description: "A warming blend of cinnamon, cardamom, cloves, and black pepper. This aromatic mix elevates any dish with a depth of flavor that is truly irresistible.",
      image: "/products/garam-masala.png",
      gradient: "linear-gradient(135deg, #5C3317 0%, #C9932A 100%)",
      badge: null,
      price_250g: 240, price_500g: 450, price_1kg: 850
    },
    {
      name: "Chicken Karahi Masala",
      slug: "chicken-karahi-masala",
      description: "Bold, vibrant, and full of life. This masala is perfected for the quick sizzle of a karahi, delivering that restaurant-quality taste right in your home kitchen.",
      image: "/products/karahi-masala.png",
      gradient: "linear-gradient(135deg, #8B2500 0%, #D4541A 100%)",
      badge: "Popular",
      price_250g: 260, price_500g: 490, price_1kg: 920
    },
    {
      name: "Biryani Masala",
      slug: "biryani-masala",
      description: "Infused with saffron, star anise, and mace, this biryani masala layers fragrant and complex flavors to create a truly royal rice dish every single time.",
      image: "/products/biryani-masala.png",
      gradient: "linear-gradient(135deg, #7B4F00 0%, #C9932A 100%)",
      badge: null,
      price_250g: 270, price_500g: 500, price_1kg: 940
    },
    {
      name: "Namkeen Gosht Masala",
      slug: "namkeen-gosht-masala",
      description: "The soul of Peshawari cuisine. Minimal yet powerful, this blend of rock salt, black pepper and aromatic spices lets the natural flavor of the meat shine through.",
      image: "/products/namkeen-masala.png",
      gradient: "linear-gradient(135deg, #3D3D3D 0%, #7B1C1C 100%)",
      badge: "Signature",
      price_250g: 290, price_500g: 540, price_1kg: 1000
    },
    {
      name: "Haleem Masala",
      slug: "haleem-masala",
      description: "This slow-cook masala expertly balances the earthy richness of lentils with a complex spice profile, making your haleem thick, hearty and deeply satisfying.",
      image: null,
      gradient: "linear-gradient(135deg, #6B4226 0%, #C9932A 100%)",
      badge: null,
      price_250g: 250, price_500g: 470, price_1kg: 880
    },
    {
      name: "Paye Masala",
      slug: "paye-masala",
      description: "Wake up to the hearty richness of slow-cooked trotters. Our Paye Masala is crafted to create a deeply flavored, collagen-rich broth that warms the bones.",
      image: null,
      gradient: "linear-gradient(135deg, #704214 0%, #B87333 100%)",
      badge: null,
      price_250g: 265, price_500g: 495, price_1kg: 930
    },
    {
      name: "Qorma Masala",
      slug: "qorma-masala",
      description: "An elegant, regal blend inspired by Mughal culinary traditions. Rich with saffron and rose, this masala transforms your qorma into a feast fit for royalty.",
      image: null,
      gradient: "linear-gradient(135deg, #7B1C1C 0%, #8B6914 100%)",
      badge: null,
      price_250g: 255, price_500g: 480, price_1kg: 900
    },
    {
      name: "Chaat Masala",
      slug: "chaat-masala",
      description: "Tangy, spicy, and irresistibly addictive! Our chaat masala combines amchur, black salt, and cumin for the perfect zing on fruits, chaats, and snacks.",
      image: null,
      gradient: "linear-gradient(135deg, #4A7C00 0%, #C9932A 100%)",
      badge: null,
      price_250g: 220, price_500g: 400, price_1kg: 750
    },
    {
      name: "Daal Masala",
      slug: "daal-masala",
      description: "Transform a humble bowl of lentils into a restaurant-worthy dish. This masala captures the essence of a perfect tarka — smoky, aromatic and soul-satisfying.",
      image: null,
      gradient: "linear-gradient(135deg, #C9932A 0%, #7B4500 100%)",
      badge: null,
      price_250g: 230, price_500g: 420, price_1kg: 790
    }
  ];

  const insertMany = db.transaction((prods) => {
    for (const p of prods) {
      insertProduct.run(p.name, p.slug, p.description, p.image, p.gradient, p.badge, p.price_250g, p.price_500g, p.price_1kg);
    }
  });

  insertMany(products);
  console.log('Seeded 10 dummy products into database.');
}

db.close();
console.log('Database initialization complete.');
