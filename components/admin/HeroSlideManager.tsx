'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Plus, 
  Upload, 
  Trash2, 
  Edit, 
  GripVertical, 
  Eye, 
  Save,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAdminAuthStore } from '@/store/admin-auth';
import DragDropImage from '@/components/ui/drag-drop-image';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  order_index: number;
  is_active?: boolean;
}

interface HeroSlideManagerProps {
  onSlidesChange?: (slides: HeroSlide[]) => void;
}

export default function HeroSlideManager({ onSlidesChange }: HeroSlideManagerProps) {
  const { adminUser, adminProfile, isAdminAuthenticated } = useAdminAuthStore();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [hasNetworkError, setHasNetworkError] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    cta: '',
    link: '',
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [draggedSlideId, setDraggedSlideId] = useState<string | null>(null);
  const [optimisticSlides, setOptimisticSlides] = useState<HeroSlide[]>([]);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const uploadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSlides = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      // Map database fields to component interface
      const mappedData = data?.map(slide => {
        // Keep the original image URL from database
        // Only use fallback for old problematic URLs, not new uploads
        let imageUrl = slide.image_url;
        
        // Keep the original image URL from database
         // Let the Image component handle loading errors with onError handler
        
        return {
          id: slide.id,
          title: slide.title,
          subtitle: slide.subtitle || '',
          image_url: imageUrl,
          cta_text: slide.cta_text || 'Shop Now',
          cta_link: slide.cta_link || '/',
          order_index: slide.order_index,
          is_active: slide.is_active
        };
      }) || [];
      
      setSlides(mappedData);
      onSlidesChange?.(mappedData);
      
      // Reset error states on successful fetch
      setHasNetworkError(false);
      setRetryAttempts(0);
    } catch (error) {
      console.error('Error fetching slides:', error);
      
      // Check if it's a network-related error
      const isNetworkError = error.name === 'AbortError' || error.message?.includes('fetch') || error.message?.includes('QUIC') || error.message?.includes('Failed to fetch');
      
      // Retry logic for network errors
      if (retryCount < 2 && isNetworkError) {
        console.log(`Retrying fetch slides (attempt ${retryCount + 1})...`);
        setTimeout(() => fetchSlides(retryCount + 1), 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      // Set network error state for auto-retry mechanism
      if (isNetworkError && retryCount >= 2) {
        setHasNetworkError(true);
      }
      
      // Fallback to empty array with user-friendly message
      setSlides([]);
      onSlidesChange?.([]);
      
      // Show user-friendly error message
      if (error.name === 'AbortError') {
        toast.error('Koneksi timeout. Akan mencoba lagi otomatis.');
      } else if (isNetworkError) {
        toast.error('Masalah koneksi jaringan. Sistem akan mencoba memuat ulang otomatis.');
      } else {
        toast.error('Gagal memuat data slide. Silakan refresh halaman.');
      }
    } finally {
      setLoading(false);
    }
  }, [onSlidesChange]);

  // Initial fetch and dependency on fetchSlides
  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  // Auto-retry mechanism for network errors
  useEffect(() => {
    if (hasNetworkError && retryAttempts < 3) {
      const retryDelay = Math.min(5000 * Math.pow(2, retryAttempts), 30000); // Max 30 seconds
      console.log(`Auto-retry scheduled in ${retryDelay/1000} seconds (attempt ${retryAttempts + 1})`);
      
      retryTimeoutRef.current = setTimeout(() => {
        console.log('Auto-retrying to fetch slides...');
        setRetryAttempts(prev => prev + 1);
        fetchSlides(0); // Reset retry count for fetchSlides
      }, retryDelay);
      
      return () => {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
      };
    }
  }, [hasNetworkError, retryAttempts, fetchSlides]);

  // Sync optimistic slides with actual slides
  useEffect(() => {
    setOptimisticSlides(slides);
  }, [slides]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const handleImageSelect = useCallback((file: File | null) => {
    // Handle null or empty file (when image is removed)
    if (!file || file.size === 0) {
      setFormData(prev => ({ ...prev, image: null }));
      setImagePreview(null);
      return;
    }
    
    setFormData(prev => ({ ...prev, image: file }));
    
    // Create preview using FileReader for immediate display
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      console.log('Image preview set from FileReader');
    };
    reader.readAsDataURL(file);
  }, []);

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    try {
      // Validasi file
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      
      if (file.size > maxSize) {
        throw new Error('Ukuran file maksimal 10MB');
      }
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Format file harus JPEG, PNG, atau WebP');
      }

      console.log('Processing image file:', { fileName: file.name, fileSize: file.size, fileType: file.type });

      // Upload to Supabase Storage bucket 'hero_slides'
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-slide-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`; // Direct file path without subfolder

      console.log('Uploading to Supabase Storage bucket hero_slides:', filePath);
      
      try {
        const { error: uploadError } = await supabase.storage
          .from('hero_slides')
          .upload(filePath, file, {
            onUploadProgress: (progress) => {
              const percentage = (progress.loaded / progress.total) * 100;
              setUploadProgress(percentage);
              console.log(`Upload progress: ${percentage.toFixed(1)}%`);
            }
          });

        if (uploadError) {
          console.warn('Supabase upload failed, using base64 fallback:', uploadError.message);
          // Fallback to base64 if Supabase fails
          return await convertFileToBase64(file);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('hero_slides')
          .getPublicUrl(filePath);

        console.log('Image uploaded successfully:', publicUrl);
        setUploadProgress(100);
        return publicUrl;
      } catch (supabaseError) {
        console.warn('Supabase storage not available, using base64 fallback:', supabaseError);
        // Fallback to base64 if Supabase is not available
        return await convertFileToBase64(file);
      }
    } catch (error) {
      console.error('Error in uploadImageToSupabase:', error);
      setUploadProgress(0);
      
      // Final fallback
      console.log('Using final fallback image due to error...');
      return 'https://images.pexels.com/photos/1182825/pexels-photo-1182825.jpeg';
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      setUploadProgress(100);
    });
  };

  const handleAddSlide = async () => {
    if (!formData.title || !formData.image) {
      toast.error('Judul dan gambar wajib diisi');
      return;
    }

    // Validasi autentikasi admin
    if (!isAdminAuthenticated || !adminUser || adminProfile?.role !== 'admin') {
      toast.error('Anda harus login sebagai admin untuk melakukan perubahan');
      return;
    }

    try {
      setSaving(true);
      setUploadProgress(0);
      
      console.log('Starting slide upload process...');
      const imageUrl = await uploadImageToSupabase(formData.image);
      console.log('Image uploaded successfully:', imageUrl);
      
      const newSlide = {
        title: formData.title,
        subtitle: formData.subtitle,
        image_url: imageUrl,
        cta_text: formData.cta || 'Shop Now',
        cta_link: formData.link || '/',
        order_index: slides.length,
        is_active: true
      };

      console.log('Inserting slide to database:', newSlide);
      const { data, error } = await supabase
        .from('hero_slides')
        .insert([newSlide])
        .select();

      if (error) {
        console.error('Database insert error:', error);
        throw new Error(`Gagal menyimpan ke database: ${error.message}`);
      }

      console.log('Slide saved successfully:', data);
      toast.success('Slide berhasil ditambahkan');
      setIsAddDialogOpen(false);
      resetForm();
      fetchSlides();
    } catch (error: any) {
      console.error('Error adding slide:', error);
      const errorMessage = error?.message || 'Gagal menambahkan slide';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  const handleEditSlide = async () => {
    if (!editingSlide || !formData.title) {
      toast.error('Judul wajib diisi');
      return;
    }

    // Validasi autentikasi admin
    if (!isAdminAuthenticated || !adminUser || adminProfile?.role !== 'admin') {
      toast.error('Anda harus login sebagai admin untuk melakukan perubahan');
      return;
    }

    try {
      setSaving(true);
      
      let imageUrl = editingSlide.image_url;
      
      if (formData.image) {
        setUploadProgress(0);
        console.log('Updating slide with new image...');
        imageUrl = await uploadImageToSupabase(formData.image);
        console.log('New image uploaded successfully:', imageUrl);
        
        // Keep the current preview (base64) for immediate display
        // The new URL will be used in the database and fetched later
        console.log('Keeping current preview for immediate display');
      }
      
      const updatedSlide = {
        title: formData.title,
        subtitle: formData.subtitle,
        image_url: imageUrl,
        cta_text: formData.cta || 'Shop Now',
        cta_link: formData.link || '/',
        updated_at: new Date().toISOString()
      };

      console.log('Updating slide in database:', { id: editingSlide.id, updatedSlide });
      const { data, error } = await supabase
        .from('hero_slides')
        .update(updatedSlide)
        .eq('id', editingSlide.id)
        .select();

      if (error) {
        console.error('Database update error:', error);
        throw new Error(`Gagal memperbarui di database: ${error.message}`);
      }

      console.log('Slide updated successfully:', data);
      
      // Update optimistic slides immediately for better UX
      if (formData.image && data?.[0]) {
        // Use the base64 preview for immediate display since Supabase URLs might fail
        const displayUrl = imagePreview.startsWith('data:') ? imagePreview : imageUrl;
        
        setOptimisticSlides(prev => 
          prev.map(s => s.id === editingSlide.id ? { ...s, image_url: displayUrl } : s)
        );
        setSlides(prev => 
          prev.map(s => s.id === editingSlide.id ? { ...s, image_url: displayUrl } : s)
        );
        // Keep the base64 preview for immediate display
        setEditingSlide(prev => prev ? { ...prev, image_url: displayUrl } : null);
      }
      
      toast.success('Slide berhasil diperbarui');
      setIsEditDialogOpen(false);
      setEditingSlide(null);
      resetForm();
      
      // Fetch slides to ensure data consistency
      setTimeout(() => {
        fetchSlides();
      }, 500);
    } catch (error: any) {
      console.error('Error updating slide:', error);
      const errorMessage = error?.message || 'Gagal memperbarui slide';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteSlide = useCallback(async (slideId: string) => {
    // Validasi autentikasi admin
    if (!isAdminAuthenticated || !adminUser || adminProfile?.role !== 'admin') {
      toast.error('Anda harus login sebagai admin untuk melakukan perubahan');
      return;
    }

    try {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', slideId);

      if (error) throw error;

      toast.success('Slide berhasil dihapus');
      fetchSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error('Gagal menghapus slide');
    }
  }, [isAdminAuthenticated, adminUser, adminProfile?.role, fetchSlides]);

  const handleReorderSlides = useCallback(async (newSlides: HeroSlide[]) => {
    // Validasi autentikasi admin
    if (!isAdminAuthenticated || !adminUser || adminProfile?.role !== 'admin') {
      toast.error('Anda harus login sebagai admin untuk melakukan perubahan');
      return;
    }

    try {
      const updates = newSlides.map((slide, index) => ({
        id: slide.id,
        order_index: index
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('hero_slides')
          .update({ order_index: update.order_index })
          .eq('id', update.id);

        if (error) {
          console.error('Error updating slide order:', error);
          throw error;
        }
      }

      setSlides(newSlides);
      onSlidesChange?.(newSlides);
      toast.success('Urutan slide berhasil diperbarui');
    } catch (error) {
      console.error('Error reordering slides:', error);
      toast.error('Gagal mengubah urutan slide');
      // Revert optimistic update
      fetchSlides();
    }
  }, [isAdminAuthenticated, adminUser, adminProfile?.role, onSlidesChange]);

  const handleDragStart = useCallback((e: React.DragEvent, slideId: string) => {
    // Clear any existing timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    setDraggedSlideId(slideId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', slideId);
    
    // Add visual feedback with slight delay
    dragTimeoutRef.current = setTimeout(() => {
      const draggedElement = e.currentTarget as HTMLElement;
      if (draggedElement && draggedElement.style) {
        draggedElement.style.opacity = '0.5';
      }
    }, 100);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Add visual feedback for drop zone
    const target = e.currentTarget as HTMLElement;
    if (target && target.style) {
      target.style.borderColor = '#3b82f6';
      target.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    // Clear drag timeout and reset visual feedback
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    const target = e.currentTarget as HTMLElement;
    if (target && target.style) {
      target.style.borderColor = '';
      target.style.backgroundColor = '';
      target.style.opacity = '';
    }
    
    if (!draggedSlideId || draggedSlideId === targetSlideId) {
      setDraggedSlideId(null);
      return;
    }
    
    const draggedIndex = optimisticSlides.findIndex(s => s.id === draggedSlideId);
    const targetIndex = optimisticSlides.findIndex(s => s.id === targetSlideId);
    
    const newSlides = [...optimisticSlides];
    const [draggedSlide] = newSlides.splice(draggedIndex, 1);
    newSlides.splice(targetIndex, 0, draggedSlide);
    
    // Optimistic update for immediate UI feedback
    setOptimisticSlides(newSlides);
    
    // Update order in database with debouncing
    if (uploadTimeoutRef.current) {
      clearTimeout(uploadTimeoutRef.current);
    }
    
    uploadTimeoutRef.current = setTimeout(() => {
      handleReorderSlides(newSlides);
    }, 300);
    
    setDraggedSlideId(null);
  }, [draggedSlideId, optimisticSlides, handleReorderSlides]);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      subtitle: '',
      cta: '',
      link: '',
      image: null
    });
    setImagePreview(null);
    setUploadProgress(0);
  }, []);

  const openEditDialog = useCallback((slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      cta: slide.cta_text,
      link: slide.cta_link,
      image: null
    });
    // Set image preview, but let DragDropImage handle loading errors with onError fallback
    setImagePreview(slide.image_url);
    setIsEditDialogOpen(true);
  }, []);

  const slidesWithMemo = useMemo(() => {
    return optimisticSlides.map((slide) => (
      <div
        key={slide.id}
        className="border rounded-lg p-4 bg-card"
        draggable
        onDragStart={(e) => handleDragStart(e, slide.id)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, slide.id)}
      >
        <div className="flex items-center gap-4">
          <div className="cursor-move">
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0">
            <Image
              src={slide.image_url}
              alt={slide.title}
              fill
              className="object-cover"
              onError={(e) => {
                console.log('Slide thumbnail load error:', slide.image_url);
                const target = e.currentTarget;
                if (target.src !== '/placeholder-image.svg') {
                  target.src = '/placeholder-image.svg';
                }
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{slide.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{slide.subtitle}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {slide.cta_text}
              </span>
              <span className="text-xs text-muted-foreground">
                → {slide.cta_link}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openEditDialog(slide)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Slide</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus slide &quot;{slide.title}&quot;? 
                    Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteSlide(slide.id)}>
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    ));
  }, [optimisticSlides, handleDragStart, handleDragOver, handleDrop, openEditDialog, handleDeleteSlide]);

  // Tampilkan pesan error jika admin belum terautentikasi
  if (!isAdminAuthenticated || !adminUser || adminProfile?.role !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Kelola Slide Hero Section
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <p className="text-muted-foreground mb-2">Anda harus login sebagai admin untuk mengakses fitur ini</p>
              <Button onClick={() => window.location.href = '/admin/login'}>Login Admin</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Kelola Slide Hero Section
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
          Kelola Slide Hero Section
        </CardTitle>
        <CardDescription>
          Tambah, edit, hapus, dan atur urutan slide pada hero banner
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Total: {optimisticSlides.length} slide
            </p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Slide
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tambah Slide Baru</DialogTitle>
                  <DialogDescription>
                    Buat slide baru untuk hero banner
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Judul *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Masukkan judul slide"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Textarea
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Masukkan subtitle slide"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cta">Teks Tombol</Label>
                      <Input
                        id="cta"
                        value={formData.cta}
                        onChange={(e) => setFormData(prev => ({ ...prev, cta: e.target.value }))}
                        placeholder="Shop Now"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="link">Link Tujuan</Label>
                      <Input
                        id="link"
                        value={formData.link}
                        onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                        placeholder="/kategori/sepatu"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="image">Gambar Slide *</Label>
                    <DragDropImage
                      onImageSelect={handleImageSelect}
                      currentImage={imagePreview || undefined}
                      className="min-h-[150px]"
                      disabled={saving}
                    />
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleAddSlide} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Simpan
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {optimisticSlides.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="mx-auto h-12 w-12 mb-4" />
              <p>Belum ada slide. Tambah slide pertama untuk memulai.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {slidesWithMemo}
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Slide</DialogTitle>
              <DialogDescription>
                Perbarui informasi slide
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Judul *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Masukkan judul slide"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-subtitle">Subtitle</Label>
                <Textarea
                  id="edit-subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Masukkan subtitle slide"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-cta">Teks Tombol</Label>
                  <Input
                    id="edit-cta"
                    value={formData.cta}
                    onChange={(e) => setFormData(prev => ({ ...prev, cta: e.target.value }))}
                    placeholder="Shop Now"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-link">Link Tujuan</Label>
                  <Input
                    id="edit-link"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="/kategori/sepatu"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-image">Gambar Slide</Label>
                <DragDropImage
                  onImageSelect={handleImageSelect}
                  currentImage={imagePreview || undefined}
                  className="min-h-[150px]"
                  disabled={saving}
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleEditSlide} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memperbarui...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Perbarui
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