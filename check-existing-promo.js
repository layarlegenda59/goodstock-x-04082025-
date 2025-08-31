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

async function checkExistingPromo() {
  console.log('🔍 Checking for existing promo products from sample data...');
  
  try {
    // Check products that should have promo = true from sample data
    console.log('\n1. Checking products by name from sample data...');
    
    const samplePromoProducts = [
      'Air Jordan 1 Retro High OG',
      'Nike Air Force 1 Low',
      'Louis Vuitton Keepall 50',
      'Stone Island Hoodie'
    ];
    
    for (const productName of samplePromoProducts) {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${productName}%`);
      
      if (error) {
        console.error(`❌ Error searching for ${productName}:`, error.message);
      } else if (products && products.length > 0) {
        const product = products[0];
        console.log(`✅ Found: ${product.name} - Promo: ${product.promo}`);
      } else {
        console.log(`❌ Not found: ${productName}`);
      }
    }
    
    // Check all products and their promo status
    console.log('\n2. Checking all products promo status...');
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('id, name, brand, promo')
      .limit(20);
    
    if (allError) {
      console.error('❌ Error fetching all products:', allError.message);
    } else {
      console.log(`✅ Found ${allProducts?.length || 0} products`);
      const promoProducts = allProducts?.filter(p => p.promo === true) || [];
      const nonPromoProducts = allProducts?.filter(p => p.promo === false) || [];
      
      console.log(`Promo products: ${promoProducts.length}`);
      console.log(`Non-promo products: ${nonPromoProducts.length}`);
      
      if (promoProducts.length > 0) {
        console.log('\nPromo products found:');
        promoProducts.forEach(p => {
          console.log(`- ${p.name} (${p.brand})`);
        });
      }
      
      console.log('\nFirst 5 products with promo status:');
      allProducts?.slice(0, 5).forEach(p => {
        console.log(`- ${p.name}: promo = ${p.promo}`);
      });
    }
    
    // Try to find any product with promo = true using different approaches
    console.log('\n3. Alternative promo search methods...');
    
    // Method 1: Use not equals false
    const { data: method1, error: error1 } = await supabase
      .from('products')
      .select('*')
      .neq('promo', false);
    
    console.log(`Method 1 (neq false): ${method1?.length || 0} results`);
    
    // Method 2: Use is true
    const { data: method2, error: error2 } = await supabase
      .from('products')
      .select('*')
      .is('promo', true);
    
    console.log(`Method 2 (is true): ${method2?.length || 0} results`);
    
    // Method 3: Raw query approach
    console.log('\n4. Checking database schema...');
    const { data: schemaCheck, error: schemaError } = await supabase
      .from('products')
      .select('promo')
      .limit(1);
    
    if (schemaError) {
      console.error('❌ Schema check failed:', schemaError.message);
    } else {
      console.log('✅ Promo column exists and accessible');
      console.log('Sample promo value:', schemaCheck?.[0]?.promo);
      console.log('Promo value type:', typeof schemaCheck?.[0]?.promo);
    }
    
    console.log('\n🎉 Existing promo check completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkExistingPromo();