/**
 * Migration 002 — Create product collections & indexes
 * Creates: products, productvariants
 */

async function safeIndex(col, spec, opts) {
  try { await col.createIndex(spec, opts); }
  catch (e) { if (e.code !== 85 && e.code !== 86) throw e; }
}

module.exports = {
  async up(mongoose) {
    const db = mongoose.connection.db;

    try { await db.createCollection('products'); console.log('    → Created: products'); }
    catch (e) { if (e.codeName === 'NamespaceExists') console.log('    → Exists: products'); else throw e; }

    const p = db.collection('products');
    await safeIndex(p, { name: 'text', description: 'text', tags: 'text' }, { name: 'idx_products_text', weights: { name: 10, tags: 5, description: 1 } });
    await safeIndex(p, { vendorId: 1 }, { name: 'idx_products_vendor' });
    await safeIndex(p, { categoryId: 1 }, { name: 'idx_products_category' });
    await safeIndex(p, { price: 1 }, { name: 'idx_products_price' });
    await safeIndex(p, { rating: -1 }, { name: 'idx_products_rating' });
    await safeIndex(p, { createdAt: -1 }, { name: 'idx_products_created' });
    await safeIndex(p, { productType: 1 }, { name: 'idx_products_type' });
    await safeIndex(p, { status: 1 }, { name: 'idx_products_status' });
    await safeIndex(p, { isApproved: 1 }, { name: 'idx_products_approved' });
    await safeIndex(p, { sku: 1 }, { unique: true, sparse: true, name: 'idx_products_sku' });
    console.log('    → Ensured indexes: products');

    try { await db.createCollection('productvariants'); console.log('    → Created: productvariants'); }
    catch (e) { if (e.codeName === 'NamespaceExists') console.log('    → Exists: productvariants'); else throw e; }

    const pv = db.collection('productvariants');
    await safeIndex(pv, { productId: 1, sku: 1 }, { name: 'idx_variants_product_sku' });
    await safeIndex(pv, { sku: 1 }, { unique: true, name: 'idx_variants_sku' });
    await safeIndex(pv, { 'attributes.size': 1, 'attributes.color': 1 }, { name: 'idx_variants_attrs' });
    console.log('    → Ensured indexes: productvariants');
  },

  async down(mongoose) {
    const db = mongoose.connection.db;
    await db.collection('productvariants').drop().catch(() => {});
    await db.collection('products').drop().catch(() => {});
    console.log('    → Dropped: products, productvariants');
  },
};
