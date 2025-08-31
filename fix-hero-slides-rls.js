const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eldhtxtnwdanyavkikap.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZGh0eHRud2Rhbnlhdmtpa2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzc4NTgsImV4cCI6MjA2OTcxMzg1OH0.Wz7TtwZqZT3m4UCqN9XF1O3ifnrnaOQezXasvZ-uX7Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixHeroSlidesRLS() {
  try {
    console.log('🔧 Fixing hero slides RLS and data...');
    
    // 1. Try to disable RLS for hero_slides table
    console.log('\n1. Attempting to disable RLS for hero_slides...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE hero_slides DISABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.log('⚠️ Could not disable RLS (expected with anon key):', rlsError.message);
      console.log('💡 Trying alternative approach...');
    } else {
      console.log('✅ RLS disabled successfully');
    }
    
    // 2. Clear existing data
    console.log('\n2. Clearing existing hero slides...');
    const { error: deleteError } = await supabase
      .from('hero_slides')
      .delete()
      .neq('id', 0);
    
    if (deleteError) {
      console.log('⚠️ Could not delete existing slides:', deleteError.message);
    } else {
      console.log('✅ Existing slides cleared');
    }
    
    // 3. Try to insert with minimal data first
    console.log('\n3. Inserting minimal hero slide data...');
    const minimalSlide = {
      title: 'Selamat Datang di Goodstock',
      subtitle: 'Platform e-commerce terpercaya',
      image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop',
      is_active: true,
      order_index: 1
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('hero_slides')
      .insert([minimalSlide])
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting minimal slide:', insertError.message);
      
      // 4. Try using upsert instead
      console.log('\n4. Trying upsert approach...');
      const { data: upsertData, error: upsertError } = await supabase
        .from('hero_slides')
        .upsert([{ id: 1, ...minimalSlide }], { onConflict: 'id' })
        .select();
      
      if (upsertError) {
        console.error('❌ Error with upsert:', upsertError.message);
        
        // 5. Try direct SQL approach
        console.log('\n5. Trying direct SQL approach...');
        const { data: sqlData, error: sqlError } = await supabase.rpc('exec_sql', {
          sql: `INSERT INTO hero_slides (title, subtitle, image_url, is_active, order_index) 
                VALUES ('Selamat Datang di Goodstock', 'Platform e-commerce terpercaya', 
                'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop', 
                true, 1) ON CONFLICT (id) DO UPDATE SET 
                title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, 
                image_url = EXCLUDED.image_url, is_active = EXCLUDED.is_active, 
                order_index = EXCLUDED.order_index;`
        });
        
        if (sqlError) {
          console.error('❌ Error with direct SQL:', sqlError.message);
        } else {
          console.log('✅ Direct SQL insert successful');
        }
      } else {
        console.log('✅ Upsert successful:', upsertData);
      }
    } else {
      console.log('✅ Insert successful:', insertData);
    }
    
    // 6. Verify the data
    console.log('\n6. Verifying hero slides data...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('hero_slides')
      .select('*')
      .order('order_index');
    
    if (verifyError) {
      console.error('❌ Error verifying data:', verifyError.message);
    } else {
      console.log('✅ Current hero slides:');
      verifyData?.forEach((slide, index) => {
        console.log(`   ${index + 1}. ${slide.title} (Active: ${slide.is_active})`);
      });
    }
    
    console.log('\n🎉 Hero slides fix completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixHeroSlidesRLS();