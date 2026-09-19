/**
 * Migration 003 — Create order & cart collections
 */

async function safeIndex(col, spec, opts) {
  try { await col.createIndex(spec, opts); }
  catch (e) { if (e.code !== 85 && e.code !== 86) throw e; }
}

module.exports = {
  async up(mongoose) {
    const db = mongoose.connection.db;

    try { await db.createCollection('orders'); console.log('    → Created: orders'); }
    catch (e) { if (e.codeName === 'NamespaceExists') console.log('    → Exists: orders'); else throw e; }

    const o = db.collection('orders');
    await safeIndex(o, { orderNumber: 1 }, { unique: true, name: 'idx_orders_number' });
    await safeIndex(o, { userId: 1 }, { name: 'idx_orders_user' });
    await safeIndex(o, { createdAt: -1 }, { name: 'idx_orders_created' });
    await safeIndex(o, { paymentStatus: 1 }, { name: 'idx_orders_payment' });
    await safeIndex(o, { 'items.vendorId': 1 }, { name: 'idx_orders_vendor' });
    console.log('    → Ensured indexes: orders');

    try { await db.createCollection('carts'); console.log('    → Created: carts'); }
    catch (e) { if (e.codeName === 'NamespaceExists') console.log('    → Exists: carts'); else throw e; }

    const c = db.collection('carts');
    await safeIndex(c, { userId: 1 }, { unique: true, name: 'idx_carts_user' });
    await safeIndex(c, { expiresAt: 1 }, { expireAfterSeconds: 0, name: 'idx_carts_ttl' });
    console.log('    → Ensured indexes: carts');
  },

  async down(mongoose) {
    const db = mongoose.connection.db;
    await db.collection('carts').drop().catch(() => {});
    await db.collection('orders').drop().catch(() => {});
    console.log('    → Dropped: orders, carts');
  },
};
