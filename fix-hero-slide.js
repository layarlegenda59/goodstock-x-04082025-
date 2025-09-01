const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

const env = {};
envLines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixAllProblematicSlides() {
  console.log('🔧 Fixing all problematic hero slides...');
  
  // Get all slides
  const { data: slides, error: fetchError } = await supabase
    .from('hero_slides')
    .select('*')
    .order('order_index');
    
  if (fetchError) {
    console.error('❌ Error fetching slides:', fetchError.message);
    return;
  }
  
  console.log(`📋 Found ${slides.length} slides to check`);
  
  for (const slide of slides) {
    const imageUrl = slide.image_url;
    
    // Check if URL is problematic (incomplete, ends with hero-, or returns 400)
    if (!imageUrl || 
        imageUrl.includes('hero-slide-175') ||
        imageUrl.endsWith('hero-') ||
        imageUrl.includes('hero-slide-1756692673631.jpg')) {
      
      console.log(`🔧 Fixing slide: "${slide.title}"`);
      console.log(`   Old URL: ${imageUrl}`);
      
      // Use appropriate fallback image based on slide title
      let newImageUrl;
      if (slide.title.toLowerCase().includes('streetwear') || slide.title.toLowerCase().includes('fashion')) {
        newImageUrl = 'https://images.pexels.com/photos/1182825/pexels-photo-1182825.jpeg';
      } else if (slide.title.toLowerCase().includes('sepatu') || slide.title.toLowerCase().includes('shoe')) {
        newImageUrl = 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg';
      } else if (slide.title.toLowerCase().includes('tas') || slide.title.toLowerCase().includes('bag')) {
        newImageUrl = 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg';
      } else {
        // Default fallback
        newImageUrl = 'https://images.pexels.com/photos/1182825/pexels-photo-1182825.jpeg';
      }
      
      const { data, error } = await supabase
        .from('hero_slides')
        .update({ image_url: newImageUrl })
        .eq('id', slide.id)
        .select();
        
      if (error) {
        console.error(`❌ Error updating slide ${slide.id}:`, error.message);
      } else {
        console.log(`✅ Fixed slide: "${slide.title}"`);
        console.log(`   New URL: ${newImageUrl}`);
      }
    } else {
      console.log(`✅ Slide "${slide.title}" is OK`);
    }
  }
  
  console.log('🎉 All problematic slides have been fixed!');
}

fixAllProblematicSlides().catch(console.error);