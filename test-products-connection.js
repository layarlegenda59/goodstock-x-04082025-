const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local.example
let supabaseUrl, supabaseKey;

try {
  const envPath = path.join(__dirname, '.env.local.example');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  }
} catch (error) {
  console.error('❌ Error reading .env.local.example file:', error.message);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProductsConnection() {
  console.log('🔍 Testing Supabase products connection...');
  
  try {
    // Test 1: Basic connection
    console.log('\n1. Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message);
      return;
    }
    console.log('✅ Connection successful');
    
    // Test 2: Fetch all products
    console.log('\n2. Testing fetch all products...');
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('*');
    
    if (allError) {
      console.error('❌ Fetch all products failed:', allError.message);
    } else {
      console.log(`✅ Fetched ${allProducts?.length || 0} products`);
      if (allProducts && allProducts.length > 0) {
        console.log('Sample product:', {
          id: allProducts[0].id,
          name: allProducts[0].name,
          price: allProducts[0].price,
          promo: allProducts[0].promo
        });
      }
    }
    
    // Test 3: Fetch promo products
    console.log('\n3. Testing fetch promo products...');
    const { data: promoProducts, error: promoError } = await supabase
      .from('products')
      .select('*')
      .eq('promo', true);
    
    if (promoError) {
      console.error('❌ Fetch promo products failed:', promoError.message);
    } else {
      console.log(`✅ Fetched ${promoProducts?.length || 0} promo products`);
    }
    
    // Test 4: Test specific queries that might cause ERR_ABORTED
    console.log('\n4. Testing specific queries...');
    
    // Query with order
    const { data: orderedProducts, error: orderError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8);
    
    if (orderError) {
      console.error('❌ Ordered query failed:', orderError.message);
    } else {
      console.log(`✅ Ordered query successful: ${orderedProducts?.length || 0} products`);
    }
    
    // Query by category
    const { data: categoryProducts, error: categoryError } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'sepatu');
    
    if (categoryError) {
      console.error('❌ Category query failed:', categoryError.message);
    } else {
      console.log(`✅ Category query successful: ${categoryProducts?.length || 0} sepatu products`);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testProductsConnection();