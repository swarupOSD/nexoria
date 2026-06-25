import { useState, useEffect } from 'react';
import { useGetMovieSettingsQuery, useUpdateMovieSettingsMutation } from '../../features/settings/movieSettingsApiSlice';
import { useUploadImageMutation } from '../../features/upload/uploadApiSlice';
import { toast } from 'react-hot-toast';
import { Save, Image as ImageIcon, Layout, Type } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const MovieSettings = () => {
  const { data: settingsRes, isLoading } = useGetMovieSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateMovieSettingsMutation();
  const [uploadImage] = useUploadImageMutation();

  const [formData, setFormData] = useState({
    movieBoxName: '',
    movieBoxLogo: '',
    movieBoxBanner: '',
    movieBoxFavicon: '',
  });

  const [uploadingField, setUploadingField] = useState(null);

  useEffect(() => {
    if (settingsRes?.data) {
      setFormData({
        movieBoxName: settingsRes.data.movieBoxName || '',
        movieBoxLogo: settingsRes.data.movieBoxLogo || '',
        movieBoxBanner: settingsRes.data.movieBoxBanner || '',
        movieBoxFavicon: settingsRes.data.movieBoxFavicon || '',
      });
    }
  }, [settingsRes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);
    uploadData.append('folder', 'movies');

    try {
      setUploadingField(field);
      const res = await uploadImage(uploadData).unwrap();
      setFormData((prev) => ({ ...prev, [field]: res.data || res.url }));
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(formData).unwrap();
      toast.success('Movie Settings updated successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update settings');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center mt-20"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Helmet>
        <title>Movie Settings - Super Admin</title>
      </Helmet>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <Layout className="w-8 h-8 text-purple-600" />
          Movie Settings
        </h1>
        <p className="text-slate-500 mt-2">Manage the branding and configuration of the MovieBox ecosystem independently.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
            <Type className="w-5 h-5 text-purple-500" /> Branding & Identity
          </h2>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                MovieBox Name
              </label>
              <input
                type="text"
                name="movieBoxName"
                value={formData.movieBoxName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all dark:text-white"
                placeholder="e.g. MovieBox"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                MovieBox Favicon
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {formData.movieBoxFavicon && (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center p-2 shrink-0">
                    <img src={formData.movieBoxFavicon} alt="Favicon" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="flex-1 w-full space-y-2">
                  <input
                    type="text"
                    name="movieBoxFavicon"
                    value={formData.movieBoxFavicon}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white text-sm"
                    placeholder="URL or upload an image..."
                  />
                  <div className="relative inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'movieBoxFavicon')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingField === 'movieBoxFavicon'}
                    />
                    <button type="button" className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      {uploadingField === 'movieBoxFavicon' ? 'Uploading...' : 'Upload Favicon'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                MovieBox Logo
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {formData.movieBoxLogo && (
                  <div className="h-16 w-32 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center p-2 shrink-0">
                    <img src={formData.movieBoxLogo} alt="Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
                <div className="flex-1 w-full space-y-2">
                  <input
                    type="text"
                    name="movieBoxLogo"
                    value={formData.movieBoxLogo}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white text-sm"
                    placeholder="URL or upload an image..."
                  />
                  <div className="relative inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'movieBoxLogo')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingField === 'movieBoxLogo'}
                    />
                    <button type="button" className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      {uploadingField === 'movieBoxLogo' ? 'Uploading...' : 'Upload Logo'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                MovieBox Banner
              </label>
              <div className="flex flex-col gap-4">
                {formData.movieBoxBanner && (
                  <div className="w-full h-40 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 overflow-hidden shrink-0">
                    <img src={formData.movieBoxBanner} alt="Banner" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 w-full space-y-2">
                  <input
                    type="text"
                    name="movieBoxBanner"
                    value={formData.movieBoxBanner}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white text-sm"
                    placeholder="URL or upload an image..."
                  />
                  <div className="relative inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'movieBoxBanner')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingField === 'movieBoxBanner'}
                    />
                    <button type="button" className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      {uploadingField === 'movieBoxBanner' ? 'Uploading...' : 'Upload Banner'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUpdating}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isUpdating ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovieSettings;
