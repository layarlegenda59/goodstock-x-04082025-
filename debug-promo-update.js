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

async function debugPromoUpdate() {
  console.log('🔍 Debugging promo update issue...');
  
  try {
    // Get a specific product to update
    console.log('\n1. Getting a specific product to update...');
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError.message);
      return;
    }
    
    if (!products || products.length === 0) {
      console.log('❌ No products found');
      return;
    }
    
    const product = products[0];
    console.log(`✅ Found product: ${product.name} (ID: ${product.id})`);
    console.log(`Current promo status: ${product.promo}`);
    
    // Try to update this specific product
    console.log('\n2. Attempting to update promo status...');
    const { data: updateResult, error: updateError } = await supabase
      .from('products')
      .update({ promo: true })
      .eq('id', product.id)
      .select();
    
    if (updateError) {
      console.error('❌ Update failed:', updateError.message);
      console.error('Error details:', JSON.stringify(updateError, null, 2));
    } else {
      console.log('✅ Update successful:', updateResult);
    }
    
    // Verify the update by fetching the product again
    console.log('\n3. Verifying the update...');
    const { data: verifyProduct, error: verifyError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      console.log(`✅ Verified product promo status: ${verifyProduct.promo}`);
    }
    
    // Check all promo products
    console.log('\n4. Checking all promo products...');
    const { data: allPromos, error: allPromosError } = await supabase
      .from('products')
      .select('id, name, promo')
      .eq('promo', true);
    
    if (allPromosError) {
      console.error('❌ Error fetching all promos:', allPromosError.message);
    } else {
      console.log(`✅ Total promo products: ${allPromos?.length || 0}`);
      if (allPromos && allPromos.length > 0) {
        allPromos.forEach(p => {
          console.log(`- ${p.name} (${p.id})`);
        });
      }
    }
    
    console.log('\n🎉 Debug completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugPromoUpdate();