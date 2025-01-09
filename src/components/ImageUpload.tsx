import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImageUploadProps {
  onUpload: (path: string) => void;
  currentImage?: string;
}

export function ImageUpload({ onUpload, currentImage }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentImage || '');

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      const file = event.target.files?.[0];
      if (!file) return;

      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('vendor-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('vendor-images')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
            <label className="cursor-pointer text-white flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Change Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={uploadImage}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      ) : (
        <label className="block w-full aspect-[3/2] rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/30 hover:bg-orange-50/50 hover:border-orange-300 transition-all duration-200 cursor-pointer">
          <div className="h-full flex flex-col items-center justify-center space-y-2">
            <Upload className="w-8 h-8 text-orange-400" />
            <div className="text-orange-600">
              {uploading ? 'Uploading...' : 'Upload vendor image'}
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={uploadImage}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}