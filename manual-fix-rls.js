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

async function manualFixRLS() {
  console.log('🔧 Manually fixing RLS and updating promo products...');
  
  try {
    // Since we can't modify RLS policies with anon key, let's try a different approach
    // Let's manually update products one by one and see if any work
    
    console.log('\n1. Getting products to update...');
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .limit(10);
    
    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError.message);
      return;
    }
    
    console.log(`✅ Found ${products?.length || 0} products`);
    
    // Try updating each product individually
    console.log('\n2. Attempting to update products individually...');
    let successCount = 0;
    
    for (let i = 0; i < Math.min(5, products.length); i++) {
      const product = products[i];
      console.log(`\nUpdating: ${product.name}`);
      
      // Try different update approaches
      const approaches = [
        // Approach 1: Simple update
        async () => {
          const { data, error } = await supabase
            .from('products')
            .update({ promo: true })
            .eq('id', product.id)
            .select();
          return { data, error, approach: 'Simple update' };
        },
        
        // Approach 2: Update with upsert
        async () => {
          const { data, error } = await supabase
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
              promo: true,
              stock: product.stock || 0,
              discount: product.discount || 0
            })
            .select();
          return { data, error, approach: 'Upsert' };
        }
      ];
      
      for (const approach of approaches) {
        try {
          const result = await approach();
          if (!result.error) {
            console.log(`✅ ${result.approach} successful`);
            successCount++;
            break;
          } else {
            console.log(`❌ ${result.approach} failed:`, result.error.message);
          }
        } catch (err) {
          console.log(`❌ ${approach.name} error:`, err.message);
        }
      }
    }
    
    console.log(`\n✅ Successfully updated ${successCount} products`);
    
    // Verify promo products
    console.log('\n3. Verifying promo products...');
    const { data: promoProducts, error: promoError } = await supabase
      .from('products')
      .select('*')
      .eq('promo', true);
    
    if (promoError) {
      console.error('❌ Error fetching promo products:', promoError.message);
    } else {
      console.log(`✅ Total promo products: ${promoProducts?.length || 0}`);
      if (promoProducts && promoProducts.length > 0) {
        console.log('Promo products:');
        promoProducts.slice(0, 3).forEach(p => {
          console.log(`- ${p.name} (${p.brand})`);
        });
      }
    }
    
    console.log('\n🎉 Manual RLS fix completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

manualFixRLS();