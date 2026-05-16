/**
 * Migration 001 — Create core collections & indexes
 * Creates: users, vendors, categories
 */

// Helper: create index ignoring "already exists" errors
async function safeIndex(col, spec, opts) {
  try { await col.createIndex(spec, opts); }
  catch (e) { if (e.code !== 85 && e.code !== 86) throw e; } // 85=IndexOptionsConflict, 86=IndexKeySpecsConflict
}

module.exports = {
  async up(mongoose) {
    const db = mongoose.connection.db;

    // ─── Users ───────────────────────────────────────
    try { await db.createCollection('users'); console.log('    → Created: users'); }
    catch (e) { if (e.codeName === 'NamespaceExists') console.log('    → Exists: users'); else throw e; }

    const u = db.collection('users');
    await safeIndex(u, { email: 1 }, { unique: true, name: 'idx_users_email' });
    await safeIndex(u, { role: 1 }, { name: 'idx_users_role' });
    await safeIndex(u, { isActive: 1 }, { name: 'idx_users_active' });
    await safeIndex(u, { createdAt: -1 }, { name: 'idx_users_created' });
    console.log('    → Ensured indexes: users');

    // ─── Vendors ─────────────────────────────────────
    try { await db.createCollection('vendors'); console.log('    → Created: vendors'); }
    catch (e) { if (e.codeName === 'NamespaceExists') console.log('    → Exists: vendors'); else throw e; }

    const v = db.collection('vendors');
    await safeIndex(v, { userId: 1 }, { unique: true, name: 'idx_vendors_userId' });
    await safeIndex(v, { storeName: 1 }, { unique: true, name: 'idx_vendors_storeName' });
    await safeIndex(v, { isApproved: 1 }, { name: 'idx_vendors_approved' });
    await safeIndex(v, { rating: -1 }, { name: 'idx_vendors_rating' });
    await safeIndex(v, { totalSales: -1 }, { name: 'idx_vendors_sales' });
    console.log('    → Ensured indexes: vendors');

    // ─── Categories ──────────────────────────────────
    try { await db.createCollection('categories'); console.log('    → Created: categories'); }
    catch (e) { if (e.codeName === 'NamespaceExists') console.log('    → Exists: categories'); else throw e; }

    const c = db.collection('categories');
    await safeIndex(c, { name: 1 }, { unique: true, name: 'idx_categories_name' });
    await safeIndex(c, { slug: 1 }, { unique: true, name: 'idx_categories_slug' });
    await safeIndex(c, { parentCategory: 1 }, { name: 'idx_categories_parent' });
    await safeIndex(c, { level: 1 }, { name: 'idx_categories_level' });
    await safeIndex(c, { isActive: 1 }, { name: 'idx_categories_active' });
    console.log('    → Ensured indexes: categories');
  },

  async down(mongoose) {
    const db = mongoose.connection.db;
    await db.collection('categories').drop().catch(() => {});
    await db.collection('vendors').drop().catch(() => {});
    await db.collection('users').drop().catch(() => {});
    console.log('    → Dropped: users, vendors, categories');
  },
};
