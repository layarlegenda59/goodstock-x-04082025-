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

async function testDatabaseDirect() {
  console.log('🔧 Testing database direct queries...');
  
  try {
    // Test 1: Check table structure
    console.log('\n1. Checking table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('exec_sql', { 
        sql_query: "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'promo';" 
      });
    
    if (tableError) {
      console.log('❌ Table structure check failed:', tableError.message);
    } else {
      console.log('✅ Table structure:', tableInfo);
    }
    
    // Test 2: Direct SQL update
    console.log('\n2. Trying direct SQL update...');
    const { data: sqlUpdate, error: sqlError } = await supabase
      .rpc('exec_sql', { 
        sql_query: "UPDATE products SET promo = true WHERE id IN (SELECT id FROM products LIMIT 3);" 
      });
    
    if (sqlError) {
      console.log('❌ Direct SQL update failed:', sqlError.message);
    } else {
      console.log('✅ Direct SQL update result:', sqlUpdate);
    }
    
    // Test 3: Direct SQL count
    console.log('\n3. Direct SQL count of promo products...');
    const { data: sqlCount, error: countError } = await supabase
      .rpc('exec_sql', { 
        sql_query: "SELECT COUNT(*) as promo_count FROM products WHERE promo = true;" 
      });
    
    if (countError) {
      console.log('❌ Direct SQL count failed:', countError.message);
    } else {
      console.log('✅ Direct SQL count result:', sqlCount);
    }
    
    // Test 4: Check specific products
    console.log('\n4. Checking specific products with SQL...');
    const { data: specificProducts, error: specificError } = await supabase
      .rpc('exec_sql', { 
        sql_query: "SELECT id, name, promo FROM products LIMIT 5;" 
      });
    
    if (specificError) {
      console.log('❌ Specific products check failed:', specificError.message);
    } else {
      console.log('✅ Specific products:', specificProducts);
    }
    
    // Test 5: Try manual insert with SQL
    console.log('\n5. Trying manual insert with SQL...');
    const { data: insertResult, error: insertError } = await supabase
      .rpc('exec_sql', { 
        sql_query: `INSERT INTO products (name, brand, price, discount, category, subcategory, gender, sizes, images, description, promo, stock) 
                   VALUES ('Test Promo Product', 'Test Brand', 100000, 10, 'sepatu', 'Sneakers', 'unisex', 
                          ARRAY['40', '41'], ARRAY['https://example.com/image.jpg'], 'Test promo product', true, 50) 
                   ON CONFLICT (name) DO UPDATE SET promo = true;` 
      });
    
    if (insertError) {
      console.log('❌ Manual insert failed:', insertError.message);
    } else {
      console.log('✅ Manual insert result:', insertResult);
    }
    
    // Test 6: Final verification with both methods
    console.log('\n6. Final verification with both methods...');
    
    // Method A: Using Supabase client
    const { data: clientPromos, error: clientError } = await supabase
      .from('products')
      .select('*')
      .eq('promo', true);
    
    console.log(`Client method - Promo products: ${clientPromos?.length || 0}`);
    if (clientError) {
      console.log('Client error:', clientError.message);
    }
    
    // Method B: Using SQL
    const { data: sqlPromos, error: sqlPromosError } = await supabase
      .rpc('exec_sql', { 
        sql_query: "SELECT * FROM products WHERE promo = true;" 
      });
    
    if (sqlPromosError) {
      console.log('❌ SQL promo check failed:', sqlPromosError.message);
    } else {
      console.log(`SQL method - Promo products: ${Array.isArray(sqlPromos) ? sqlPromos.length : 'Unknown'}`);
      if (Array.isArray(sqlPromos) && sqlPromos.length > 0) {
        console.log('SQL Promo products found:');
        sqlPromos.forEach((p, index) => {
          console.log(`${index + 1}. ${p.name} - Promo: ${p.promo}`);
        });
      }
    }
    
    console.log('\n🎉 Database direct test completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDatabaseDirect();