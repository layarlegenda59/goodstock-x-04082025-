import { toast } from 'sonner';

export interface ImageValidationOptions {
  maxSizeInMB?: number;
  allowedFormats?: string[];
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatioRange?: {
    min: number;
    max: number;
  };
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  file?: File;
  dimensions?: {
    width: number;
    height: number;
    aspectRatio: number;
  };
}

const DEFAULT_OPTIONS: ImageValidationOptions = {
  maxSizeInMB: 5,
  allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  minWidth: 300,
  minHeight: 200,
  maxWidth: 4000,
  maxHeight: 4000,
  aspectRatioRange: {
    min: 0.5, // 1:2 (portrait)
    max: 3.0  // 3:1 (landscape)
  }
};

/**
 * Validasi file gambar dengan berbagai kriteria
 */
export const validateImageFile = async (
  file: File,
  options: ImageValidationOptions = {}
): Promise<ImageValidationResult> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Validasi tipe file
  if (!opts.allowedFormats?.includes(file.type)) {
    const allowedExtensions = opts.allowedFormats
      ?.map(format => format.split('/')[1].toUpperCase())
      .join(', ');
    return {
      isValid: false,
      error: `Format file tidak didukung. Gunakan: ${allowedExtensions}`
    };
  }

  // Validasi ukuran file
  const maxSizeInBytes = (opts.maxSizeInMB || 5) * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `Ukuran file terlalu besar. Maksimal ${opts.maxSizeInMB}MB`
    };
  }

  // Validasi dimensi gambar
  try {
    const dimensions = await getImageDimensions(file);
    
    if (opts.minWidth && dimensions.width < opts.minWidth) {
      return {
        isValid: false,
        error: `Lebar gambar minimal ${opts.minWidth}px`
      };
    }

    if (opts.minHeight && dimensions.height < opts.minHeight) {
      return {
        isValid: false,
        error: `Tinggi gambar minimal ${opts.minHeight}px`
      };
    }

    if (opts.maxWidth && dimensions.width > opts.maxWidth) {
      return {
        isValid: false,
        error: `Lebar gambar maksimal ${opts.maxWidth}px`
      };
    }

    if (opts.maxHeight && dimensions.height > opts.maxHeight) {
      return {
        isValid: false,
        error: `Tinggi gambar maksimal ${opts.maxHeight}px`
      };
    }

    // Validasi aspect ratio
    if (opts.aspectRatioRange) {
      const { min, max } = opts.aspectRatioRange;
      if (dimensions.aspectRatio < min || dimensions.aspectRatio > max) {
        return {
          isValid: false,
          error: `Rasio aspek gambar harus antara ${min.toFixed(1)}:1 hingga ${max.toFixed(1)}:1`
        };
      }
    }

    return {
      isValid: true,
      file,
      dimensions
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'File gambar tidak valid atau rusak'
    };
  }
};

/**
 * Mendapatkan dimensi gambar dari file
 */
export const getImageDimensions = (file: File): Promise<{
  width: number;
  height: number;
  aspectRatio: number;
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio
      });
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Membuat preview gambar dari file
 */
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Kompres gambar jika ukurannya terlalu besar
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    img.onload = () => {
      // Hitung dimensi baru dengan mempertahankan aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Gambar ulang dengan ukuran baru
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
      
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for compression'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validasi khusus untuk gambar hero slide
 */
export const validateHeroImage = (file: File): Promise<ImageValidationResult> => {
  return validateImageFile(file, {
    maxSizeInMB: 10,
    minWidth: 800,
    minHeight: 400,
    aspectRatioRange: {
      min: 1.5, // 3:2
      max: 3.0  // 3:1
    }
  });
};

/**
 * Validasi khusus untuk gambar kategori
 */
export const validateCategoryImage = (file: File): Promise<ImageValidationResult> => {
  return validateImageFile(file, {
    maxSizeInMB: 5,
    minWidth: 400,
    minHeight: 300,
    aspectRatioRange: {
      min: 1.2, // 6:5
      max: 1.5  // 3:2
    }
  });
};

/**
 * Validasi khusus untuk gambar produk
 */
export const validateProductImage = (file: File): Promise<ImageValidationResult> => {
  return validateImageFile(file, {
    maxSizeInMB: 3,
    minWidth: 300,
    minHeight: 300,
    aspectRatioRange: {
      min: 0.8, // 4:5
      max: 1.25 // 5:4
    }
  });
};

/**
 * Utility untuk menampilkan error dengan toast
 */
export const showImageValidationError = (error: string) => {
  toast.error(error, {
    duration: 4000,
    position: 'top-center'
  });
};

/**
 * Utility untuk menampilkan sukses dengan toast
 */
export const showImageValidationSuccess = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-center'
  });
};

/**
 * Format ukuran file untuk ditampilkan
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Mendapatkan informasi file untuk ditampilkan
 */
export const getFileInfo = (file: File) => {
  return {
    name: file.name,
    size: formatFileSize(file.size),
    type: file.type,
    lastModified: new Date(file.lastModified).toLocaleDateString('id-ID')
  };
};