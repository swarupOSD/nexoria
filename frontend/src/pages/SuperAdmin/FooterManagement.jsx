import React, { useState, useEffect } from 'react';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../features/settings/settingsApiSlice';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Image as ImageIcon, UploadCloud, GripVertical, Plus, Trash2, 
  Save, LayoutTemplate, Link as LinkIcon, Share2, Mail, Palette, MessageSquare
} from 'lucide-react';
import { useSelector } from 'react-redux';
import SupportCenter from './SupportCenter';
import BackButton from '../../components/BackButton';

const FooterManagement = () => {
  const { data: settingsRes, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();
  const { token } = useSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState('branding');
  const [formData, setFormData] = useState({
    logo: '',
    footerBackground: '',
    tagline: '',
    footerText: '',
    copyrightText: '',
    phoneNumber: '',
    whatsappNumber: '',
    officeAddress: '',
    workingHours: '',
    googleMapsLink: '',
    businessEmail: '',
    supportEmail: '',
    legalEmail: '',
    socialLinks: {
      facebook: '', twitter: '', instagram: '', youtube: '', 
      discord: '', telegram: '', whatsapp: '', linkedin: '', github: ''
    },
    disabledSocialLinks: [],
    quickLinks: [],
    newsletter: {
      title: '', description: '', successMessage: '', enabled: true
    },
    footerDesign: {
      theme: 'dark', darkColors: '', lightColors: '', gradientColors: '', 
      backgroundImage: '', glassIntensity: '', animationEnabled: true
    }
  });

  useEffect(() => {
    if (settingsRes?.data) {
      const s = settingsRes.data;
      setFormData({
        logo: s.logo || '',
        footerBackground: s.footerDesign?.backgroundImage || s.heroBackground || '', // Fallback
        tagline: s.tagline || '',
        footerText: s.footerText || '',
        copyrightText: s.copyrightText || '',
        phoneNumber: s.phoneNumber || '',
        whatsappNumber: s.whatsappNumber || '',
        officeAddress: s.officeAddress || '',
        workingHours: s.workingHours || '',
        googleMapsLink: s.googleMapsLink || '',
        businessEmail: s.businessEmail || '',
        supportEmail: s.supportEmail || '',
        legalEmail: s.legalEmail || '',
        socialLinks: s.socialLinks || { facebook: '', twitter: '', instagram: '', youtube: '', discord: '', telegram: '', whatsapp: '', linkedin: '', github: '' },
        disabledSocialLinks: s.disabledSocialLinks || [],
        quickLinks: s.quickLinks || [],
        newsletter: s.newsletter || { title: 'Join the Premium Community', description: 'Get exclusive updates, early access to premium mods, and weekly newsletters delivered directly to your inbox.', successMessage: 'Thanks for subscribing!', enabled: true },
        footerDesign: s.footerDesign || { theme: 'dark', darkColors: '#030303', lightColors: '#f8fafc', gradientColors: 'from-primary/10 to-accent/10', backgroundImage: '', glassIntensity: 'backdrop-blur-2xl', animationEnabled: true }
      });
    }
  }, [settingsRes]);

  const handleChange = (e, section = null, subSection = null) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    if (section && subSection) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subSection]: {
            ...prev[section][subSection],
            [name]: finalValue
          }
        }
      }));
    } else if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: finalValue
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
  };

  const handleSocialChange = (network, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [network]: value }
    }));
  };

  const toggleSocialLink = (network) => {
    setFormData(prev => {
      const isDisabled = prev.disabledSocialLinks.includes(network);
      return {
        ...prev,
        disabledSocialLinks: isDisabled 
          ? prev.disabledSocialLinks.filter(n => n !== network)
          : [...prev.disabledSocialLinks, network]
      };
    });
  };

  // Drag and Drop for Quick Links
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null) return;
    
    const newLinks = [...formData.quickLinks];
    const draggedItem = newLinks[draggedItemIndex];
    newLinks.splice(draggedItemIndex, 1);
    newLinks.splice(index, 0, draggedItem);
    
    setFormData(prev => ({ ...prev, quickLinks: newLinks }));
    setDraggedItemIndex(null);
  };

  const addQuickLink = () => {
    setFormData(prev => ({
      ...prev,
      quickLinks: [...prev.quickLinks, { label: 'New Link', url: '/' }]
    }));
  };

  const updateQuickLink = (index, field, value) => {
    const newLinks = [...formData.quickLinks];
    newLinks[index][field] = value;
    setFormData(prev => ({ ...prev, quickLinks: newLinks }));
  };

  const removeQuickLink = (index) => {
    const newLinks = [...formData.quickLinks];
    newLinks.splice(index, 1);
    setFormData(prev => ({ ...prev, quickLinks: newLinks }));
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('image', file);

    try {
      const res = await fetch(`/api/upload/${type === 'logo' ? 'logo' : 'image'}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      
      if (type === 'logo') {
        setFormData(prev => ({ ...prev, logo: data.url }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          footerDesign: { ...prev.footerDesign, backgroundImage: data.url }
        }));
      }
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error(err.message || 'Image upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(formData).unwrap();
      toast.success('Footer settings updated successfully!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update settings');
    }
  };

  if (isLoading) return <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>;

  const tabs = [
    { id: 'branding', icon: LayoutTemplate, label: 'Branding' },
    { id: 'social', icon: Share2, label: 'Social Links' },
    { id: 'links', icon: LinkIcon, label: 'Quick Links' },
    { id: 'contact', icon: Mail, label: 'Contact Info' },
    { id: 'inbox', icon: MessageSquare, label: 'Inbox (Messages)' },
    { id: 'newsletter', icon: Mail, label: 'Newsletter' },
    { id: 'design', icon: Palette, label: 'Design' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BackButton fallbackRoute="/superadmin" showText={false} />
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-primary" />
              Footer Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your website's footer completely from this panel.</p>
          </div>
        </div>
      </div>
        <button 
          onClick={handleSubmit} 
          disabled={isUpdating}
          className="premium-btn px-6 py-2 flex items-center gap-2 text-sm"
        >
          {isUpdating ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="glass-card flex flex-col md:flex-row gap-6 p-6 min-h-[600px]">
        
        {/* Vertical Tabs */}
        <div className="w-full md:w-64 space-y-2 border-r border-slate-200 dark:border-white/5 pr-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 max-w-3xl">
          
          {/* BRANDING TAB */}
          {activeTab === 'branding' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Branding & Identity</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Website Logo</label>
                  <div className="h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group bg-slate-50 dark:bg-[#111]">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo" className="h-16 object-contain" />
                    ) : (
                      <div className="text-slate-400 text-center"><ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />Upload Logo</div>
                    )}
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <span className="text-white font-bold flex items-center gap-2"><UploadCloud className="w-5 h-5" /> Replace</span>
                      <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} accept="image/*" />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Site Name</label>
                <input type="text" name="siteName" value={formData.siteName} onChange={handleChange} className="premium-input w-full" placeholder="Premium Apps" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Footer Description (About)</label>
                <textarea name="footerText" value={formData.footerText} onChange={handleChange} className="premium-input w-full min-h-[100px]" placeholder="Brief description of your site for the footer..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Copyright Text</label>
                <input type="text" name="copyrightText" value={formData.copyrightText} onChange={handleChange} className="premium-input w-full" placeholder="All Rights Reserved." />
              </div>
            </motion.div>
          )}

          {/* SOCIAL LINKS TAB */}
          {activeTab === 'social' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Social Media Links</h2>
              <div className="space-y-4">
                {Object.keys(formData.socialLinks).map(network => {
                  const isEnabled = !formData.disabledSocialLinks.includes(network);
                  return (
                    <div key={network} className="flex items-center gap-4 bg-slate-50 dark:bg-[#111] p-3 rounded-xl border border-slate-200 dark:border-white/5">
                      <div className="w-24 font-semibold capitalize text-slate-700 dark:text-slate-300">{network}</div>
                      <input 
                        type="url" 
                        value={formData.socialLinks[network]} 
                        onChange={(e) => handleSocialChange(network, e.target.value)} 
                        className="premium-input flex-1" 
                        placeholder={`https://${network}.com/yourpage`} 
                      />
                      <button 
                        onClick={() => toggleSocialLink(network)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isEnabled ? 'bg-success/20 text-success' : 'bg-slate-200 dark:bg-white/10 text-slate-500'}`}
                      >
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* QUICK LINKS TAB (DRAG AND DROP) */}
          {activeTab === 'links' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Quick Links</h2>
                <button onClick={addQuickLink} className="premium-btn px-4 py-1.5 flex items-center gap-1 text-sm"><Plus className="w-4 h-4"/> Add Link</button>
              </div>

              <div className="space-y-3">
                {formData.quickLinks.map((link, index) => (
                  <div 
                    key={index} 
                    draggable 
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className="flex items-center gap-3 bg-slate-50 dark:bg-[#111] p-3 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      value={link.label} 
                      onChange={(e) => updateQuickLink(index, 'label', e.target.value)} 
                      className="premium-input w-1/3" 
                      placeholder="Link Label" 
                    />
                    <input 
                      type="text" 
                      value={link.url} 
                      onChange={(e) => updateQuickLink(index, 'url', e.target.value)} 
                      className="premium-input flex-1" 
                      placeholder="URL (e.g. /privacy-policy)" 
                    />
                    <button onClick={() => removeQuickLink(index)} className="text-danger hover:bg-danger/10 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {formData.quickLinks.length === 0 && (
                  <div className="text-center p-8 text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">No quick links added yet.</div>
                )}
              </div>
            </motion.div>
          )}

          {/* CONTACT INFO TAB */}
          {activeTab === 'contact' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Support Email</label>
                  <input type="email" name="supportEmail" value={formData.supportEmail} onChange={handleChange} className="premium-input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Business Email</label>
                  <input type="email" name="businessEmail" value={formData.businessEmail} onChange={handleChange} className="premium-input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="premium-input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Number</label>
                  <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} className="premium-input w-full" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Office Address</label>
                  <textarea name="officeAddress" value={formData.officeAddress} onChange={handleChange} className="premium-input w-full min-h-[80px]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Google Maps Link</label>
                  <input type="url" name="googleMapsLink" value={formData.googleMapsLink} onChange={handleChange} className="premium-input w-full" />
                </div>
              </div>
            </motion.div>
          )}

          {/* INBOX TAB */}
          {activeTab === 'inbox' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Customer Messages & Tickets</h2>
              </div>
              <div className="bg-slate-50 dark:bg-[#030303] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden h-[800px] relative">
                <SupportCenter isEmbedded={true} />
              </div>
            </motion.div>
          )}

          {/* NEWSLETTER TAB */}
          {activeTab === 'newsletter' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Newsletter Configuration</h2>
              
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#111] p-4 rounded-xl border border-slate-200 dark:border-white/5 mb-6">
                <input 
                  type="checkbox" 
                  id="newsletterEnabled" 
                  name="enabled" 
                  checked={formData.newsletter.enabled} 
                  onChange={(e) => handleChange(e, 'newsletter')} 
                  className="w-5 h-5 accent-primary" 
                />
                <label htmlFor="newsletterEnabled" className="font-bold text-slate-800 dark:text-white cursor-pointer">Enable Newsletter Section in Footer</label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input type="text" name="title" value={formData.newsletter.title} onChange={(e) => handleChange(e, 'newsletter')} className="premium-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea name="description" value={formData.newsletter.description} onChange={(e) => handleChange(e, 'newsletter')} className="premium-input w-full min-h-[80px]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Success Message</label>
                <input type="text" name="successMessage" value={formData.newsletter.successMessage} onChange={(e) => handleChange(e, 'newsletter')} className="premium-input w-full" />
              </div>
            </motion.div>
          )}

          {/* DESIGN TAB */}
          {activeTab === 'design' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Footer Aesthetics</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Footer Theme</label>
                  <select name="theme" value={formData.footerDesign.theme} onChange={(e) => handleChange(e, 'footerDesign')} className="premium-input w-full">
                    <option value="dark">Dark Mode (Premium)</option>
                    <option value="light">Light Mode</option>
                    <option value="transparent">Transparent Glass</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Glass Intensity</label>
                  <select name="glassIntensity" value={formData.footerDesign.glassIntensity} onChange={(e) => handleChange(e, 'footerDesign')} className="premium-input w-full">
                    <option value="backdrop-blur-sm">Light Blur</option>
                    <option value="backdrop-blur-md">Medium Blur</option>
                    <option value="backdrop-blur-xl">Heavy Blur</option>
                    <option value="backdrop-blur-3xl">Extreme Blur (Pro Max)</option>
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Custom Background Image (Optional)</label>
                  <div className="h-40 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group bg-slate-50 dark:bg-[#111]">
                    {formData.footerDesign.backgroundImage ? (
                      <img src={formData.footerDesign.backgroundImage} alt="Background" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-400 text-center"><ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />Upload Background</div>
                    )}
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <span className="text-white font-bold flex items-center gap-2"><UploadCloud className="w-5 h-5" /> Replace Background</span>
                      <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'image')} accept="image/*" />
                    </label>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default FooterManagement;
