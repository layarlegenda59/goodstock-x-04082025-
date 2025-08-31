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

async function simplePromoTest() {
  console.log('🔧 Simple promo test...');
  
  try {
    // Test 1: Get all products and check their promo status
    console.log('\n1. Getting all products and checking promo status...');
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('id, name, promo')
      .limit(10);
    
    if (allError) {
      console.error('❌ Error getting all products:', allError.message);
      return;
    }
    
    console.log(`✅ Found ${allProducts?.length || 0} products`);
    if (allProducts && allProducts.length > 0) {
      console.log('First 10 products promo status:');
      allProducts.forEach((p, index) => {
        console.log(`${index + 1}. ${p.name} - promo: ${p.promo} (type: ${typeof p.promo})`);
      });
    }
    
    // Test 2: Try to manually set one product to promo = true and verify immediately
    console.log('\n2. Manually setting one product to promo = true...');
    if (allProducts && allProducts.length > 0) {
      const testProduct = allProducts[0];
      console.log(`Updating product: ${testProduct.name} (ID: ${testProduct.id})`);
      
      // Update the product
      const { data: updateResult, error: updateError } = await supabase
        .from('products')
        .update({ promo: true })
        .eq('id', testProduct.id)
        .select('id, name, promo');
      
      if (updateError) {
        console.log(`❌ Update failed: ${updateError.message}`);
      } else {
        console.log(`✅ Update result:`, updateResult);
        
        // Immediately verify the update
        console.log('\n3. Immediately verifying the update...');
        const { data: verifyResult, error: verifyError } = await supabase
          .from('products')
          .select('id, name, promo')
          .eq('id', testProduct.id)
          .single();
        
        if (verifyError) {
          console.log(`❌ Verification failed: ${verifyError.message}`);
        } else {
          console.log(`✅ Verification result:`, verifyResult);
          console.log(`Product ${verifyResult.name} promo status: ${verifyResult.promo} (type: ${typeof verifyResult.promo})`);
        }
      }
    }
    
    // Test 3: Try different query approaches for promo products
    console.log('\n4. Testing different query approaches...');
    
    // Approach A: eq(promo, true)
    const { data: approach_a, error: error_a } = await supabase
      .from('products')
      .select('id, name, promo')
      .eq('promo', true);
    
    console.log(`Approach A (eq true): ${approach_a?.length || 0} results`);
    if (error_a) console.log(`Error A: ${error_a.message}`);
    
    // Approach B: is(promo, true)
    const { data: approach_b, error: error_b } = await supabase
      .from('products')
      .select('id, name, promo')
      .is('promo', true);
    
    console.log(`Approach B (is true): ${approach_b?.length || 0} results`);
    if (error_b) console.log(`Error B: ${error_b.message}`);
    
    // Approach C: filter with string
    const { data: approach_c, error: error_c } = await supabase
      .from('products')
      .select('id, name, promo')
      .filter('promo', 'eq', true);
    
    console.log(`Approach C (filter eq true): ${approach_c?.length || 0} results`);
    if (error_c) console.log(`Error C: ${error_c.message}`);
    
    // Approach D: neq(promo, false)
    const { data: approach_d, error: error_d } = await supabase
      .from('products')
      .select('id, name, promo')
      .neq('promo', false);
    
    console.log(`Approach D (neq false): ${approach_d?.length || 0} results`);
    if (error_d) console.log(`Error D: ${error_d.message}`);
    
    // Test 4: Check if there are any products with promo = true by getting all and filtering manually
    console.log('\n5. Manual filtering check...');
    const { data: allForManualCheck, error: manualError } = await supabase
      .from('products')
      .select('id, name, promo');
    
    if (manualError) {
      console.log(`❌ Manual check failed: ${manualError.message}`);
    } else {
      const manualPromoProducts = allForManualCheck?.filter(p => p.promo === true) || [];
      console.log(`✅ Manual filtering found ${manualPromoProducts.length} promo products`);
      
      if (manualPromoProducts.length > 0) {
        console.log('Manual promo products:');
        manualPromoProducts.forEach((p, index) => {
          console.log(`${index + 1}. ${p.name} - promo: ${p.promo}`);
        });
      }
      
      // Also check for any truthy values
      const truthyPromoProducts = allForManualCheck?.filter(p => !!p.promo) || [];
      console.log(`✅ Manual filtering found ${truthyPromoProducts.length} truthy promo products`);
    }
    
    console.log('\n🎉 Simple promo test completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

simplePromoTest();