const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eldhtxtnwdanyavkikap.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZGh0eHRud2Rhbnlhdmtpa2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzc4NTgsImV4cCI6MjA2OTcxMzg1OH0.Wz7TtwZqZT3m4UCqN9XF1O3ifnrnaOQezXasvZ-uX7Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanHeroSlides() {
  try {
    console.log('🧹 Cleaning hero slides data...');
    
    // 1. Get all hero slides
    console.log('\n1. Fetching current hero slides...');
    const { data: slides, error: fetchError } = await supabase
      .from('hero_slides')
      .select('*')
      .order('order_index');
    
    if (fetchError) {
      console.error('❌ Error fetching slides:', fetchError.message);
      return;
    }
    
    console.log(`✅ Found ${slides?.length || 0} hero slides`);
    
    if (slides && slides.length > 0) {
      // 2. Delete all existing slides
      console.log('\n2. Deleting existing slides...');
      const { error: deleteError } = await supabase
        .from('hero_slides')
        .delete()
        .neq('id', 0); // Delete all rows
      
      if (deleteError) {
        console.error('❌ Error deleting slides:', deleteError.message);
        return;
      }
      
      console.log('✅ All existing slides deleted');
    }
    
    // 3. Insert sample slides with placeholder images
    console.log('\n3. Inserting sample slides...');
    const sampleSlides = [
      {
        title: 'Selamat Datang di Goodstock',
        subtitle: 'Platform e-commerce terpercaya untuk semua kebutuhan Anda',
        image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop',
        cta_text: 'Belanja Sekarang',
        cta_link: '/products',
        is_active: true,
        order_index: 1
      },
      {
        title: 'Produk Berkualitas Tinggi',
        subtitle: 'Dapatkan produk terbaik dengan harga terjangkau',
        image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop',
        cta_text: 'Lihat Katalog',
        cta_link: '/categories',
        is_active: true,
        order_index: 2
      },
      {
        title: 'Pengiriman Cepat & Aman',
        subtitle: 'Nikmati layanan pengiriman terpercaya ke seluruh Indonesia',
        image_url: 'https://images.unsplash.com/photo-1586880244386-8b3e34c8382c?w=1200&h=600&fit=crop',
        cta_text: 'Pelajari Lebih Lanjut',
        cta_link: '/about',
        is_active: true,
        order_index: 3
      }
    ];
    
    const { data: newSlides, error: insertError } = await supabase
      .from('hero_slides')
      .insert(sampleSlides)
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting slides:', insertError.message);
      return;
    }
    
    console.log(`✅ Successfully inserted ${newSlides?.length || 0} sample slides`);
    
    // 4. Verify the new data
    console.log('\n4. Verifying new slides...');
    const { data: verifySlides, error: verifyError } = await supabase
      .from('hero_slides')
      .select('*')
      .order('order_index');
    
    if (verifyError) {
      console.error('❌ Error verifying slides:', verifyError.message);
      return;
    }
    
    console.log('✅ Verification successful:');
    verifySlides?.forEach((slide, index) => {
      console.log(`   ${index + 1}. ${slide.title} (Order: ${slide.order_index})`);
    });
    
    console.log('\n🎉 Hero slides cleanup completed!');
    console.log('\n💡 The new slides use Unsplash images which should load properly.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

cleanHeroSlides();