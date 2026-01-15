import { createClient } from './server';

/**
 * Test Supabase Connection
 *
 * Run this to verify Supabase is configured correctly:
 * ```bash
 * npx tsx src/lib/supabase/test-connection.ts
 * ```
 */
async function testConnection() {
  console.log('🔌 Testing Supabase connection...\n');

  try {
    const supabase = createClient();

    // Test 1: Check if client is created
    console.log('✅ Supabase client created');

    // Test 2: Try to fetch from a table (replace 'projects' with your table)
    const { data, error } = await supabase.from('projects').select('id, name').limit(1);

    if (error) {
      console.error('❌ Database query failed:', error.message);
      console.log('\nPossible issues:');
      console.log('- Table "projects" does not exist');
      console.log('- RLS policies prevent access');
      console.log('- Network/connection issue');
      return;
    }

    console.log('✅ Database query successful');
    console.log('📊 Sample data:', data);

    // Test 3: Check auth (optional)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      console.log('✅ User authenticated:', user.email);
    } else {
      console.log('ℹ️  No user authenticated (this is normal for server-side)');
    }

    console.log('\n🎉 Supabase connection test completed successfully!');
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    console.log('\nCheck your environment variables:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
}

// Run if executed directly
if (require.main === module) {
  testConnection().then(() => process.exit(0));
}

export { testConnection };
