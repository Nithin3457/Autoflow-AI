import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';
import ws from 'ws';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root or current folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const { DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

console.log('='.repeat(70));
console.log('  AutoFlow AI - Database Migration Runner');
console.log('='.repeat(70));

const migrationFilePath = path.resolve(__dirname, '../../supabase/migrations/001_initial_schema.sql');

if (!fs.existsSync(migrationFilePath)) {
  console.error(`❌ Migration file not found at: ${migrationFilePath}`);
  process.exit(1);
}

const sqlContent = fs.readFileSync(migrationFilePath, 'utf8');
console.log(`📄 Loaded migration file: ${migrationFilePath} (${sqlContent.length} bytes)`);

async function runMigration() {
  let migrated = false;

  // 1. Try PostgreSQL connection pool if DATABASE_URL is configured
  if (DATABASE_URL && !DATABASE_URL.includes('your_password')) {
    console.log('\n🔗 Attempting migration via direct PostgreSQL connection (DATABASE_URL)...');
    const { Client } = pg;
    const client = new Client({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log('✅ Connected to PostgreSQL database.');
      console.log('⏳ Executing 001_initial_schema.sql...');
      await client.query(sqlContent);
      console.log('🎉 Migration successfully applied via PostgreSQL connection!');
      await client.end();
      migrated = true;
      return;
    } catch (err) {
      console.warn(`⚠️ PostgreSQL connection attempt failed: ${err.message}`);
      try { await client.end(); } catch (_) {}
    }
  } else {
    console.log('\nℹ️ Direct DATABASE_URL is not configured with a password.');
  }

  // 2. Check Supabase REST API connectivity using service role key
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    console.log('\n⚡ Verifying Supabase project with Service Role Key...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
      realtime: { transport: ws }
    });

    try {
      const { data, error } = await supabase.from('users').select('id, full_name, role').limit(5);
      if (!error && data) {
        console.log(`✅ Supabase schema is active! Found ${data.length} seeded users:`);
        data.forEach(u => console.log(`   - ${u.full_name} (${u.role})`));
        migrated = true;
        return;
      } else if (error && error.code === 'PGRST205') {
        console.log('ℹ️ Supabase project is connected, but tables need to be created in the SQL Editor.');
      } else if (error) {
        console.log(`ℹ️ Supabase response: ${error.message}`);
      }
    } catch (e) {
      console.warn(`⚠️ Supabase check error: ${e.message}`);
    }
  }

  // 3. Helpful instructions for Supabase Cloud SQL Editor
  console.log('\n' + '-'.repeat(70));
  console.log('📌 NOTE FOR SUPABASE CLOUD POSTGRESQL:');
  console.log('Supabase Cloud projects restrict direct DDL execution over HTTP.');
  console.log('To apply the initial schema directly to your cloud Supabase database:');
  console.log('1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/dabcxrjwvajizhnwcurz');
  console.log('2. Click on "SQL Editor" in the left navigation sidebar.');
  console.log('3. Copy the contents of: supabase/migrations/001_initial_schema.sql');
  console.log('4. Click "Run" (▶). All tables, RLS policies, and seed data will be created!');
  console.log('5. (Optional) You can also set DATABASE_URL in .env with your DB password.');
  console.log('-'.repeat(70));
  console.log('💡 AutoFlow AI includes a dual-mode database engine:');
  console.log('   It automatically queries Supabase Cloud when tables are present,');
  console.log('   and provides an embedded relational state engine so all features,');
  console.log('   AI requests, and Kanban updates work seamlessly right away!');
  console.log('-'.repeat(70) + '\n');
}

runMigration().catch(err => {
  console.error('Fatal migration runner error:', err);
  process.exit(1);
});
