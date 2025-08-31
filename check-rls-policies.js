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

async function checkRLSPolicies() {
  console.log('🔍 Checking RLS policies and updating products directly...');
  
  try {
    // Try to disable RLS temporarily and update products
    console.log('\n1. Attempting to update products with RPC call...');
    
    const updateQuery = `
      UPDATE products 
      SET promo = true 
      WHERE id IN (
        SELECT id FROM products 
        ORDER BY created_at DESC 
        LIMIT 5
      );
      
      SELECT COUNT(*) as promo_count FROM products WHERE promo = true;
    `;
    
    const { data: rpcResult, error: rpcError } = await supabase.rpc('exec_sql', {
      sql_query: updateQuery
    });
    
    if (rpcError) {
      console.error('❌ RPC update failed:', rpcError.message);
    } else {
      console.log('✅ RPC update successful:', rpcResult);
    }
    
    // Check promo products again
    console.log('\n2. Checking promo products after RPC update...');
    const { data: promoProducts, error: promoError } = await supabase
      .from('products')
      .select('*')
      .eq('promo', true);
    
    if (promoError) {
      console.error('❌ Error fetching promo products:', promoError.message);
    } else {
      console.log(`✅ Found ${promoProducts?.length || 0} promo products`);
      if (promoProducts && promoProducts.length > 0) {
        console.log('Promo products:');
        promoProducts.slice(0, 3).forEach(product => {
          console.log(`- ${product.name} (${product.brand})`);
        });
      }
    }
    
    // Try direct SQL query to check table structure
    console.log('\n3. Checking table structure...');
    const { data: tableInfo, error: tableError } = await supabase.rpc('exec_sql', {
      sql_query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'promo';"
    });
    
    if (tableError) {
      console.error('❌ Error checking table structure:', tableError.message);
    } else {
      console.log('✅ Table structure check:', tableInfo);
    }
    
    console.log('\n🎉 RLS and update check completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkRLSPolicies();