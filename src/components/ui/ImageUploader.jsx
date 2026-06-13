'use client';

import { useState } from 'react';
import { useController } from 'react-hook-form';
import { Upload, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ImageUploader({
  control,
  name,
  rules,
  label = "Upload ID Proof",
  subLabel = "JPEG, PNG up to 5MB"
}) {
  const {
    field: { onChange, value },
    fieldState: { error }
  } = useController({ name, control, rules });

  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();

      if (data.secure_url) {
        onChange(data.secure_url);
        toast.success('ID Proof uploaded successfully!');
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
          {label} <span className="text-red-500">*</span>
        </label>
      )}

      <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${
        value ? 'border-gray-200 bg-gray-50/30' :
        error ? 'border-red-300 bg-red-50/30 animate-pulse' :
        'border-gray-200 hover:border-emerald-300 bg-gray-50'
      }`}>
        {value ? (
          // Uploaded state
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
                <img src={value} alt="ID Preview" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">ID Proof Uploaded</p>
                <p className="text-[10px] text-gray-500 font-medium">Ready for verification</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { onChange(''); toast.error('Image removed'); }}
              className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          // Upload prompt state
          <label className={`flex flex-col items-center justify-center cursor-pointer py-2 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
              {isUploading
                ? <Loader2 size={18} className="text-gray-400 animate-spin" />
                : <Upload size={18} className="text-gray-400" />
              }
            </div>
            <p className="text-xs font-bold text-gray-600">
              {isUploading ? 'Uploading...' : 'Click to upload'}
            </p>
            {!isUploading && <p className="text-[10px] text-gray-400 mt-1">{subLabel}</p>}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {error && (
        <p className="text-[10px] text-red-500 font-bold mt-1.5 uppercase tracking-wide">
          ⚠ {error.message}
        </p>
      )}
    </div>
  );
}