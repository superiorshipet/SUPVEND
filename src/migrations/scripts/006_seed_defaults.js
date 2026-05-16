/**
 * Migration 006 — Seed default data
 * Seeds: admin user, default categories
 */
const bcrypt = require('bcryptjs');

module.exports = {
  async up(mongoose) {
    const db = mongoose.connection.db;

    // ─── Admin User ──────────────────────────────────
    const usersCol = db.collection('users');
    const existing = await usersCol.findOne({ email: 'admin@supvend.com' });
    if (!existing) {
      const hashedPw = await bcrypt.hash('Admin@123', 12);
      await usersCol.insertOne({
        name: 'Super Admin',
        email: 'admin@supvend.com',
        password: hashedPw,
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        loginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('    → Seeded admin user (admin@supvend.com / Admin@123)');
    } else {
      console.log('    → Admin user already exists');
    }

    // ─── Default Categories ──────────────────────────
    const categoriesCol = db.collection('categories');
    const defaultCategories = [
      { name: 'Electronics', slug: 'electronics', icon: 'Laptop', description: 'Gadgets, phones, laptops and more', order: 1 },
      { name: 'Fashion', slug: 'fashion', icon: 'Shirt', description: 'Clothing, accessories and footwear', order: 2 },
      { name: 'Home & Living', slug: 'home-living', icon: 'Home', description: 'Furniture, decor and home essentials', order: 3 },
      { name: 'Sports & Outdoors', slug: 'sports-outdoors', icon: 'Dumbbell', description: 'Sports equipment and outdoor gear', order: 4 },
      { name: 'Books & Media', slug: 'books-media', icon: 'BookOpen', description: 'Books, music, movies and games', order: 5 },
      { name: 'Health & Beauty', slug: 'health-beauty', icon: 'Heart', description: 'Personal care, cosmetics and wellness', order: 6 },
      { name: 'Toys & Kids', slug: 'toys-kids', icon: 'Baby', description: 'Toys, baby products and kids clothing', order: 7 },
      { name: 'Automotive', slug: 'automotive', icon: 'Car', description: 'Auto parts, accessories and tools', order: 8 },
    ];

    for (const cat of defaultCategories) {
      const exists = await categoriesCol.findOne({ slug: cat.slug });
      if (!exists) {
        await categoriesCol.insertOne({
          ...cat,
          parentCategory: null,
          level: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
    console.log(`    → Seeded ${defaultCategories.length} default categories`);
  },

  async down(mongoose) {
    const db = mongoose.connection.db;
    await db.collection('categories').deleteMany({
      slug: { $in: ['electronics','fashion','home-living','sports-outdoors','books-media','health-beauty','toys-kids','automotive'] }
    });
    await db.collection('users').deleteOne({ email: 'admin@supvend.com' });
    console.log('    → Removed seed data (admin + categories)');
  },
};
