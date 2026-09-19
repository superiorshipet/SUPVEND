/**
 * Migration 005 — Financial & support collections
 * Creates: wallets, wallettransactions, coupons, payouts, reviews, notifications
 */

async function safeIndex(col, spec, opts) {
  try { await col.createIndex(spec, opts); }
  catch (e) { if (e.code !== 85 && e.code !== 86) throw e; }
}

module.exports = {
  async up(mongoose) {
    const db = mongoose.connection.db;
    const create = async (name) => {
      try { await db.createCollection(name); console.log(`    → Created: ${name}`); }
      catch (e) { if (e.codeName === 'NamespaceExists') console.log(`    → Exists: ${name}`); else throw e; }
    };

    await create('wallets');
    await safeIndex(db.collection('wallets'), { userId: 1 }, { unique: true, name: 'idx_wallets_user' });

    await create('wallettransactions');
    const wt = db.collection('wallettransactions');
    await safeIndex(wt, { walletId: 1, createdAt: -1 }, { name: 'idx_wt_wallet_created' });
    await safeIndex(wt, { userId: 1 }, { name: 'idx_wt_user' });
    await safeIndex(wt, { reference: 1 }, { name: 'idx_wt_reference' });
    await safeIndex(wt, { type: 1 }, { name: 'idx_wt_type' });

    await create('coupons');
    const co = db.collection('coupons');
    await safeIndex(co, { code: 1 }, { unique: true, name: 'idx_coupons_code' });
    await safeIndex(co, { endDate: 1 }, { name: 'idx_coupons_end' });
    await safeIndex(co, { isActive: 1 }, { name: 'idx_coupons_active' });
    await safeIndex(co, { vendorId: 1 }, { name: 'idx_coupons_vendor' });

    await create('payouts');
    const pa = db.collection('payouts');
    await safeIndex(pa, { vendorId: 1, status: 1 }, { name: 'idx_payouts_vendor_status' });
    await safeIndex(pa, { createdAt: -1 }, { name: 'idx_payouts_created' });
    await safeIndex(pa, { status: 1 }, { name: 'idx_payouts_status' });

    await create('reviews');
    const rv = db.collection('reviews');
    await safeIndex(rv, { productId: 1, userId: 1 }, { unique: true, name: 'idx_reviews_product_user' });
    await safeIndex(rv, { productId: 1, rating: -1 }, { name: 'idx_reviews_product_rating' });
    await safeIndex(rv, { vendorId: 1 }, { name: 'idx_reviews_vendor' });

    await create('notifications');
    const no = db.collection('notifications');
    await safeIndex(no, { userId: 1, createdAt: -1 }, { name: 'idx_notif_user_created' });
    await safeIndex(no, { userId: 1, isRead: 1 }, { name: 'idx_notif_user_read' });
    await safeIndex(no, { createdAt: 1 }, { expireAfterSeconds: 2592000, name: 'idx_notif_ttl' });

    console.log('    → Ensured all financial & support indexes');
  },

  async down(mongoose) {
    const db = mongoose.connection.db;
    for (const c of ['notifications','reviews','payouts','coupons','wallettransactions','wallets']) {
      await db.collection(c).drop().catch(() => {});
    }
    console.log('    → Dropped financial & support collections');
  },
};
