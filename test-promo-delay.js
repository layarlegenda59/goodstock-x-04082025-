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
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPromoDelay() {
  console.log('🔍 Testing promo products with delay and different queries...');
  
  try {
    // Test 1: Get specific product by ID and check its promo status
    console.log('\n1. Testing specific product by ID...');
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (allError) {
      console.error('❌ Error fetching products:', allError.message);
      return;
    }
    
    if (allProducts && allProducts.length > 0) {
      const productId = allProducts[0].id;
      console.log(`Testing product ID: ${productId}`);
      
      // Update this specific product
      const { data: updateResult, error: updateError } = await supabase
        .from('products')
        .update({ promo: true })
        .eq('id', productId)
        .select();
      
      console.log('Update result:', updateResult);
      if (updateError) {
        console.error('Update error:', updateError.message);
      }
      
      // Wait a bit
      console.log('Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check the specific product
      const { data: specificProduct, error: specificError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (specificError) {
        console.error('❌ Error fetching specific product:', specificError.message);
      } else {
        console.log(`✅ Specific product promo status: ${specificProduct.promo}`);
      }
    }
    
    // Test 2: Try different query patterns
    console.log('\n2. Testing different query patterns...');
    
    const queries = [
      {
        name: 'Basic promo query',
        query: () => supabase.from('products').select('*').eq('promo', true)
      },
      {
        name: 'Promo query with limit',
        query: () => supabase.from('products').select('*').eq('promo', true).limit(10)
      },
      {
        name: 'Count promo products',
        query: () => supabase.from('products').select('*', { count: 'exact', head: true }).eq('promo', true)
      },
      {
        name: 'All products with promo field',
        query: () => supabase.from('products').select('id, name, promo').limit(5)
      }
    ];
    
    for (const { name, query } of queries) {
      try {
        const { data, error, count } = await query();
        if (error) {
          console.error(`❌ ${name} failed:`, error.message);
        } else {
          console.log(`✅ ${name}: ${count !== undefined ? count : data?.length || 0} results`);
          if (data && data.length > 0 && data[0].promo !== undefined) {
            const promoCount = data.filter(p => p.promo === true).length;
            console.log(`   - Promo products in results: ${promoCount}`);
          }
        }
      } catch (err) {
        console.error(`❌ ${name} error:`, err.message);
      }
    }
    
    // Test 3: Insert a new product with promo = true
    console.log('\n3. Testing insert new promo product...');
    const newProduct = {
      name: 'Test Promo Product',
      brand: 'Test Brand',
      price: 100000,
      category: 'sepatu',
      subcategory: 'Test',
      gender: 'unisex',
      sizes: ['42'],
      images: ['test.jpg'],
      promo: true,
      stock: 10,
      discount: 0
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('products')
      .insert(newProduct)
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
    } else {
      console.log('✅ Insert successful:', insertResult);
      
      // Check if we can find this product
      const { data: findResult, error: findError } = await supabase
        .from('products')
        .select('*')
        .eq('name', 'Test Promo Product');
      
      if (findError) {
        console.error('❌ Find failed:', findError.message);
      } else {
        console.log('✅ Find result:', findResult);
      }
    }
    
    console.log('\n🎉 Promo delay test completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testPromoDelay();