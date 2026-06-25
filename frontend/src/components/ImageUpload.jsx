import React, { useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { 
  useUploadImageMutation, 
  useUploadLogoMutation, 
  useUploadProfileMutation, 
  useDeleteImageMutation 
} from '../features/upload/uploadApiSlice';

const ImageUpload = ({ type = 'image', value, onChange, label = 'Upload Image' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [urlInput, setUrlInput] = useState('');

  const [uploadImage] = useUploadImageMutation();
  const [uploadLogo] = useUploadLogoMutation();
  const [uploadProfile] = useUploadProfileMutation();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    if (value) {
      formData.append('oldImage', value);
    }

    setIsUploading(true);
    setError(null);

    try {
      let res;
      if (type === 'image') res = await uploadImage(formData).unwrap();
      else if (type === 'logo') res = await uploadLogo(formData).unwrap();
      else if (type === 'profile') res = await uploadProfile(formData).unwrap();

      if (res?.success) {
        onChange(res.url);
      }
    } catch (err) {
      setError(err?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!value) return;
    onChange('');
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold mb-2 dark:text-slate-300">{label}</label>
      
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

      {!value ? (
        <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
          <input 
            type="file" 
            accept="image/png, image/jpeg, image/jpg, image/webp" 
            onChange={handleUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="flex flex-col items-center text-blue-500">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm font-medium">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-500 dark:text-slate-400">
              <UploadCloud className="w-10 h-10 mb-2 text-slate-400" />
              <p className="text-sm font-medium">Click or drag image to upload</p>
              <p className="text-xs mt-1">PNG, JPG, WEBP up to 5MB</p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center min-h-[150px]">
          <img src={value} alt="Uploaded preview" className="max-h-[200px] object-contain" />
          <button 
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-lg"
            title="Remove Image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!value && (
        <div className="mt-3">
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
            <span className="flex-shrink-0 mx-2 text-xs text-slate-400 uppercase">Or</span>
            <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
          </div>
          <form onSubmit={handleUrlSubmit} className="mt-3 flex gap-2">
            <input 
              type="text" 
              data-testid={`image-upload-url-${label ? label.replace(/\s+/g, '-').toLowerCase() : 'gallery'}`}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onPaste={(e) => {
                const pastedText = e.clipboardData.getData('text');
                if (pastedText && pastedText.trim().length > 0) {
                  e.preventDefault();
                  onChange(pastedText.trim());
                  setUrlInput('');
                }
              }}
              placeholder="Paste Image URL from Google" 
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" data-testid={`image-upload-apply-${label ? label.replace(/\s+/g, '-').toLowerCase() : 'gallery'}`} className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-blue-600 hover:text-white rounded-lg text-sm transition font-medium">
              Apply
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
