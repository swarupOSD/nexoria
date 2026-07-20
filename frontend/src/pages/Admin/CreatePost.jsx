import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Save, Globe, Eye, UploadCloud, Plus, Trash2, Settings, 
  Tag, Download, FileText, Image as ImageIcon, CheckCircle, Smartphone
, LayoutTemplate } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  useGetPostByIdQuery, 
  useCreatePostMutation, 
  useUpdatePostMutation,
  useScrapePlayStoreMutation
} from "../../features/post/postApiSlice";
import { useGetCategoriesQuery } from "../../features/category/categoryApiSlice";
import ImageUpload from "../../components/ImageUpload";
import { toast } from 'react-hot-toast';
import BackButton from '../../components/BackButton';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const btnClass = "p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-300 text-sm font-semibold border border-transparent hover:border-slate-300 dark:hover:border-slate-600";
  const activeClass = "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800";

  const addImage = () => {
    const url = window.prompt('Enter Image URL');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addYoutube = () => {
    const url = window.prompt('Enter YouTube URL');
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 rounded-t-xl items-center sticky top-0 z-10">
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${btnClass} ${editor.isActive('heading', { level: 1 }) ? activeClass : ''}`}>H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${btnClass} ${editor.isActive('heading', { level: 2 }) ? activeClass : ''}`}>H2</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`${btnClass} ${editor.isActive('heading', { level: 3 }) ? activeClass : ''}`}>H3</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={`${btnClass} ${editor.isActive('heading', { level: 4 }) ? activeClass : ''}`}>H4</button>
      <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>
      
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={`${btnClass} ${editor.isActive('bold') ? activeClass : ''}`}>B</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`${btnClass} ${editor.isActive('italic') ? activeClass : ''}`}>I</button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${btnClass} ${editor.isActive('underline') ? activeClass : ''}`}>U</button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`${btnClass} ${editor.isActive('strike') ? activeClass : ''}`}>S</button>
      <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>

      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${btnClass} ${editor.isActive('bulletList') ? activeClass : ''}`}>• List</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${btnClass} ${editor.isActive('orderedList') ? activeClass : ''}`}>1. List</button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`${btnClass} ${editor.isActive('blockquote') ? activeClass : ''}`}>Quote</button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`${btnClass} ${editor.isActive('codeBlock') ? activeClass : ''}`}>Code</button>
      <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>

      <button onClick={setLink} className={`${btnClass} ${editor.isActive('link') ? activeClass : ''}`}>Link</button>
      <button onClick={addImage} className={btnClass}>IMG</button>
      <button onClick={addYoutube} className={btnClass}>YT</button>
      <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={btnClass}>Table</button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnClass}>—</button>
    </div>
  );
};

const CreatePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.includes('/superadmin') ? '/superadmin/apps' : '/admin/posts';

  const { data: postData, isLoading: isFetchingPost } = useGetPostByIdQuery(id, { skip: !id });
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];

  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const [scrapePlayStore, { isLoading: isScraping }] = useScrapePlayStoreMutation();

  const isEditing = !!id;

  // Post State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    packageName: '',
    featuredImage: '',
    appLogo: '',
    version: '1.0.0',
    updateDate: new Date().toISOString().split('T')[0],
    publisher: '',
    requirements: 'Android 5.0+',
    category: '',
    subCategory: '',
    tags: '',
    size: '15 MB',
    platform: 'Android',
    appType: 'Free',
    price: 0,
    discountPrice: 0,
    downloadUrl: '',
    mirrorUrl: '',
    metaTitle: '',
    metaDescription: '',
    description: '',
    averageRating: 0,
    totalVotes: 0,
    keywords: '',
    canonicalUrl: '',
    status: 'Published',
    visibilityStatus: 'Public',
    isFeatured: false,
    isTrending: false,
    isPopular: false,
    isVip: false,
    editorChoice: false,
    changelog: '',
    expectedReleaseDate: '',
    developmentProgress: 0,
  });

  const [downloadLinks, setDownloadLinks] = useState([]);
  const [modFeatures, setModFeatures] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [versions, setVersions] = useState([]);
  const [toc, setToc] = useState([]);
  const [scrapeUrl, setScrapeUrl] = useState('');

  const handleAutoScrape = async () => {
    if (!scrapeUrl) return toast.error('Please enter a valid Google Play URL');
    
    try {
      toast.loading('Scraping app details...', { id: 'scrape' });
      const response = await scrapePlayStore({ url: scrapeUrl }).unwrap();
      
      setFormData(prev => ({
        ...prev,
        title: response.title || prev.title,
        slug: response.title ? response.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : prev.slug,
        description: response.description ? response.description.slice(0, 150) + '...' : prev.description,
        featuredImage: response.icon || prev.featuredImage,
        appLogo: response.icon || prev.appLogo,
        publisher: response.developer || prev.publisher,
        size: response.size || prev.size,
        version: response.version || prev.version,
      }));
      
      if (response.screenshots && response.screenshots.length > 0) {
        setGalleryImages(response.screenshots.slice(0, 5));
      }
      
      if (response.description && editor) {
        editor.commands.setContent(`<p>${response.description}</p>`);
      }
      
      toast.success('App details fetched successfully!', { id: 'scrape' });
      setScrapeUrl('');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to scrape app details', { id: 'scrape' });
    }
  };
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      Youtube,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '<p>Write your detailed app description here...</p>',
    editorProps: {
      attributes: {
        className: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none dark:prose-invert min-h-[400px] p-6',
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const headings = [];
      let index = 0;
      
      const extractHeadings = (node) => {
        if (node.type === 'heading' && [2, 3, 4].includes(node.attrs.level)) {
          headings.push({
            id: `heading-${index++}`,
            text: node.content?.[0]?.text || 'Empty Heading',
            level: node.attrs.level
          });
        }
        if (node.content) {
          node.content.forEach(extractHeadings);
        }
      };
      
      if (json.content) {
        json.content.forEach(extractHeadings);
      }
      setToc(headings);
    }
  });

  useEffect(() => {
    if (postData?.data && editor) {
      const post = postData.data;
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        packageName: post.packageName || '',
        featuredImage: post.featuredImage || '',
        appLogo: post.appLogo || '',
        version: post.version || '',
        publisher: post.publisher || '',
        requirements: post.requirements || '',
        category: post.category?._id || post.category || '',
        subCategory: post.subCategory?._id || post.subCategory || '',
        tags: post.tags?.join(', ') || '',
        size: post.size || '',
        platform: post.platform || 'Android',
        appType: post.appType || 'Free',
        price: post.price || 0,
        discountPrice: post.discountPrice || 0,
        downloadUrl: post.downloadUrls?.[0]?.url || '',
        mirrorUrl: post.downloadUrls?.[1]?.url || '',
        metaTitle: post.seoTitle || post.seo?.metaTitle || '',
        metaDescription: post.seoDescription || post.seo?.metaDescription || '',
        description: post.description || '',
        averageRating: post.averageRating || 0,
        totalVotes: post.totalVotes || 0,
        keywords: post.focusKeyword || post.seo?.keywords?.join(', ') || '',
        canonicalUrl: post.seo?.canonicalUrl || '',
        status: post.status || 'Published',
        visibilityStatus: post.visibilityStatus || 'Public',
        isFeatured: post.isFeatured || false,
        isTrending: post.isTrending || false,
        isPopular: post.isPopular || false,
        isVip: post.isVip || false,
        editorChoice: post.editorChoice || false,
        changelog: post.changelog || '',
        expectedReleaseDate: post.expectedReleaseDate ? new Date(post.expectedReleaseDate).toISOString().split('T')[0] : '',
        developmentProgress: post.developmentProgress || 0,
      });
      setGalleryImages(post.galleryImages || []);
      setVersions(post.versions || []);
      setDownloadLinks(post.downloadLinks || []);
      setModFeatures(post.modFeatures || []);
      if (post.content) {
        let processedContent = post.content;
        const txt = document.createElement('textarea');
        let prevStr = '';
        let iterations = 0;
        while (processedContent !== prevStr && iterations < 5) {
          prevStr = processedContent;
          if (processedContent.includes('&lt;') || processedContent.includes('&amp;')) {
            txt.innerHTML = processedContent;
            processedContent = txt.value;
          } else {
            break;
          }
          iterations++;
        }
        editor.commands.setContent(processedContent);
      }
    } else if (categories.length > 0 && !formData.category && !isEditing) {
      setFormData(prev => ({ ...prev, category: categories[0]._id }));
    }
  }, [postData, editor, categories, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title') {
      setFormData({ ...formData, title: value, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addModFeature = () => setModFeatures([...modFeatures, '']);
  const updateModFeature = (index, value) => {
    const newFeatures = [...modFeatures];
    newFeatures[index] = value;
    setModFeatures(newFeatures);
  };
  const removeModFeature = (index) => setModFeatures(modFeatures.filter((_, i) => i !== index));
  const moveModFeature = (index, dir) => {
    if (dir === 'up' && index > 0) {
      const arr = [...modFeatures];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      setModFeatures(arr);
    } else if (dir === 'down' && index < modFeatures.length - 1) {
      const arr = [...modFeatures];
      [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
      setModFeatures(arr);
    }
  };

  const addDownloadLink = () => {
    setDownloadLinks([...downloadLinks, { label: 'Primary', url: '', type: 'primary', isActive: true, priority: downloadLinks.length + 1 }]);
  };
  const updateDownloadLink = (index, field, value) => {
    const newLinks = [...downloadLinks];
    newLinks[index][field] = value;
    setDownloadLinks(newLinks);
  };
  const removeDownloadLink = (index) => {
    setDownloadLinks(downloadLinks.filter((_, i) => i !== index));
  };
  const moveDownloadLink = (index, direction) => {
    if (direction === 'up' && index > 0) {
      const newLinks = [...downloadLinks];
      const temp = newLinks[index];
      newLinks[index] = newLinks[index - 1];
      newLinks[index - 1] = temp;
      setDownloadLinks(newLinks.map((l, i) => ({ ...l, priority: i + 1 })));
    } else if (direction === 'down' && index < downloadLinks.length - 1) {
      const newLinks = [...downloadLinks];
      const temp = newLinks[index];
      newLinks[index] = newLinks[index + 1];
      newLinks[index + 1] = temp;
      setDownloadLinks(newLinks.map((l, i) => ({ ...l, priority: i + 1 })));
    }
  };

  const addGalleryImage = () => setGalleryImages([...galleryImages, '']);
  const updateGalleryImage = (index, value) => {
    const newImages = [...galleryImages];
    newImages[index] = value;
    setGalleryImages(newImages);
  };
  const removeGalleryImage = (index) => setGalleryImages(galleryImages.filter((_, i) => i !== index));
  const moveGalleryImage = (index, direction) => {
    if (direction === 'up' && index > 0) {
      const newImages = [...galleryImages];
      const temp = newImages[index];
      newImages[index] = newImages[index - 1];
      newImages[index - 1] = temp;
      setGalleryImages(newImages);
    } else if (direction === 'down' && index < galleryImages.length - 1) {
      const newImages = [...galleryImages];
      const temp = newImages[index];
      newImages[index] = newImages[index + 1];
      newImages[index + 1] = temp;
      setGalleryImages(newImages);
    }
  };

  const addVersion = () => setVersions([{ version: '', changelog: '', date: new Date().toISOString().split('T')[0], isLatest: false }, ...versions]);
  const updateVersion = (index, field, value) => {
    const newVersions = [...versions];
    newVersions[index][field] = value;
    setVersions(newVersions);
  };
  const removeVersion = (index) => setVersions(versions.filter((_, i) => i !== index));
  const rollbackVersion = (index) => {
    if (window.confirm('Rollback to this version? This will update the main app version and changelog.')) {
      const v = versions[index];
      setFormData({
        ...formData,
        version: v.version,
        changelog: v.changelog
      });
    }
  };

  const handleSave = async (publish = true, preventRedirect = false) => {
    if (!formData.title) return toast.error('Title is required');
    if (!formData.slug) return toast.error('URL Slug is required');
    if (!formData.packageName) return toast.error('Package Name is required');
    if (!formData.appLogo) return toast.error('App Logo is required');
    if (!formData.featuredImage) return toast.error('Featured Image is required');
    if (!formData.category) return toast.error('Category is required');
    if (!formData.version) return toast.error('Version is required');
    if (!formData.publisher) return toast.error('Publisher is required');

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        packageName: formData.packageName,
        featuredImage: formData.featuredImage,
        appLogo: formData.appLogo,
        galleryImages: galleryImages.filter(Boolean),
        version: formData.version,
        versions: versions.filter(v => v.version.trim() !== ''),
        publisher: formData.publisher,
        requirements: formData.requirements,
        category: formData.category,
        subCategory: formData.subCategory || null,
        size: formData.size,
        platform: formData.platform,
        appType: formData.appType,
        price: Number(formData.price) || 0,
        discountPrice: Number(formData.discountPrice) || 0,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        modFeatures: modFeatures.filter(f => f.trim() !== ''),
        content: editor.getHTML(),
        status: formData.status,
        visibilityStatus: formData.visibilityStatus,
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        isPopular: formData.isPopular,
        isVip: formData.isVip,
        editorChoice: formData.editorChoice,
        changelog: formData.changelog,
        expectedReleaseDate: formData.expectedReleaseDate || null,
        developmentProgress: formData.developmentProgress,
        seoTitle: formData.metaTitle,
        seoDescription: formData.metaDescription,
        description: formData.description,
        averageRating: Number(formData.averageRating) || 0,
        totalVotes: Number(formData.totalVotes) || 0,
        focusKeyword: formData.keywords,
        downloadLinks: downloadLinks.filter(l => l.url.trim() !== '')
      };

      if (isEditing) {
        await updatePost({ id, ...payload }).unwrap();
        toast.success(preventRedirect ? 'Changes applied successfully' : 'Post updated successfully');
      } else {
        await createPost(payload).unwrap();
        toast.success(preventRedirect ? 'Changes applied successfully' : 'Post created successfully');
      }
      
      if (!preventRedirect) {
        setTimeout(() => navigate(basePath), 1000);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save post');
    }
  };

  if (isEditing && isFetchingPost) {
    return <div className="text-center p-10 dark:text-white">Loading post data...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <Helmet>
        <title>Create New Post - Admin Panel</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass p-4 rounded-2xl sticky top-0 z-40 border border-slate-200 dark:border-slate-800 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BackButton fallbackRoute="/superadmin" showText={false} />
          <div>
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-primary" />
              {isEditing ? 'Edit Post' : 'Create New Post'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">Fill in the details to publish a new app or mod.</p>
          </div>
        </div>
      </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button 
            type="button"
            disabled={isCreating || isUpdating}
            onClick={() => navigate(basePath)}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl flex items-center gap-2 transition"
          >
            Cancel
          </button>
          <button 
            type="button"
            disabled={isCreating || isUpdating}
            onClick={() => handleSave(true, true)}
            className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-400 text-sm font-semibold rounded-xl flex items-center gap-2 transition"
          >
            <CheckCircle className="w-4 h-4" /> Apply Changes
          </button>
          <button 
            type="button"
            disabled={isCreating || isUpdating}
            onClick={() => handleSave(true, false)}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" /> Save & Close
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form & Editor */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Auto-Scraper Tool */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Globe className="w-32 h-32 text-indigo-500" />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 tracking-tight flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" /> Auto-Scraper (Beta)
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Paste a Play Store, GamePix, or GetModsApk link to auto-fill details</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="url" 
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  placeholder="https://play.google.com/... or https://getmodsapk.com/..." 
                  className="flex-1 px-4 py-3 bg-white dark:bg-[#111] border border-indigo-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-700 dark:text-slate-200"
                />
                <button 
                  type="button"
                  onClick={handleAutoScrape}
                  disabled={isScraping}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isScraping ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Fetching...</>
                  ) : (
                    <><Download className="w-4 h-4" /> Fetch App</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Basic Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <FileText className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold dark:text-white">Basic Information</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Post Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Spotify Premium Mod APK" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-slate-300">URL Slug</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="spotify-premium-mod-apk" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-500" />
                </div>
              </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Package Name</label>
                  <input type="text" name="packageName" value={formData.packageName} onChange={handleChange} placeholder="e.g. com.spotify.music" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Short Description</label>
                  <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="A short summary of this app..." className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <ImageUpload 
                    type="logo" 
                    label="App Logo" 
                    value={formData.appLogo} 
                    onChange={(url) => setFormData({ ...formData, appLogo: url })} 
                  />
                </div>
                <div>
                  <ImageUpload 
                    type="image" 
                    label="Featured Image" 
                    value={formData.featuredImage} 
                    onChange={(url) => setFormData({ ...formData, featuredImage: url })} 
                  />
                </div>
              </div>

              {/* Gallery Images Array Manager */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm dark:text-white">Gallery Images</h3>
                  <button type="button" onClick={addGalleryImage} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-blue-200 transition">
                    <Plus className="w-3 h-3" /> Add Image
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {galleryImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <ImageUpload 
                        type="image" 
                        label="" 
                        value={img} 
                        onChange={(url) => updateGalleryImage(index, url)} 
                      />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button type="button" onClick={() => moveGalleryImage(index, 'up')} disabled={index === 0} className="p-1.5 bg-slate-800/80 text-white rounded-md hover:bg-slate-700 disabled:opacity-0 backdrop-blur-sm" title="Move Left">↑</button>
                        <button type="button" onClick={() => moveGalleryImage(index, 'down')} disabled={index === galleryImages.length - 1} className="p-1.5 bg-slate-800/80 text-white rounded-md hover:bg-slate-700 disabled:opacity-0 backdrop-blur-sm" title="Move Right">↓</button>
                        <button type="button" onClick={() => removeGalleryImage(index)} className="p-1.5 bg-red-500/80 text-white rounded-md hover:bg-red-600 backdrop-blur-sm" title="Remove"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                {galleryImages.length === 0 && <p className="text-sm text-slate-500 italic mt-2">No gallery images added.</p>}
              </div>

              {/* Mod Features Array Manager */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm dark:text-white">Mod Features</h3>
                  <button type="button" onClick={addModFeature} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-green-200 transition">
                    <Plus className="w-3 h-3" /> Add Feature
                  </button>
                </div>
                <div className="space-y-3">
                  {modFeatures.map((feature, index) => (
                    <div key={index} className="flex flex-col md:flex-row items-center gap-3">
                      <input 
                        type="text" 
                        value={feature} 
                        onChange={(e) => updateModFeature(index, e.target.value)} 
                        placeholder="e.g. Unlimited Money" 
                        className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500" 
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => moveModFeature(index, 'up')} disabled={index === 0} className="p-2 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 disabled:opacity-50">↑</button>
                        <button type="button" onClick={() => moveModFeature(index, 'down')} disabled={index === modFeatures.length - 1} className="p-2 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 disabled:opacity-50">↓</button>
                        <button type="button" onClick={() => removeModFeature(index)} className="p-2 bg-red-100 text-red-600 dark:bg-red-900/30 rounded hover:bg-red-200"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {modFeatures.length === 0 && <p className="text-sm text-slate-500 italic">No mod features added.</p>}
                </div>
              </div>

            </div>
          </motion.div>

          {/* App Info Grid */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <Smartphone className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-bold dark:text-white">App Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold mb-1 dark:text-slate-400">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500">
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 dark:text-slate-400">Sub Category</label>
                <select name="subCategory" value={formData.subCategory} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500">
                  <option value="">Select Sub Category</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 dark:text-slate-400">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500">
                  <option value="Draft">Draft</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Published">Published</option>
                  <option value="Active">Active</option>
                  <option value="Under Development">Under Development</option>
                  <option value="Maintenance Mode">Maintenance Mode</option>
                  <option value="Discontinued">Discontinued</option>
                  <option value="Hidden">Hidden</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 dark:text-slate-400">Visibility Status</label>
                <select name="visibilityStatus" value={formData.visibilityStatus} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500">
                  <option value="Public">Public</option>
                  <option value="Premium Only">Premium Only</option>
                  <option value="Hidden">Hidden</option>
                  <option value="Admin Only">Admin Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 dark:text-slate-400">Version</label>
                <input type="text" name="version" value={formData.version} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 dark:text-slate-400">Size</label>
                <input type="text" name="size" value={formData.size} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 dark:text-slate-400">Publisher</label>
                <input type="text" name="publisher" value={formData.publisher} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 dark:text-slate-400">Tags</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. action, racing" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 dark:text-slate-400">Requirements</label>
                <input type="text" name="requirements" value={formData.requirements} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 dark:text-slate-400">App Type</label>
                <select name="appType" value={formData.appType} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500">
                  <option value="Free">Free</option>
                  <option value="Premium Subscription">Premium Subscription</option>
                  <option value="One-Time Purchase">One-Time Purchase</option>
                  <option value="Paid">Paid</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              {(formData.appType === 'Paid' || formData.appType === 'One-Time Purchase') && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1 dark:text-slate-400">Price (₹)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 dark:text-slate-400">Discount Price (₹)</label>
                    <input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-semibold mb-1 dark:text-slate-400">Average Rating</label>
                <input type="number" step="0.1" name="averageRating" value={formData.averageRating} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 dark:text-slate-400">Review Count</label>
                <input type="number" name="totalVotes" value={formData.totalVotes} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold mb-1 dark:text-slate-400">Changelog</label>
                <textarea name="changelog" value={formData.changelog} onChange={handleChange} rows="2" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 resize-none"></textarea>
              </div>
              {formData.status === 'Under Development' && (
                <div className="md:col-span-3 grid grid-cols-2 gap-4 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-900/50">
                  <div>
                    <label className="block text-xs font-semibold mb-1 dark:text-slate-400">Expected Release Date</label>
                    <input type="date" name="expectedReleaseDate" value={formData.expectedReleaseDate} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 dark:text-slate-400">Progress Percentage</label>
                    <input type="number" min="0" max="100" name="developmentProgress" value={formData.developmentProgress} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500" />
                  </div>
                </div>
              )}
              <div className="md:col-span-3 flex flex-wrap gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})} className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm font-semibold dark:text-slate-300">Featured App</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer ml-4">
                  <input type="checkbox" name="isVip" checked={formData.isVip} onChange={(e) => setFormData({...formData, isVip: e.target.checked})} className="w-5 h-5 rounded border-amber-500/50 text-amber-500 focus:ring-amber-500 bg-amber-500/10" />
                  <span className="text-sm font-bold text-amber-500">👑 VIP App</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isTrending" checked={formData.isTrending} onChange={(e) => setFormData({...formData, isTrending: e.target.checked})} className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm font-semibold dark:text-slate-300">Trending</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isPopular" checked={formData.isPopular} onChange={(e) => setFormData({...formData, isPopular: e.target.checked})} className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm font-semibold dark:text-slate-300">Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="editorChoice" checked={formData.editorChoice} onChange={(e) => setFormData({...formData, editorChoice: e.target.checked})} className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm font-semibold dark:text-slate-300">Editor's Choice</span>
                </label>
              </div>
              <div className="md:col-span-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm dark:text-white">Version History</h3>
                  <button type="button" onClick={addVersion} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-indigo-200 transition">
                    <Plus className="w-3 h-3" /> Add Version
                  </button>
                </div>
                <div className="space-y-4">
                  {versions.map((ver, index) => (
                    <div key={index} className="flex flex-col gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-slate-500 font-semibold">Version Number</label>
                          <input type="text" value={ver.version} onChange={(e) => updateVersion(index, 'version', e.target.value)} placeholder="e.g. 1.0.5" className="px-3 py-1.5 rounded-lg border w-full text-sm dark:bg-slate-700 dark:border-slate-600" />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-slate-500 font-semibold">Release Date</label>
                          <input type="date" value={ver.date ? new Date(ver.date).toISOString().split('T')[0] : ''} onChange={(e) => updateVersion(index, 'date', e.target.value)} className="px-3 py-1.5 rounded-lg border w-full text-sm dark:bg-slate-700 dark:border-slate-600" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-semibold">Changelog</label>
                        <textarea value={ver.changelog} onChange={(e) => updateVersion(index, 'changelog', e.target.value)} rows="2" className="px-3 py-1.5 rounded-lg border w-full text-sm dark:bg-slate-700 dark:border-slate-600 resize-none"></textarea>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button type="button" onClick={() => rollbackVersion(index)} className="px-3 py-1 text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded hover:bg-yellow-200">Rollback Here</button>
                        <button type="button" onClick={() => removeVersion(index)} className="p-1 bg-red-100 text-red-600 dark:bg-red-900/30 rounded hover:bg-red-200"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {versions.length === 0 && <p className="text-sm text-slate-500 italic">No version history added.</p>}
                </div>
              </div>
            </div>
          </motion.div>

          {/* MOD Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-bold dark:text-white">MOD Features</h2>
              </div>
              <button onClick={addModFeature} className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-green-200 transition">
                <Plus className="w-3 h-3" /> Add Feature
              </button>
            </div>
            
            <div className="space-y-3">
              {modFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                  <input 
                    type="text" 
                    value={feature} 
                    onChange={(e) => updateModFeature(index, e.target.value)}
                    placeholder="e.g. Unlimited Money" 
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button onClick={() => removeModFeature(index)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {modFeatures.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No MOD features added yet. Click "Add Feature".</p>
              )}
            </div>
          </motion.div>

          {/* Article Editor */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 p-6 pb-4">
              <FileText className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold dark:text-white">Article Content</h2>
            </div>
            
            <div className="bg-white dark:bg-[#0f172a]">
              <MenuBar editor={editor} />
              <EditorContent editor={editor} />
            </div>
          </motion.div>

          {/* Download & Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-500" />
                <h2 className="text-lg font-bold dark:text-white">Download Links</h2>
              </div>
              <button onClick={addDownloadLink} className="px-3 py-1.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-cyan-200 transition">
                <Plus className="w-3 h-3" /> Add Link
              </button>
            </div>
            
            <div className="space-y-4">
              {downloadLinks.map((link, index) => (
                <div key={index} className="flex flex-col md:flex-row items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col gap-1 w-full md:w-auto">
                    <label className="text-xs text-slate-500 font-semibold">Type</label>
                    <select value={link.type} onChange={(e) => updateDownloadLink(index, 'type', e.target.value)} className="px-2 py-1.5 rounded-lg border text-sm dark:bg-slate-700 dark:border-slate-600">
                      <option value="primary">Primary</option>
                      <option value="mirror">Mirror</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 w-full md:w-1/4">
                    <label className="text-xs text-slate-500 font-semibold">Label</label>
                    <input type="text" value={link.label} onChange={(e) => updateDownloadLink(index, 'label', e.target.value)} placeholder="e.g. Mediafire" className="px-3 py-1.5 rounded-lg border w-full text-sm dark:bg-slate-700 dark:border-slate-600" />
                  </div>
                  <div className="flex flex-col gap-1 w-full md:w-auto flex-1">
                    <label className="text-xs text-slate-500 font-semibold">URL</label>
                    <input type="url" value={link.url} onChange={(e) => updateDownloadLink(index, 'url', e.target.value)} placeholder="https://..." className="px-3 py-1.5 rounded-lg border w-full text-sm dark:bg-slate-700 dark:border-slate-600" />
                  </div>
                  <div className="flex flex-col gap-1 w-full md:w-auto">
                    <label className="text-xs text-slate-500 font-semibold">Active</label>
                    <input type="checkbox" checked={link.isActive} onChange={(e) => updateDownloadLink(index, 'isActive', e.target.checked)} className="mt-2 w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1 mt-4 md:mt-0">
                    <button onClick={() => moveDownloadLink(index, 'up')} disabled={index === 0} className="p-1.5 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 disabled:opacity-50">↑</button>
                    <button onClick={() => moveDownloadLink(index, 'down')} disabled={index === downloadLinks.length - 1} className="p-1.5 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 disabled:opacity-50">↓</button>
                    <button onClick={() => removeDownloadLink(index)} className="p-1.5 bg-red-100 text-red-600 dark:bg-red-900/30 rounded hover:bg-red-200 ml-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {downloadLinks.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No download links added. Add at least one primary link.</p>
              )}
            </div>
          </motion.div>

          {/* SEO Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <Tag className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold dark:text-white">SEO Optimization</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Meta Title</label>
                <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} placeholder="Optional custom meta title" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
                <p className="text-xs text-slate-500 mt-1">{formData.metaTitle.length} / 60 characters</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Meta Description</label>
                <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} rows="3" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"></textarea>
                <p className="text-xs text-slate-500 mt-1">{formData.metaDescription.length} / 160 characters</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Keywords (Comma separated)</label>
                <input type="text" name="keywords" value={formData.keywords} onChange={handleChange} placeholder="spotify, mod, premium unlocked" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
              </div>
            </div>
          </motion.div>

        </div>

        {/* Right Column: Live Preview Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            
            {/* TOC Preview */}
            <div className="glass-card p-5 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold border-b border-slate-200 dark:border-slate-800 pb-2 mb-3 text-sm uppercase tracking-wider dark:text-white">Table of Contents</h3>
              {toc.length > 0 ? (
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  {toc.map((heading) => (
                    <li key={heading.id} className={`truncate ${heading.level === 3 ? 'pl-4 text-xs' : heading.level === 4 ? 'pl-8 text-xs opacity-80' : 'font-medium dark:text-blue-400'}`}>
                      {heading.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">No headings found. Add H2, H3, or H4 to generate TOC.</p>
              )}
            </div>

            {/* Live App Card Preview */}
            <div className="glass-card overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-500 w-full relative">
                {/* Mock Banner */}
              </div>
              <div className="px-5 pb-5 relative">
                <div className="absolute -top-8 left-5 w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center p-1 border border-slate-100 dark:border-slate-700">
                  {formData.appLogo ? (
                    <img src={formData.appLogo} alt="Logo" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                
                <div className="mt-10">
                  <h3 className="font-bold text-lg leading-tight dark:text-white line-clamp-2">
                    {formData.title || 'App Title Preview'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{formData.publisher || 'Publisher Name'}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded">
                      {categories.find(c => c._id === formData.category)?.name || 'Category'}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded">
                      {formData.size || 'Size'}
                    </span>
                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded">
                      {formData.price || 'Free'}
                    </span>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 pointer-events-none">
                      <Download className="w-4 h-4" /> Download APK
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Preview Card */}
            <div className="glass-card p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b]">
              <h3 className="font-bold border-b border-slate-200 dark:border-slate-800 pb-2 mb-3 text-sm uppercase tracking-wider dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4" /> Search Preview
              </h3>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 truncate">https://premiumapps.com/post/{formData.slug || 'slug'}</p>
                <p className="text-base font-medium text-blue-600 dark:text-blue-400 leading-tight hover:underline cursor-pointer truncate">
                  {formData.metaTitle || formData.title || 'Meta Title Preview'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {formData.metaDescription || 'Add a meta description to see how this post will appear in Google search results. Keep it between 150-160 characters for best results.'}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CreatePost;
