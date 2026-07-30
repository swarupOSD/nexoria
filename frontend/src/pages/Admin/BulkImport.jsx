import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Play, CheckCircle, XCircle, Loader2, Link as LinkIcon, 
  Trash2, AlertCircle, X, Box
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCreatePostMutation, useScrapePlayStoreMutation } from "../../features/post/postApiSlice";
import BackButton from '../../components/BackButton';

const BulkImport = () => {
  const [linksText, setLinksText] = useState('');
  const [importTasks, setImportTasks] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  
  const [scrapePlayStore] = useScrapePlayStoreMutation();
  const [createPost] = useCreatePostMutation();

  // Handle Drag & Drop Events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFiles(e.target.files);
    }
  };

  // Convert Files to Tasks
  const processSelectedFiles = (files) => {
    const fileArray = Array.from(files);
    const newTasks = fileArray.map((file, index) => {
      // Clean filename immediately for display
      let cleanName = file.name
        .replace(/\.apk|\.xapk|\.zip|\.rar/i, '')
        .replace(/_|-|\./g, ' ')
        .replace(/v\d+\.\d+(\.\d+)?/i, '')
        .replace(/\d+\.\d+(\.\d+)?/i, '')
        .replace(/mod|premium|pro|unlocked|hack|crack/ig, '')
        .trim();
        
      if (!cleanName) cleanName = file.name.substring(0, 15);

      return {
        id: Date.now() + index,
        type: 'file',
        url: file.name, // using filename as search term
        searchName: cleanName,
        status: 'pending',
        appName: cleanName,
        icon: '',
        message: 'Ready to fetch details'
      };
    });

    setImportTasks(prev => [...prev, ...newTasks]);
    toast.success(`Added ${newTasks.length} files to queue`);
  };

  // Handle Text Links
  const handleAddLinks = () => {
    if (!linksText.trim()) return toast.error("Please paste at least one link");
    const urls = linksText.split('\n').map(l => l.trim()).filter(l => l);
    if (urls.length === 0) return toast.error("No valid links found");
    
    const existingUrls = importTasks.map(t => t.url);
    const uniqueUrls = urls.filter(url => !existingUrls.includes(url));
    if (uniqueUrls.length === 0) return toast.error("These links are already in the queue!");

    const newTasks = uniqueUrls.map((line, index) => {
      let url = line;
      let appName = line;
      if (line.includes('|')) {
        const parts = line.split('|');
        url = parts[0].trim();
        appName = parts[1].trim();
      }
      return {
        id: Date.now() + index + 1000,
        type: 'link',
        url,
        searchName: appName,
        status: 'pending',
        appName: appName,
        icon: '',
        message: 'Ready to import link'
      };
    });

    setImportTasks(prev => [...prev, ...newTasks]);
    setLinksText('');
    toast.success(`Added ${newTasks.length} links to queue`);
  };

  const handleRemoveTask = (id) => {
    setImportTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleClearCompleted = () => {
    setImportTasks(prev => prev.filter(t => t.status !== 'success'));
  };

  const processTasks = async () => {
    const pendingTasks = importTasks.filter(t => t.status === 'pending' || t.status === 'failed');
    if (pendingTasks.length === 0) return toast.error("Queue is empty!");

    setIsProcessing(true);
    setImportProgress({ current: 0, total: pendingTasks.length });
    
    const updateTask = (id, updates) => {
      setImportTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    for (let i = 0; i < pendingTasks.length; i++) {
      const task = pendingTasks[i];
      updateTask(task.id, { status: 'scraping', message: 'Fetching App details...' });
      
      try {
        // Step 1: Scrape Details (Backend scraper handles both URLs and search terms if we configure it)
        // Note: For files, we send the cleanName. For links, we send the URL along with searchTerm.
        const scrapeRes = await scrapePlayStore({ url: task.url, searchTerm: task.searchName }).unwrap();
        
        const appName = scrapeRes.title || task.searchName;
        const icon = scrapeRes.icon || '';
        updateTask(task.id, { status: 'creating', appName, icon, message: 'Publishing App...' });

        // Step 2: Create Post
        const formData = {
          title: appName,
          slug: appName ? appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now() : 'app-' + Date.now(),
          description: scrapeRes.description ? scrapeRes.description.slice(0, 150) + '...' : '',
          content: scrapeRes.description ? `<p>${scrapeRes.description}</p>` : '',
          featuredImage: scrapeRes.icon || '',
          appLogo: scrapeRes.icon || '',
          publisher: 'Nexoria', // Always Nexoria
          size: scrapeRes.size || 'Varies',
          version: scrapeRes.version || 'Varies',
          status: 'Published', // Always Publish
          categories: [], 
          downloadLinks: scrapeRes.downloadUrl ? [{ label: 'Download APK', url: scrapeRes.downloadUrl }] : [],
          galleryImages: scrapeRes.screenshots ? scrapeRes.screenshots.slice(0, 5) : []
        };

        await createPost(formData).unwrap();
        updateTask(task.id, { status: 'success', message: 'Published successfully!' });
        
      } catch (error) {
        console.error("Task failed:", error);
        updateTask(task.id, { status: 'failed', message: error?.data?.message || 'Failed to fetch details' });
      }
      
      setImportProgress(prev => ({ ...prev, current: prev.current + 1 }));
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setIsProcessing(false);
    toast.success("Bulk Import Process Completed!");
  };

  const pendingCount = importTasks.filter(t => t.status === 'pending' || t.status === 'failed').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-4 md:space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <BackButton />
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
            Bulk App Importer 
            <span className="bg-[#1ed760] text-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Beta</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Drag & drop APK files or paste DevUploads links to auto-publish apps.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        
        {/* Left Col: Input Zone */}
        <div className="flex flex-col gap-4 md:gap-6">
          {/* File Picker Zone (Exactly like Music Uploader) */}
          <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(30,215,96,0.03)] flex flex-col h-[350px]">
            <div className="flex items-center p-4 border-b border-white/5 bg-[#181818]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-[#1ed760]" />
                Select APK Files
              </h2>
            </div>
            <div 
              className={`flex-1 m-6 relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all ${dragActive ? 'border-[#1ed760] bg-[#1ed760]/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input type="file" multiple accept=".apk,.xapk" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isProcessing} />
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Upload className={`w-8 h-8 ${dragActive ? 'text-[#1ed760]' : 'text-[#b3b3b3]'}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Drag & Drop APK Files Here</h3>
              <p className="text-[#b3b3b3] text-sm">or click to browse your computer</p>
            </div>
          </div>

          {/* Links Zone */}
          <div className="bg-[#121212] border border-white/10 p-4 md:p-6 rounded-2xl shadow-[0_0_30px_rgba(30,215,96,0.03)]">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-[#1ed760]" />
              Paste Links
            </h2>
            <p className="text-[#b3b3b3] text-sm mb-4">
              Alternatively, paste DevUploads links here (one per line).
            </p>
            <textarea
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              disabled={isProcessing}
              placeholder="https://devuploads.com/... | App Name&#10;https://play.google.com/..."
              className="w-full h-32 bg-[#181818] border border-white/5 hover:border-white/20 transition-colors rounded-xl p-4 text-sm font-mono text-white focus:outline-none focus:border-[#1ed760] focus:ring-1 focus:ring-[#1ed760] disabled:opacity-50 resize-none custom-scrollbar"
            />
            <button
              onClick={handleAddLinks}
              disabled={isProcessing || !linksText.trim()}
              className="w-full mt-4 flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 text-white disabled:bg-white/5 disabled:text-white/30 px-4 md:px-6 py-2.5 rounded-full font-bold transition-colors"
            >
               Add Links to Queue
            </button>
          </div>
        </div>

        {/* Right Col: Queue */}
        <div className="flex flex-col bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] min-h-[600px]">
          
          {/* Queue Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-[#181818]">
            <h3 className="font-bold text-white text-lg flex items-center justify-between w-full">
              <span>Import Queue ({importTasks.length})</span>
              {isProcessing && <span className="text-[#1ed760] text-sm">Processing {importProgress.current}/{importProgress.total}</span>}
            </h3>
          </div>

          {/* Queue List */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {importTasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 md:p-8 opacity-50">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Box className="w-8 h-8 text-white/50" />
                </div>
                <h3 className="text-white font-medium mb-1">Queue is empty</h3>
                <p className="text-sm text-[#b3b3b3]">Select files or paste links to start</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {importTasks.map((task, index) => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`group flex items-center gap-4 p-3 bg-[#181818] rounded-xl border transition-colors ${
                        task.status === 'success' ? 'border-[#1ed760]/30 bg-[#1ed760]/5' : 
                        task.status === 'failed' ? 'border-red-500/30 bg-red-500/5' : 
                        'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 shrink-0 overflow-hidden shadow-md flex items-center justify-center relative">
                        {task.icon ? (
                          <img src={task.icon} className="w-full h-full object-cover" alt="icon" />
                        ) : (
                          task.type === 'file' ? <Box className="w-5 h-5 text-[#b3b3b3]" /> : <LinkIcon className="w-5 h-5 text-[#b3b3b3]" />
                        )}
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-bold text-white text-sm truncate">{task.appName}</span>
                        <span className={`text-xs truncate ${task.status === 'success' ? 'text-[#1ed760]' : task.status === 'failed' ? 'text-red-400' : 'text-[#b3b3b3]'}`}>
                          {task.message}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-end min-w-[80px]">
                        {task.status === 'pending' && !isProcessing && (
                          <button onClick={() => handleRemoveTask(task.id)} className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {(task.status === 'scraping' || task.status === 'creating') && <Loader2 className="w-5 h-5 text-[#1ed760] animate-spin" />}
                        {task.status === 'success' && <CheckCircle className="w-5 h-5 text-[#1ed760]" />}
                        {task.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-400" />}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-4 md:p-6 border-t border-white/5 bg-[#181818] flex justify-between gap-3">
             <button 
                onClick={handleClearCompleted}
                disabled={isProcessing}
                className="px-4 md:px-6 py-2.5 rounded-full font-bold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Clear Done
              </button>
            <button
              onClick={processTasks}
              disabled={isProcessing || pendingCount === 0}
              className="flex items-center gap-2 bg-[#1ed760] hover:scale-105 disabled:hover:scale-100 disabled:bg-[#1ed760]/30 disabled:text-black/30 text-black px-4 md:px-8 py-2.5 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(30,215,96,0.3)]"
            >
              {isProcessing ? 'Publishing...' : 'Start Publish'}
            </button>
          </div>
          
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}} />
    </div>
  );
};

export default BulkImport;
