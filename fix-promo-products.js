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

async function fixPromoProducts() {
  console.log('🔧 Fixing promo products...');
  
  try {
    // First, check current promo products
    const { data: currentPromos, error: promoError } = await supabase
      .from('products')
      .select('*')
      .eq('promo', true);
    
    console.log(`Current promo products: ${currentPromos?.length || 0}`);
    
    // Get some products to set as promo
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('*')
      .limit(10);
    
    if (allError) {
      console.error('❌ Error fetching products:', allError.message);
      return;
    }
    
    if (!allProducts || allProducts.length === 0) {
      console.log('❌ No products found to set as promo');
      return;
    }
    
    // Set first 5 products as promo
    const productsToUpdate = allProducts.slice(0, 5);
    
    console.log('\n🔄 Setting products as promo:');
    for (const product of productsToUpdate) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ promo: true })
        .eq('id', product.id);
      
      if (updateError) {
        console.error(`❌ Failed to update ${product.name}:`, updateError.message);
      } else {
        console.log(`✅ ${product.name} set as promo`);
      }
    }
    
    // Verify the update
    const { data: updatedPromos, error: verifyError } = await supabase
      .from('products')
      .select('*')
      .eq('promo', true);
    
    if (verifyError) {
      console.error('❌ Error verifying promo products:', verifyError.message);
    } else {
      console.log(`\n✅ Total promo products after update: ${updatedPromos?.length || 0}`);
      if (updatedPromos && updatedPromos.length > 0) {
        console.log('Promo products:');
        updatedPromos.forEach(product => {
          console.log(`- ${product.name} (${product.brand}) - Rp ${product.price.toLocaleString()}`);
        });
      }
    }
    
    console.log('\n🎉 Promo products fix completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixPromoProducts();