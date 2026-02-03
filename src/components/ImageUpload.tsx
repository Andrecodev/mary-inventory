import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadImage, compressImage } from '../utils/imageUpload';

interface ImageUploadProps {
  currentImage?: string | null;
  onImageUploaded: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageUploaded,
  folder,
  label = 'Imagen',
  className = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Compress image before upload
      const compressedFile = await compressImage(file, 1200, 0.8);

      // Upload to Supabase
      const result = await uploadImage(compressedFile, 'images', folder);

      if (result.success && result.url) {
        onImageUploaded(result.url);
      } else {
        setError(result.error || 'Error al subir la imagen');
        setPreview(currentImage || null);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Error inesperado al subir la imagen');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <label className="form-label">{label}</label>

      <div className="space-y-3">
        {/* Preview */}
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
              aria-label="Eliminar imagen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`image-upload-${folder || 'default'}`}
            disabled={uploading}
          />
          <label
            htmlFor={`image-upload-${folder || 'default'}`}
            className={`inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg cursor-pointer transition-colors ${
              uploading
                ? 'bg-gray-100 cursor-not-allowed'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                <span className="text-sm font-medium text-gray-600">Subiendo...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">
                  {preview ? 'Cambiar imagen' : 'Subir imagen'}
                </span>
              </>
            )}
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {error}
          </p>
        )}

        {/* Help Text */}
        <p className="text-xs text-gray-500">
          Formatos: JPG, PNG, GIF. Máximo 5MB.
        </p>
      </div>
    </div>
  );
};

export default ImageUpload;
