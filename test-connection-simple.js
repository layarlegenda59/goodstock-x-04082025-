const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eldhtxtnwdanyavkikap.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZGh0eHRud2Rhbnlhdmtpa2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzc4NTgsImV4cCI6MjA2OTcxMzg1OH0.Wz7TtwZqZT3m4UCqN9XF1O3ifnrnaOQezXasvZ-uX7Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Basic products query
    console.log('\n1. Testing basic products query...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, promo')
      .limit(5);
    
    if (productsError) {
      console.error('❌ Products query failed:', productsError.message);
      console.error('Error details:', productsError);
    } else {
      console.log(`✅ Products query successful: ${products?.length || 0} products`);
      if (products && products.length > 0) {
        console.log('Sample products:');
        products.forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.name} - promo: ${p.promo}`);
        });
      }
    }
    
    // Test 2: Count all products
    console.log('\n2. Testing products count...');
    const { count: totalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Count query failed:', countError.message);
    } else {
      console.log(`✅ Total products count: ${totalCount || 0}`);
    }
    
    // Test 3: Promo products query (the problematic one)
    console.log('\n3. Testing promo products query...');
    try {
      const { data: promoProducts, error: promoError } = await supabase
        .from('products')
        .select('id, name, promo')
        .eq('promo', true);
      
      if (promoError) {
        console.error('❌ Promo query failed:', promoError.message);
        console.error('Error details:', promoError);
      } else {
        console.log(`✅ Promo query successful: ${promoProducts?.length || 0} promo products`);
        if (promoProducts && promoProducts.length > 0) {
          console.log('Promo products:');
          promoProducts.forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.name}`);
          });
        }
      }
    } catch (promoErr) {
      console.error('❌ Promo query exception:', promoErr.message);
    }
    
    // Test 4: Alternative promo query
    console.log('\n4. Testing alternative promo query...');
    try {
      const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select('id, name, promo');
      
      if (allError) {
        console.error('❌ All products query failed:', allError.message);
      } else {
        const promoCount = allProducts?.filter(p => p.promo === true).length || 0;
        console.log(`✅ Alternative method found ${promoCount} promo products`);
      }
    } catch (altErr) {
      console.error('❌ Alternative query exception:', altErr.message);
    }
    
    console.log('\n🎉 Connection test completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testConnection();