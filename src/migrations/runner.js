/**
 * SUPVEND Migration Runner
 * ─────────────────────────
 * Applies pending migrations in order, tracks executed ones,
 * and supports rollback by batch.
 *
 * Usage:
 *   node src/migrations/runner.js migrate          # Run all pending
 *   node src/migrations/runner.js rollback          # Roll back last batch
 *   node src/migrations/runner.js rollback --all    # Roll back everything
 *   node src/migrations/runner.js status            # Show migration status
 *   node src/migrations/runner.js fresh             # Roll back all + re-run
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const Migration = require('./MigrationModel');

// ─── Helpers ───────────────────────────────────────────────
const MIGRATIONS_DIR = path.join(__dirname, 'scripts');

function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.js'))
    .sort();
}

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/supvend';
  await mongoose.connect(uri);
  console.log(`✅ Connected to MongoDB: ${uri}`);
}

async function disconnect() {
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

// ─── Commands ──────────────────────────────────────────────
async function migrate() {
  const files = getMigrationFiles();
  const executed = (await Migration.find({}, 'name')).map((m) => m.name);
  const pending = files.filter((f) => !executed.includes(f));

  if (pending.length === 0) {
    console.log('✅ Nothing to migrate — all migrations are up to date.');
    return;
  }

  const lastBatch = (await Migration.findOne().sort('-batch'))?.batch || 0;
  const batch = lastBatch + 1;

  console.log(`\n🚀 Running ${pending.length} migration(s) — batch ${batch}\n`);

  for (const file of pending) {
    const migration = require(path.join(MIGRATIONS_DIR, file));
    console.log(`  ▶ Running: ${file}`);
    try {
      await migration.up(mongoose);
      await Migration.create({ name: file, batch });
      console.log(`  ✅ ${file} applied`);
    } catch (err) {
      console.error(`  ❌ ${file} FAILED:`, err.message);
      throw err; // stop on first failure
    }
  }

  console.log(`\n✅ ${pending.length} migration(s) applied successfully.\n`);
}

async function rollback(all = false) {
  if (all) {
    const migrations = await Migration.find().sort('-batch -executedAt');
    if (migrations.length === 0) {
      console.log('Nothing to roll back.');
      return;
    }
    console.log(`\n⏪ Rolling back ALL ${migrations.length} migration(s)\n`);
    for (const m of migrations) {
      await rollbackOne(m);
    }
    console.log('\n✅ All migrations rolled back.\n');
    return;
  }

  const lastBatch = (await Migration.findOne().sort('-batch'))?.batch;
  if (!lastBatch) {
    console.log('Nothing to roll back.');
    return;
  }

  const migrations = await Migration.find({ batch: lastBatch }).sort('-executedAt');
  console.log(`\n⏪ Rolling back batch ${lastBatch} (${migrations.length} migration(s))\n`);

  for (const m of migrations) {
    await rollbackOne(m);
  }

  console.log(`\n✅ Batch ${lastBatch} rolled back.\n`);
}

async function rollbackOne(migration) {
  const filePath = path.join(MIGRATIONS_DIR, migration.name);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ File not found: ${migration.name} — skipping`);
    await Migration.deleteOne({ _id: migration._id });
    return;
  }
  const mod = require(filePath);
  console.log(`  ◀ Rolling back: ${migration.name}`);
  try {
    if (typeof mod.down === 'function') {
      await mod.down(mongoose);
    }
    await Migration.deleteOne({ _id: migration._id });
    console.log(`  ✅ ${migration.name} rolled back`);
  } catch (err) {
    console.error(`  ❌ ${migration.name} rollback FAILED:`, err.message);
    throw err;
  }
}

async function status() {
  const files = getMigrationFiles();
  const executed = await Migration.find().sort('batch executedAt');
  const executedNames = new Set(executed.map((m) => m.name));

  console.log('\n📋 Migration Status\n');
  console.log('  Batch | Status  | Name');
  console.log('  ------+---------+------------------------------------------');

  for (const file of files) {
    const record = executed.find((m) => m.name === file);
    const st = record ? `  ✅ ${String(record.batch).padStart(3)}  ` : '   ⏳  —  ';
    console.log(`  ${st} | ${file}`);
  }

  const pending = files.filter((f) => !executedNames.has(f));
  console.log(`\n  Total: ${files.length}  |  Executed: ${executed.length}  |  Pending: ${pending.length}\n`);
}

async function fresh() {
  console.log('\n🔄 Fresh migration — rolling back everything, then re-running.\n');
  await rollback(true);
  await migrate();
}

// ─── CLI entry ─────────────────────────────────────────────
(async () => {
  const [, , command, flag] = process.argv;

  try {
    await connectDB();

    switch (command) {
      case 'migrate':
        await migrate();
        break;
      case 'rollback':
        await rollback(flag === '--all');
        break;
      case 'status':
        await status();
        break;
      case 'fresh':
        await fresh();
        break;
      default:
        console.log(`
SUPVEND Migration Runner
────────────────────────
  migrate              Run all pending migrations
  rollback             Roll back last batch
  rollback --all       Roll back all migrations
  status               Show migration status
  fresh                Drop all + re-run all
        `);
    }
  } catch (err) {
    console.error('\n💥 Migration error:', err.message);
    process.exit(1);
  } finally {
    await disconnect();
  }
})();
