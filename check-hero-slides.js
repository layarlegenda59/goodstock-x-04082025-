const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eldhtxtnwdanyavkikap.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZGh0eHRud2Rhbnlhdmtpa2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzc4NTgsImV4cCI6MjA2OTcxMzg1OH0.Wz7TtwZqZT3m4UCqN9XF1O3ifnrnaOQezXasvZ-uX7Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkHeroSlides() {
  try {
    console.log('🔍 Checking current hero slides data...');
    
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('order_index');
    
    if (error) {
      console.error('❌ Error fetching hero slides:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log(`\n✅ Found ${data.length} hero slides:`);
      data.forEach((slide, index) => {
        console.log(`\n${index + 1}. ID: ${slide.id}`);
        console.log(`   Title: ${slide.title}`);
        console.log(`   Subtitle: ${slide.subtitle}`);
        console.log(`   Image URL: ${slide.image_url}`);
        console.log(`   CTA Text: ${slide.cta_text}`);
        console.log(`   CTA Link: ${slide.cta_link}`);
        console.log(`   Active: ${slide.is_active}`);
        console.log(`   Order: ${slide.order_index}`);
      });
      
      // Check which images are causing problems
      console.log('\n🔍 Checking problematic image URLs:');
      const problematicUrls = data.filter(slide => 
        slide.image_url && (
          slide.image_url.includes('hero-slide-175') || 
          slide.image_url.includes('hero-slide-1756600498734.jpg')
        )
      );
      
      if (problematicUrls.length > 0) {
        console.log('❌ Found problematic image URLs:');
        problematicUrls.forEach(slide => {
          console.log(`   - Slide "${slide.title}": ${slide.image_url}`);
        });
      } else {
        console.log('✅ No problematic image URLs found');
      }
      
    } else {
      console.log('\n📭 No hero slides found');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkHeroSlides();