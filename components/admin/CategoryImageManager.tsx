'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Upload, 
  Edit, 
  Eye, 
  Save,
  Loader2,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { categories } from '@/lib/mockData';
import DragDropImage from '@/components/ui/drag-drop-image';

interface CategoryImage {
  id: string;
  category_key: string;
  category_name: string;
  image_url: string;
  updated_at: string;
}

interface CategoryImageManagerProps {
  onImagesChange?: (images: CategoryImage[]) => void;
}

export default function CategoryImageManager({ onImagesChange }: CategoryImageManagerProps) {
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryImage | null>(null);
  
  const [formData, setFormData] = useState({
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchCategoryImages();
  }, []);

  const fetchCategoryImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('category_images')
        .select('*')
        .order('category_key', { ascending: true });
      
      if (error) throw error;
      
      // Jika tidak ada data, buat data default dari mockData
      if (!data || data.length === 0) {
        await initializeDefaultImages();
        return;
      }
      
      setCategoryImages(data);
      onImagesChange?.(data);
    } catch (error) {
      console.error('Error fetching category images:', error);
      toast.error('Gagal memuat data gambar kategori');
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultImages = async () => {
    try {
      const defaultImages = {
        sepatu: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
        tas: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
        pakaian: 'https://images.pexels.com/photos/1182825/pexels-photo-1182825.jpeg'
      };

      const defaultData = Object.entries(categories).map(([key, category]) => ({
        category_key: key,
        category_name: category.name,
        image_url: defaultImages[key as keyof typeof defaultImages] || '',
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('category_images')
        .insert(defaultData)
        .select();

      if (error) throw error;

      setCategoryImages(data || []);
      onImagesChange?.(data || []);
      toast.success('Data kategori berhasil diinisialisasi');
    } catch (error) {
      console.error('Error initializing default images:', error);
      toast.error('Gagal menginisialisasi data kategori');
    }
  };

  // Fungsi untuk mengkonversi gambar ke rasio optimal (4:3 atau 3:2)
  const processImageToOptimalRatio = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context tidak tersedia'));
        return;
      }

      img.onload = () => {
        const { width: originalWidth, height: originalHeight } = img;
        const originalRatio = originalWidth / originalHeight;
        
        // Tentukan rasio target berdasarkan rasio asli
        let targetRatio: number;
        if (originalRatio >= 1.4) {
          targetRatio = 3/2; // 1.5 untuk landscape
        } else {
          targetRatio = 4/3; // 1.33 untuk portrait/square
        }
        
        // Hitung dimensi crop untuk mempertahankan kualitas maksimal
        let cropWidth: number, cropHeight: number, cropX: number, cropY: number;
        
        if (originalRatio > targetRatio) {
          // Gambar terlalu lebar, crop dari kiri-kanan
          cropHeight = originalHeight;
          cropWidth = originalHeight * targetRatio;
          cropX = (originalWidth - cropWidth) / 2;
          cropY = 0;
        } else {
          // Gambar terlalu tinggi, crop dari atas-bawah
          cropWidth = originalWidth;
          cropHeight = originalWidth / targetRatio;
          cropX = 0;
          cropY = (originalHeight - cropHeight) / 2;
        }
        
        // Tentukan ukuran output yang optimal (maksimal 1200px untuk sisi terpanjang)
        const maxDimension = 1200;
        let outputWidth: number, outputHeight: number;
        
        if (targetRatio >= 1) {
          // Landscape
          outputWidth = Math.min(maxDimension, cropWidth);
          outputHeight = outputWidth / targetRatio;
        } else {
          // Portrait
          outputHeight = Math.min(maxDimension, cropHeight);
          outputWidth = outputHeight * targetRatio;
        }
        
        // Set canvas size
        canvas.width = outputWidth;
        canvas.height = outputHeight;
        
        // Enable image smoothing untuk kualitas terbaik
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw cropped dan resized image
        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight, // source crop
          0, 0, outputWidth, outputHeight // destination
        );
        
        // Convert canvas ke blob dengan kualitas tinggi
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Gagal mengkonversi gambar'));
              return;
            }
            
            // Buat file baru dengan nama yang menunjukkan rasio
            const ratioText = targetRatio === 3/2 ? '3-2' : '4-3';
            const newFileName = file.name.replace(/\.[^/.]+$/, `_${ratioText}_optimized.jpg`);
            const processedFile = new File([blob], newFileName, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            
            console.log(`Gambar dikonversi ke rasio ${targetRatio === 3/2 ? '3:2' : '4:3'}:`, {
              original: `${originalWidth}x${originalHeight}`,
              processed: `${outputWidth}x${outputHeight}`,
              fileSize: `${(processedFile.size / 1024).toFixed(1)}KB`
            });
            
            resolve(processedFile);
          },
          'image/jpeg',
          0.92 // Kualitas tinggi (92%)
        );
      };
      
      img.onerror = () => {
        reject(new Error('Gagal memuat gambar'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageSelect = async (file: File) => {
    // Handle empty file (when image is removed)
    if (file.size === 0) {
      setFormData(prev => ({ ...prev, image: null }));
      setImagePreview(null);
      return;
    }

    // Validasi file
    const maxSize = 10 * 1024 * 1024; // 10MB untuk file asli
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      toast.error('Ukuran file maksimal 10MB');
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format file harus JPEG, PNG, atau WebP');
      return;
    }

    try {
      // Tampilkan loading
      toast.info('Mengoptimalkan gambar...');
      
      // Proses gambar ke rasio optimal
      const processedFile = await processImageToOptimalRatio(file);
      
      setFormData(prev => ({ ...prev, image: processedFile }));
      
      // Preview gambar yang sudah diproses
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(processedFile);
      
      toast.success('Gambar berhasil dioptimalkan ke rasio ideal');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Gagal memproses gambar. Silakan coba lagi.');
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    try {
      // Validasi file (file sudah dioptimalkan, jadi ukuran lebih kecil)
      const maxSize = 3 * 1024 * 1024; // 3MB untuk file yang sudah dioptimalkan
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      
      if (file.size > maxSize) {
        throw new Error('Ukuran file maksimal 3MB setelah optimasi');
      }
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Format file harus JPEG, PNG, atau WebP');
      }

      console.log('Processing category image file:', { fileName: file.name, fileSize: file.size, fileType: file.type });

      // Convert to base64 as temporary solution until storage policies are fixed
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
          try {
            const base64String = reader.result as string;
            console.log('Category image converted to base64 successfully');
            setUploadProgress(100);
            resolve(base64String);
          } catch (error) {
            console.error('Error converting to base64:', error);
            setUploadProgress(0);
            reject(new Error('Gagal mengkonversi gambar'));
          }
        };
        
        reader.onerror = () => {
          console.error('FileReader error:', reader.error);
          setUploadProgress(0);
          reject(new Error('Gagal membaca file gambar'));
        };
        
        reader.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = (event.loaded / event.total) * 100;
            setUploadProgress(percentage);
          }
        };
        
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error in uploadImageToSupabase:', error);
      setUploadProgress(0);
      throw error;
    }
  };

  const handleUpdateCategoryImage = async () => {
    if (!editingCategory || !formData.image) {
      toast.error('Pilih gambar untuk diupload');
      return;
    }

    try {
      setSaving(true);
      setUploadProgress(0);
      
      const imageUrl = await uploadImageToSupabase(formData.image);
      
      const { error } = await supabase
        .from('category_images')
        .update({ 
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingCategory.id);

      if (error) throw error;

      toast.success(`Gambar kategori ${editingCategory.category_name} berhasil diperbarui`);
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      resetForm();
      fetchCategoryImages();
    } catch (error) {
      console.error('Error updating category image:', error);
      toast.error('Gagal memperbarui gambar kategori');
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFormData({
      image: null
    });
    setImagePreview(null);
    setUploadProgress(0);
  };

  const openEditDialog = (categoryImage: CategoryImage) => {
    setEditingCategory(categoryImage);
    setImagePreview(categoryImage.image_url);
    setFormData({ image: null });
    setIsEditDialogOpen(true);
  };

  const handleResetToDefault = async (categoryImage: CategoryImage) => {
    try {
      setSaving(true);
      
      const defaultImages = {
        sepatu: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
        tas: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
        pakaian: 'https://images.pexels.com/photos/1182825/pexels-photo-1182825.jpeg'
      };

      const defaultUrl = defaultImages[categoryImage.category_key as keyof typeof defaultImages];
      
      if (!defaultUrl) {
        toast.error('Gambar default tidak tersedia untuk kategori ini');
        return;
      }

      const { error } = await supabase
        .from('category_images')
        .update({ 
          image_url: defaultUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryImage.id);

      if (error) throw error;

      toast.success(`Gambar kategori ${categoryImage.category_name} berhasil direset ke default`);
      fetchCategoryImages();
    } catch (error) {
      console.error('Error resetting category image:', error);
      toast.error('Gagal mereset gambar kategori');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Kelola Gambar Kategori Populer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Kelola Gambar Kategori Populer
        </CardTitle>
        <CardDescription>
          Ubah gambar yang ditampilkan pada section "Kategori Populer"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Total: {categoryImages.length} kategori
            </p>
            <Button 
              variant="outline" 
              onClick={fetchCategoryImages}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {categoryImages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="mx-auto h-12 w-12 mb-4" />
              <p>Belum ada data kategori. Klik refresh untuk menginisialisasi.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryImages.map((categoryImage) => (
                <div key={categoryImage.id} className="border rounded-lg overflow-hidden bg-card">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={categoryImage.image_url}
                      alt={categoryImage.category_name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-lg font-bold text-white text-center px-2">
                        {categoryImage.category_name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {categoryImage.category_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(categoryImage.updated_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => openEditDialog(categoryImage)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset ke Gambar Default</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin mereset gambar kategori "{categoryImage.category_name}" 
                              ke gambar default? Gambar saat ini akan diganti.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleResetToDefault(categoryImage)}
                              disabled={saving}
                            >
                              {saving ? 'Mereset...' : 'Reset'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Gambar Kategori</DialogTitle>
              <DialogDescription>
                Perbarui gambar untuk kategori "{editingCategory?.category_name}"
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Gambar Saat Ini</Label>
                  {editingCategory && (
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border">
                      <Image
                        src={editingCategory.image_url}
                        alt={editingCategory.category_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category-image">Upload Gambar Baru</Label>
                  <DragDropImage
                    onImageSelect={handleImageSelect}
                    currentImage={formData.image ? imagePreview || undefined : undefined}
                    className="min-h-[150px] aspect-[4/3]"
                    disabled={saving}
                    acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                  />
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    ✨ Gambar akan dioptimalkan secara otomatis ke rasio 4:3 atau 3:2
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center gap-2">
                  ✨ Optimasi Gambar Otomatis
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-blue-800 mb-1">Fitur Otomatis:</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Konversi ke rasio 4:3 atau 3:2</li>
                      <li>• Crop cerdas dari tengah gambar</li>
                      <li>• Resize optimal (maks 1200px)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-800 mb-1">Tips Upload:</p>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• Upload gambar berkualitas tinggi</li>
                      <li>• Objek utama di tengah gambar</li>
                      <li>• Format: JPEG, PNG, WebP</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleUpdateCategoryImage} 
                disabled={saving || !formData.image}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}