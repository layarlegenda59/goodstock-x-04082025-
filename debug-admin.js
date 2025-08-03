// Debug script untuk memeriksa dan memperbaiki admin login
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eldhtxtnwdanyavkikap.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZGh0eHRud2Rhbnlhdmtpa2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzc4NTgsImV4cCI6MjA2OTcxMzg1OH0.Wz7TtwZqZT3m4UCqN9XF1O3ifnrnaOQezXasvZ-uX7Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndFixProfiles() {
  try {
    console.log('=== DEBUGGING ADMIN LOGIN ISSUE ===\n');
    
    // 1. Cek semua profil yang ada
    console.log('1. Memeriksa profil yang ada...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profileError) {
      console.error('Error mengambil profil:', profileError);
    } else {
      console.log(`Ditemukan ${profiles?.length || 0} profil:`);
      if (profiles && profiles.length > 0) {
        profiles.forEach(profile => {
          console.log(`- ${profile.email} (${profile.role}) - ID: ${profile.id}`);
        });
      }
    }
    
    console.log('\n2. Memeriksa user di auth.users...');
    
    // 2. Coba login dengan kredensial admin untuk mendapatkan user ID
    console.log('\nSilakan masukkan kredensial admin untuk debugging:');
    console.log('Email admin: (masukkan email yang sudah Anda buat di Supabase Auth)');
    console.log('Password: (masukkan password yang sudah Anda set)');
    
    // Untuk debugging, kita akan coba beberapa email umum admin
    const commonAdminEmails = [
      'admin@goodstock.com',
      'admin@example.com', 
      'admin@admin.com',
      'test@admin.com'
    ];
    
    console.log('\n3. Mencoba mencari user dengan email admin umum...');
    
    // Cek apakah ada user yang belum punya profil
    for (const email of commonAdminEmails) {
      try {
        // Coba login untuk mendapatkan user data
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email,
          password: 'admin123' // password umum untuk testing
        });
        
        if (!loginError && loginData.user) {
          console.log(`✓ Berhasil login dengan ${email}`);
          console.log(`User ID: ${loginData.user.id}`);
          
          // Cek apakah user ini sudah punya profil
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', loginData.user.id)
            .single();
          
          if (!existingProfile) {
            console.log(`User ${email} belum punya profil. Membuat profil admin...`);
            
            // Buat profil admin
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
              console.error('Error membuat profil:', createError);
            } else {
              console.log('✓ Profil admin berhasil dibuat:', newProfile);
            }
          } else {
            console.log(`User ${email} sudah punya profil:`, existingProfile);
            
            // Update role menjadi admin jika belum
            if (existingProfile.role !== 'admin') {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ role: 'admin' })
                .eq('id', loginData.user.id);
              
              if (updateError) {
                console.error('Error update role:', updateError);
              } else {
                console.log('✓ Role berhasil diupdate menjadi admin');
              }
            }
          }
          
          // Logout setelah testing
          await supabase.auth.signOut();
          break;
        }
      } catch (err) {
        // Ignore error, lanjut ke email berikutnya
      }
    }
    
    console.log('\n=== HASIL AKHIR ===');
    
    // Cek lagi profil setelah perbaikan
    const { data: finalProfiles } = await supabase
      .from('profiles')
      .select('*');
    
    console.log(`Total profil sekarang: ${finalProfiles?.length || 0}`);
    if (finalProfiles && finalProfiles.length > 0) {
      finalProfiles.forEach(profile => {
        console.log(`- ${profile.email} (${profile.role})`);
      });
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

// Jalankan debug
checkAndFixProfiles();