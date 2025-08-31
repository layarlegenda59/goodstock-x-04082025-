// Test script to check hero_slides RLS policies and permissions
const { createClient } = require('@supabase/supabase-js');

// Hardcode the Supabase credentials for testing
const supabaseUrl = 'https://eldhtxtnwdanyavkikap.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZGh0eHRud2Rhbnlhdmtpa2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzc4NTgsImV4cCI6MjA2OTcxMzg1OH0.Wz7TtwZqZT3m4UCqN9XF1O3ifnrnaOQezXasvZ-uX7Q';

// Or try to read from environment if available
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const finalUrl = envUrl || supabaseUrl;
const finalKey = envKey || supabaseKey;

if (!finalUrl || !finalKey || finalUrl.includes('your-project') || finalKey.includes('your-anon')) {
  console.error('❌ Missing or invalid Supabase environment variables');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
  console.log('Or update the hardcoded values in this script');
  process.exit(1);
}

const supabase = createClient(finalUrl, finalKey);

async function testHeroSlidesAccess() {
  console.log('\n=== TESTING HERO SLIDES RLS POLICIES ===\n');
  
  try {
    // Test 1: Try to read hero_slides without authentication
    console.log('1. Testing public read access to hero_slides...');
    const { data: publicData, error: publicError } = await supabase
      .from('hero_slides')
      .select('*');
    
    if (publicError) {
      console.error('❌ Public read failed:', publicError.message);
    } else {
      console.log('✅ Public read successful. Found', publicData?.length || 0, 'slides');
    }
    
    // Test 2: Try to update a slide without authentication (should fail)
    console.log('\n2. Testing update without authentication (should fail)...');
    const { error: updateError } = await supabase
      .from('hero_slides')
      .update({ title: 'Test Update' })
      .eq('id', 'test-id');
    
    if (updateError) {
      console.log('✅ Update correctly blocked:', updateError.message);
    } else {
      console.log('⚠️  Update unexpectedly succeeded (RLS may be disabled)');
    }
    
    // Test 3: Check if we can get current user
    console.log('\n3. Checking current authentication status...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth check failed:', authError.message);
    } else if (user) {
      console.log('✅ User authenticated:', user.email);
      
      // Test 4: Check user profile and role
      console.log('\n4. Checking user profile and role...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Profile check failed:', profileError.message);
      } else {
        console.log('✅ User profile found:', {
          id: profile.id,
          email: profile.email,
          role: profile.role
        });
        
        // Test 5: Try authenticated update if user is admin
        if (profile.role === 'admin') {
          console.log('\n5. Testing admin update access...');
          const { error: adminUpdateError } = await supabase
            .from('hero_slides')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', 'non-existent-id'); // Use non-existent ID to avoid actual changes
          
          if (adminUpdateError && !adminUpdateError.message.includes('No rows found')) {
            console.error('❌ Admin update failed:', adminUpdateError.message);
            console.log('\n🔧 SOLUTION: Run the fix-hero-slides-rls.sql script in Supabase SQL Editor');
          } else {
            console.log('✅ Admin update access working correctly');
          }
        } else {
          console.log('\n5. User is not admin, skipping admin update test');
        }
      }
    } else {
      console.log('ℹ️  No user currently authenticated');
      console.log('\n🔧 SOLUTION: Make sure you are logged in as admin to test update permissions');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.log('\n🔧 POSSIBLE SOLUTIONS:');
    console.log('1. Run fix-hero-slides-rls.sql in Supabase SQL Editor');
    console.log('2. Check if RLS is enabled on hero_slides table');
    console.log('3. Verify admin user profile exists with role="admin"');
  }
  
  console.log('\n=== TEST COMPLETED ===\n');
}

testHeroSlidesAccess();