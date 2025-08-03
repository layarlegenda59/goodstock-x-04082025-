// Script untuk membuat profil admin secara manual
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eldhtxtnwdanyavkikap.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZGh0eHRud2Rhbnlhdmtpa2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzc4NTgsImV4cCI6MjA2OTcxMzg1OH0.Wz7TtwZqZT3m4UCqN9XF1O3ifnrnaOQezXasvZ-uX7Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GANTI EMAIL DAN PASSWORD INI DENGAN KREDENSIAL ADMIN YANG SUDAH ANDA BUAT DI SUPABASE AUTH
const ADMIN_EMAIL = 'admin@example.com'; // Ganti dengan email admin Anda
const ADMIN_PASSWORD = 'password123';     // Ganti dengan password admin Anda

async function createAdminProfile() {
  try {
    console.log('=== MEMBUAT PROFIL ADMIN ===\n');
    
    console.log(`Mencoba login dengan email: ${ADMIN_EMAIL}`);
    
    // 1. Login dengan kredensial admin
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (loginError) {
      console.error('❌ Error login:', loginError.message);
      console.log('\n📝 INSTRUKSI:');
      console.log('1. Pastikan Anda sudah membuat user di Supabase Auth Dashboard');
      console.log('2. Update email dan password di script ini (baris 9-10)');
      console.log('3. Jalankan script lagi');
      return;
    }
    
    if (!loginData.user) {
      console.error('❌ Login berhasil tapi tidak ada data user');
      return;
    }
    
    console.log('✅ Login berhasil!');
    console.log(`User ID: ${loginData.user.id}`);
    console.log(`Email: ${loginData.user.email}`);
    
    // 2. Cek apakah profil sudah ada
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error cek profil:', profileError);
      return;
    }
    
    if (existingProfile) {
      console.log('\n📋 Profil sudah ada:');
      console.log(`- Email: ${existingProfile.email}`);
      console.log(`- Role: ${existingProfile.role}`);
      console.log(`- Full Name: ${existingProfile.full_name}`);
      
      if (existingProfile.role === 'admin') {
        console.log('✅ User sudah memiliki role admin!');
      } else {
        console.log('\n🔄 Mengupdate role menjadi admin...');
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', loginData.user.id);
        
        if (updateError) {
          console.error('❌ Error update role:', updateError);
        } else {
          console.log('✅ Role berhasil diupdate menjadi admin!');
        }
      }
    } else {
      console.log('\n📝 Profil belum ada, membuat profil baru...');
      
      // 3. Buat profil admin baru
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: loginData.user.id,
          email: loginData.user.email,
          full_name: loginData.user.user_metadata?.full_name || 'Admin',
          phone: loginData.user.user_metadata?.phone || '',
          role: 'admin'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error membuat profil:', createError);
      } else {
        console.log('✅ Profil admin berhasil dibuat!');
        console.log('📋 Detail profil:');
        console.log(`- Email: ${newProfile.email}`);
        console.log(`- Role: ${newProfile.role}`);
        console.log(`- Full Name: ${newProfile.full_name}`);
      }
    }
    
    // 4. Logout
    await supabase.auth.signOut();
    
    console.log('\n=== SELESAI ===');
    console.log('🎉 Sekarang Anda bisa login ke /admin/login dengan kredensial yang sama!');
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

// Jalankan script
createAdminProfile();