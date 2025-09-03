const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://eldhtxtnwdanyavkikap.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZGh0eHRud2Rhbnlhdmtpa2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzc4NTgsImV4cCI6MjA2OTcxMzg1OH0.Wz7TtwZqZT3m4UCqN9XF1O3ifnrnaOQezXasvZ-uX7Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies for hero_slides and category_images...');
  
  try {
    // Test current access to hero_slides
    console.log('\n1. Testing current access to hero_slides...');
    const { data: testData, error: testError } = await supabase
      .from('hero_slides')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      console.log('❌ Current access error:', testError.message);
    } else {
      console.log('✅ Current access works, count:', testData);
    }
    
    // Check if we can read data
    console.log('\n2. Checking read access...');
    const { data: readData, error: readError } = await supabase
      .from('hero_slides')
      .select('*')
      .limit(1);
    
    if (readError) {
      console.log('❌ Read access error:', readError.message);
    } else {
      console.log('✅ Read access works, sample data:', readData?.length || 0, 'records');
    }
    
    // Try to insert a test record to check write access
    console.log('\n3. Testing write access...');
    const testSlide = {
      title: 'Test Slide - Fashion Streetwear',
      subtitle: 'Testing RLS policies',
      image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop',
      cta_text: 'Shop Now',
      cta_link: '/kategori/fashion-streetwear',
      is_active: true,
      order_index: 999
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('hero_slides')
      .insert([testSlide])
      .select();
    
    if (insertError) {
      console.log('❌ Write access error:', insertError.message);
      console.log('\n💡 This indicates RLS policies are blocking admin access.');
      console.log('\n📋 To fix this, run the following SQL in Supabase SQL Editor:');
      console.log('\n-- Drop existing problematic policies');
      console.log('DROP POLICY IF EXISTS "Allow admin full access on hero_slides" ON hero_slides;');
      console.log('DROP POLICY IF EXISTS "Allow admin full access on category_images" ON category_images;');
      console.log('\n-- Create new policies using the profiles table');
      console.log('CREATE POLICY "Allow admin full access on hero_slides" ON hero_slides');
      console.log('    FOR ALL USING (');
      console.log('        EXISTS (');
      console.log('            SELECT 1 FROM profiles ');
      console.log('            WHERE profiles.id = auth.uid() ');
      console.log('            AND profiles.role = \'admin\'');
      console.log('        )');
      console.log('    );');
      console.log('\nCREATE POLICY "Allow admin full access on category_images" ON category_images');
      console.log('    FOR ALL USING (');
      console.log('        EXISTS (');
      console.log('            SELECT 1 FROM profiles ');
      console.log('            WHERE profiles.id = auth.uid() ');
      console.log('            AND profiles.role = \'admin\'');
      console.log('        )');
      console.log('    );');
    } else {
      console.log('✅ Write access works, inserted test record:', insertData);
      
      // Clean up test record
      await supabase
        .from('hero_slides')
        .delete()
        .eq('title', 'Test Slide - Fashion Streetwear');
      console.log('🧹 Test record cleaned up');
    }
    
    // Test category_images access
    console.log('\n4. Testing category_images access...');
    const { data: categoryData, error: categoryError } = await supabase
      .from('category_images')
      .select('*')
      .limit(1);
    
    if (categoryError) {
      console.log('❌ Category images access error:', categoryError.message);
    } else {
      console.log('✅ Category images access works, sample data:', categoryData?.length || 0, 'records');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixRLSPolicies();