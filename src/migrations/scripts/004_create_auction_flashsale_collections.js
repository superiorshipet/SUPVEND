/**
 * Migration 004 — Create auction & flash sale collections
 */

async function safeIndex(col, spec, opts) {
  try { await col.createIndex(spec, opts); }
  catch (e) { if (e.code !== 85 && e.code !== 86) throw e; }
}

module.exports = {
  async up(mongoose) {
    const db = mongoose.connection.db;

    try { await db.createCollection('auctions'); console.log('    → Created: auctions'); }
    catch (e) { if (e.codeName === 'NamespaceExists') console.log('    → Exists: auctions'); else throw e; }

    const a = db.collection('auctions');
    await safeIndex(a, { status: 1, endTime: 1 }, { name: 'idx_auctions_status_end' });
    await safeIndex(a, { vendorId: 1 }, { name: 'idx_auctions_vendor' });
    await safeIndex(a, { productId: 1 }, { name: 'idx_auctions_product' });
    console.log('    → Ensured indexes: auctions');

    try { await db.createCollection('auctionbids'); console.log('    → Created: auctionbids'); }
    catch (e) { if (e.codeName === 'NamespaceExists') console.log('    → Exists: auctionbids'); else throw e; }

    const b = db.collection('auctionbids');
    await safeIndex(b, { auctionId: 1, amount: -1 }, { name: 'idx_bids_auction_amount' });
    await safeIndex(b, { auctionId: 1, userId: 1 }, { name: 'idx_bids_auction_user' });
    await safeIndex(b, { createdAt: 1 }, { name: 'idx_bids_created' });
    console.log('    → Ensured indexes: auctionbids');

    try { await db.createCollection('flashsales'); console.log('    → Created: flashsales'); }
    catch (e) { if (e.codeName === 'NamespaceExists') console.log('    → Exists: flashsales'); else throw e; }

    const f = db.collection('flashsales');
    await safeIndex(f, { productId: 1 }, { name: 'idx_flash_product' });
    await safeIndex(f, { vendorId: 1 }, { name: 'idx_flash_vendor' });
    await safeIndex(f, { status: 1, startTime: 1, endTime: 1 }, { name: 'idx_flash_status_time' });
    await safeIndex(f, { endTime: 1 }, { name: 'idx_flash_end' });
    console.log('    → Ensured indexes: flashsales');
  },

  async down(mongoose) {
    const db = mongoose.connection.db;
    await db.collection('flashsales').drop().catch(() => {});
    await db.collection('auctionbids').drop().catch(() => {});
    await db.collection('auctions').drop().catch(() => {});
    console.log('    → Dropped: auctions, auctionbids, flashsales');
  },
};
