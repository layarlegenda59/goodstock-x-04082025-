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

  useEffect(() => {
    fetchSlides();
  }, []); // fetchSlides is stable with useCallback

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
    };
  }, []);

  const fetchSlides = useCallback(async () => {
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
    } catch (error: any) {
      console.error('Error fetching slides:', error);
      toast.error('Gagal memuat data slide');
    } finally {
      setLoading(false);
    }
  }, []); // useCallback dependency array

  // Fixed uploadImageToSupabase function with proper error handling
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
    } catch (error: any) {
      console.error('Error in uploadImageToSupabase:', error);
      setUploadProgress(0);
      throw error;
    }
  };

  // Fixed convertFileToBase64 function
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadProgress(100);
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
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
        const displayUrl = imagePreview && imagePreview.startsWith('data:') ? imagePreview : imageUrl;
        
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

  const handleDeleteSlide = async (slideId: string) => {
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
    } catch (error: any) {
      console.error('Error deleting slide:', error);
      toast.error('Gagal menghapus slide');
    }
  };

  const handleReorderSlides = async (newSlides: HeroSlide[]) => {
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
    } catch (error: any) {
      console.error('Error reordering slides:', error);
      toast.error('Gagal mengubah urutan slide');
      // Revert optimistic update
      fetchSlides();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      cta: '',
      link: '',
      image: null
    });
    setImagePreview(null);
    setUploadProgress(0);
  };

  const handleImageChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, image: file }));
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const openEditDialog = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      cta: slide.cta_text,
      link: slide.cta_link,
      image: null
    });
    setImagePreview(slide.image_url);
    setIsEditDialogOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, slideId: string) => {
    setDraggedSlideId(slideId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSlideId: string) => {
    e.preventDefault();
    
    if (!draggedSlideId || draggedSlideId === targetSlideId) {
      setDraggedSlideId(null);
      return;
    }

    const draggedIndex = slides.findIndex(s => s.id === draggedSlideId);
    const targetIndex = slides.findIndex(s => s.id === targetSlideId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedSlideId(null);
      return;
    }

    const newSlides = [...slides];
    const [draggedSlide] = newSlides.splice(draggedIndex, 1);
    newSlides.splice(targetIndex, 0, draggedSlide);
    
    // Update order_index for all slides
    const reorderedSlides = newSlides.map((slide, index) => ({
      ...slide,
      order_index: index
    }));

    setSlides(reorderedSlides);
    setDraggedSlideId(null);
    
    // Save to database
    handleReorderSlides(reorderedSlides);
  };

  const slidesToDisplay = useMemo(() => {
    return optimisticSlides.length > 0 ? optimisticSlides : slides;
  }, [optimisticSlides, slides]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Memuat Hero Slides...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Kelola Slide Hero Section
            </CardTitle>
            <CardDescription>
              Tambah, edit, hapus, dan atur urutan slide pada hero banner
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Tambah Slide
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Slide Baru</DialogTitle>
                <DialogDescription>
                  Buat slide hero banner baru dengan gambar dan teks yang menarik
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Masukkan judul slide"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Textarea
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Masukkan subtitle slide"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cta">Teks Tombol</Label>
                    <Input
                      id="cta"
                      value={formData.cta}
                      onChange={(e) => setFormData(prev => ({ ...prev, cta: e.target.value }))}
                      placeholder="Shop Now"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="link">Link Tombol</Label>
                    <Input
                      id="link"
                      value={formData.link}
                      onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                      placeholder="/kategori/sepatu"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Gambar Slide *</Label>
                  <DragDropImage
                    onImageChange={handleImageChange}
                    preview={imagePreview}
                    uploadProgress={uploadProgress}
                    maxSize={10}
                    acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                  disabled={saving}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleAddSlide}
                  disabled={saving || !formData.title || !formData.image}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Simpan Slide
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          Total: {slidesToDisplay.length} slide
        </div>
        
        {slidesToDisplay.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Belum ada slide hero banner</p>
            <p className="text-sm text-muted-foreground mt-1">Klik "Tambah Slide" untuk membuat slide pertama</p>
          </div>
        ) : (
          <div className="space-y-4">
            {slidesToDisplay.map((slide, index) => (
              <div
                key={slide.id}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  draggedSlideId === slide.id ? 'opacity-50 scale-95' : 'hover:shadow-md'
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, slide.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, slide.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                  </div>
                  
                  <div className="relative w-24 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={slide.image_url}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.svg';
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{slide.title}</h3>
                    {slide.subtitle && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{slide.subtitle}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{slide.cta_text}</span>
                      <span>→ {slide.cta_link}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(slide)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Slide</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus slide "{slide.title}"? 
                            Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSlide(slide.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Hapus
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
        
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Slide</DialogTitle>
              <DialogDescription>
                Perbarui informasi slide hero banner
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Judul *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Masukkan judul slide"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-subtitle">Subtitle</Label>
                <Textarea
                  id="edit-subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Masukkan subtitle slide"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-cta">Teks Tombol</Label>
                  <Input
                    id="edit-cta"
                    value={formData.cta}
                    onChange={(e) => setFormData(prev => ({ ...prev, cta: e.target.value }))}
                    placeholder="Shop Now"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-link">Link Tombol</Label>
                  <Input
                    id="edit-link"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="/kategori/sepatu"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Gambar Slide</Label>
                <DragDropImage
                  onImageChange={handleImageChange}
                  preview={imagePreview}
                  uploadProgress={uploadProgress}
                  maxSize={10}
                  acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                />
                <p className="text-xs text-muted-foreground">
                  Kosongkan jika tidak ingin mengubah gambar
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingSlide(null);
                  resetForm();
                }}
                disabled={saving}
              >
                Batal
              </Button>
              <Button
                onClick={handleEditSlide}
                disabled={saving || !formData.title}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memperbarui...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
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