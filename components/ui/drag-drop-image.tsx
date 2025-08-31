'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DragDropImageProps {
  onImageSelect: (file: File) => void;
  currentImage?: string;
  className?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
}

export default function DragDropImage({
  onImageSelect,
  currentImage,
  className,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  disabled = false
}: DragDropImageProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentImage changes
  React.useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const validateFile = useCallback((file: File): boolean => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      toast.error(`Format file tidak didukung. Gunakan: ${acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}`);
      return false;
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Ukuran file maksimal ${maxSize}MB`);
      return false;
    }

    return true;
  }, [acceptedTypes, maxSize]);

  const handleFileSelect = useCallback((file: File) => {
    if (!validateFile(file)) return;

    setIsProcessing(true);
    
    try {
      // Create preview
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          if (!result) {
            throw new Error('Gagal membaca file');
          }
          setPreview(result);
          // Call parent callback after successful preview creation
          onImageSelect(file);
        } catch (error) {
          console.error('Error processing image preview:', error);
          toast.error('Gagal memproses pratinjau gambar');
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        toast.error('Gagal membaca file. Pastikan file tidak rusak.');
        setIsProcessing(false);
      };
      
      reader.onabort = () => {
        console.warn('File reading was aborted');
        toast.error('Pembacaan file dibatalkan');
        setIsProcessing(false);
      };
      
      // Start reading the file
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error in handleFileSelect:', error);
      toast.error('Gagal memproses file yang dipilih');
      setIsProcessing(false);
    }
  }, [validateFile, onImageSelect]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) {
      toast.error('Upload gambar sedang dinonaktifkan');
      return;
    }

    try {
      const files = Array.from(e.dataTransfer.files);
      
      if (files.length === 0) {
        toast.error('Tidak ada file yang dijatuhkan');
        return;
      }
      
      if (files.length > 1) {
        toast.error('Hanya dapat mengunggah satu gambar pada satu waktu');
        return;
      }
      
      const file = files[0];
      
      // Additional check for empty file
      if (file.size === 0) {
        toast.error('File kosong atau tidak valid');
        return;
      }
      
      handleFileSelect(file);
    } catch (error) {
      console.error('Error handling drop:', error);
      toast.error('Gagal memproses file yang dijatuhkan');
    }
  }, [disabled, handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      
      if (!files || files.length === 0) {
        return;
      }
      
      const file = files[0];
      
      // Additional validation for file input
      if (file.size === 0) {
        toast.error('File kosong atau tidak valid');
        return;
      }
      
      handleFileSelect(file);
    } catch (error) {
      console.error('Error handling file input change:', error);
      toast.error('Gagal memproses file yang dipilih');
    } finally {
      // Reset input value untuk memungkinkan upload file yang sama
      if (e.target) {
        e.target.value = '';
      }
    }
  }, [handleFileSelect]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Prevent click when clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleRemoveImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Create empty file to notify parent component about removal
    const emptyFile = new File([], '', { type: 'image/jpeg' });
    onImageSelect(emptyFile);
  }, [onImageSelect]);

  const containerClasses = useMemo(() => cn(
    "relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer",
    isDragOver && !disabled
      ? "border-primary bg-primary/5 scale-[1.02]"
      : "border-gray-300 hover:border-gray-400",
    disabled && "opacity-50 cursor-not-allowed",
    isProcessing && "pointer-events-none opacity-75",
    className
  ), [isDragOver, disabled, isProcessing, className]);

  return (
    <div
      className={containerClasses}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        disabled={disabled}
      />

      {preview ? (
        <div className="relative group">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              priority={false}
              loading="lazy"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-sm">Memproses...</div>
              </div>
            )}
          </div>
          
          {/* Overlay with actions */}
          {!isProcessing && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled && !isProcessing && fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  }}
                  className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full transition-colors disabled:opacity-50"
                  disabled={disabled || isProcessing}
                  title="Ganti gambar"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="bg-red-500/90 hover:bg-red-500 text-white p-2 rounded-full transition-colors disabled:opacity-50"
                  disabled={disabled || isProcessing}
                  title="Hapus gambar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Drag overlay */}
          {isDragOver && !disabled && !isProcessing && (
            <div className="absolute inset-0 bg-primary/20 border-2 border-primary rounded-lg flex items-center justify-center">
              <div className="text-primary font-medium">
                Lepaskan untuk mengganti gambar
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className={cn(
            "mx-auto mb-4 transition-colors",
            isDragOver && !disabled ? "text-primary" : "text-gray-400"
          )}>
            {isDragOver && !disabled ? (
              <Upload className="w-12 h-12" />
            ) : (
              <ImageIcon className="w-12 h-12" />
            )}
          </div>
          
          <div className="space-y-2">
            <p className={cn(
              "text-sm font-medium transition-colors",
              isDragOver && !disabled ? "text-primary" : "text-gray-900"
            )}>
              {isDragOver && !disabled
                ? "Lepaskan gambar di sini"
                : "Drag & drop gambar atau klik untuk upload"
              }
            </p>
            <p className="text-xs text-gray-500">
              {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} hingga {maxSize}MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}