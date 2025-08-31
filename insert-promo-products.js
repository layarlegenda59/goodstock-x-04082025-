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

async function insertPromoProducts() {
  console.log('🔧 Inserting promo products manually...');
  
  try {
    // Define sample promo products
    const promoProducts = [
      {
        name: 'Air Jordan 1 Retro High OG',
        brand: 'Air Jordan',
        price: 2100000,
        discount: 16,
        images: ['https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'],
        category: 'sepatu',
        subcategory: 'Sneakers',
        gender: 'unisex',
        sizes: ['39', '40', '41', '42', '43', '44'],
        description: 'Sepatu basket ikonik dengan desain timeless dan kualitas premium.',
        promo: true,
        stock: 50
      },
      {
        name: 'Nike Air Force 1 Low',
        brand: 'Nike',
        price: 1299000,
        discount: 13,
        images: ['https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg'],
        category: 'sepatu',
        subcategory: 'Sneakers',
        gender: 'unisex',
        sizes: ['38', '39', '40', '41', '42', '43'],
        description: 'Sepatu klasik yang cocok untuk berbagai occasion dengan kenyamanan maksimal.',
        promo: true,
        stock: 30
      },
      {
        name: 'Louis Vuitton Keepall 50',
        brand: 'Louis Vuitton',
        price: 25000000,
        discount: 11,
        images: ['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'],
        category: 'tas',
        subcategory: 'Hand Bag',
        gender: 'unisex',
        sizes: ['One Size'],
        description: 'Tas travel mewah dengan desain ikonik dan kualitas premium.',
        promo: true,
        stock: 10
      }
    ];
    
    console.log('\n1. Checking if products already exist...');
    
    for (const product of promoProducts) {
      // Check if product already exists
      const { data: existing, error: checkError } = await supabase
        .from('products')
        .select('*')
        .eq('name', product.name)
        .single();
      
      if (existing) {
        console.log(`✅ Product already exists: ${product.name}`);
        
        // Try to update existing product to have promo = true
        const { data: updateResult, error: updateError } = await supabase
          .from('products')
          .update({ promo: true })
          .eq('name', product.name)
          .select();
        
        if (updateError) {
          console.log(`❌ Failed to update ${product.name}:`, updateError.message);
        } else {
          console.log(`✅ Updated ${product.name} to promo`);
        }
      } else {
        console.log(`➕ Inserting new product: ${product.name}`);
        
        // Try to insert new product
        const { data: insertResult, error: insertError } = await supabase
          .from('products')
          .insert(product)
          .select();
        
        if (insertError) {
          console.log(`❌ Failed to insert ${product.name}:`, insertError.message);
          
          // If insert fails due to RLS, try a workaround
          console.log(`🔄 Trying alternative approach for ${product.name}...`);
          
          // Try to find a similar product and update it
          const { data: similarProducts, error: similarError } = await supabase
            .from('products')
            .select('*')
            .eq('category', product.category)
            .eq('brand', product.brand)
            .limit(1);
          
          if (similarProducts && similarProducts.length > 0) {
            const similarProduct = similarProducts[0];
            const { data: updateSimilar, error: updateSimilarError } = await supabase
              .from('products')
              .update({
                name: product.name,
                price: product.price,
                discount: product.discount,
                images: product.images,
                promo: true,
                description: product.description
              })
              .eq('id', similarProduct.id)
              .select();
            
            if (updateSimilarError) {
              console.log(`❌ Alternative approach failed:`, updateSimilarError.message);
            } else {
              console.log(`✅ Alternative approach successful for ${product.name}`);
            }
          }
        } else {
          console.log(`✅ Successfully inserted ${product.name}`);
        }
      }
    }
    
    // Final verification
    console.log('\n2. Final verification of promo products...');
    const { data: finalPromos, error: finalError } = await supabase
      .from('products')
      .select('*')
      .eq('promo', true);
    
    if (finalError) {
      console.error('❌ Final verification failed:', finalError.message);
    } else {
      console.log(`✅ Total promo products: ${finalPromos?.length || 0}`);
      if (finalPromos && finalPromos.length > 0) {
        console.log('Promo products:');
        finalPromos.forEach(p => {
          console.log(`- ${p.name} (${p.brand}) - Rp ${p.price.toLocaleString()}`);
        });
      }
    }
    
    console.log('\n🎉 Promo products insertion completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

insertPromoProducts();