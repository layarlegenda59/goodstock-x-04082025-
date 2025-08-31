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
  console.log('🔧 Fixing promo products by updating existing products...');
  
  try {
    // First, let's get some existing products to update
    console.log('\n1. Getting existing products to update...');
    const { data: existingProducts, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError.message);
      return;
    }
    
    console.log(`✅ Found ${existingProducts?.length || 0} products to potentially update`);
    
    if (!existingProducts || existingProducts.length === 0) {
      console.log('❌ No products found to update');
      return;
    }
    
    // Try to update some products to have promo = true using different approaches
    console.log('\n2. Trying different update approaches...');
    
    const productsToUpdate = existingProducts.slice(0, 3);
    
    for (let i = 0; i < productsToUpdate.length; i++) {
      const product = productsToUpdate[i];
      console.log(`\nUpdating product ${i + 1}: ${product.name}`);
      
      // Approach 1: Direct update
      console.log('  Approach 1: Direct update...');
      const { data: directUpdate, error: directError } = await supabase
        .from('products')
        .update({ 
          promo: true,
          discount: 15,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id)
        .select();
      
      if (directError) {
        console.log(`  ❌ Direct update failed: ${directError.message}`);
        
        // Approach 2: Try upsert
        console.log('  Approach 2: Upsert...');
        const { data: upsertResult, error: upsertError } = await supabase
          .from('products')
          .upsert({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            category: product.category,
            subcategory: product.subcategory,
            gender: product.gender,
            sizes: product.sizes,
            images: product.images,
            description: product.description,
            promo: true,
            discount: 15,
            stock: product.stock || 50,
            created_at: product.created_at,
            updated_at: new Date().toISOString()
          })
          .select();
        
        if (upsertError) {
          console.log(`  ❌ Upsert failed: ${upsertError.message}`);
          
          // Approach 3: Try to create a new product with similar data
          console.log('  Approach 3: Create new promo product...');
          const newPromoProduct = {
            name: `${product.name} - PROMO`,
            brand: product.brand,
            price: product.price,
            discount: 20,
            category: product.category,
            subcategory: product.subcategory,
            gender: product.gender,
            sizes: product.sizes,
            images: product.images,
            description: `${product.description} - Special Promo!`,
            promo: true,
            stock: 25
          };
          
          const { data: newProduct, error: newError } = await supabase
            .from('products')
            .insert(newPromoProduct)
            .select();
          
          if (newError) {
            console.log(`  ❌ New product creation failed: ${newError.message}`);
          } else {
            console.log(`  ✅ New promo product created successfully`);
          }
        } else {
          console.log(`  ✅ Upsert successful`);
        }
      } else {
        console.log(`  ✅ Direct update successful`);
      }
      
      // Small delay between updates
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Final verification
    console.log('\n3. Final verification...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: finalPromos, error: finalError } = await supabase
      .from('products')
      .select('*')
      .eq('promo', true);
    
    if (finalError) {
      console.error('❌ Final verification failed:', finalError.message);
    } else {
      console.log(`\n✅ Total promo products after update: ${finalPromos?.length || 0}`);
      
      if (finalPromos && finalPromos.length > 0) {
        console.log('\nPromo products found:');
        finalPromos.forEach((p, index) => {
          console.log(`${index + 1}. ${p.name} (${p.brand}) - Rp ${p.price?.toLocaleString()} - Discount: ${p.discount}%`);
        });
      } else {
        console.log('\n❌ Still no promo products found. This might be a database configuration issue.');
        
        // Let's try one more approach - check if we can read what we just wrote
        console.log('\n4. Checking if updates are visible...');
        for (const product of productsToUpdate) {
          const { data: checkProduct, error: checkError } = await supabase
            .from('products')
            .select('*')
            .eq('id', product.id)
            .single();
          
          if (checkError) {
            console.log(`❌ Cannot read product ${product.id}: ${checkError.message}`);
          } else {
            console.log(`Product ${product.name}: promo = ${checkProduct.promo}`);
          }
        }
      }
    }
    
    console.log('\n🎉 Promo products fix attempt completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixPromoProducts();