import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, Play, CheckCircle, XCircle, Loader2, Link as LinkIcon, 
  Trash2, AlertCircle, Copy, Check, ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCreatePostMutation, useScrapePlayStoreMutation } from "../../features/post/postApiSlice";
import BackButton from '../../components/BackButton';

const BulkImport = () => {
  const [linksText, setLinksText] = useState('');
  const [importTasks, setImportTasks] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [scrapePlayStore] = useScrapePlayStoreMutation();
  const [createPost] = useCreatePostMutation();

  const handleAddLinks = () => {
    if (!linksText.trim()) return toast.error("Please paste at least one link");
    
    // Split by new line, remove empty lines
    const urls = linksText.split('\n').map(l => l.trim()).filter(l => l);
    
    if (urls.length === 0) return toast.error("No valid links found");
    
    // Filter duplicates against existing queue
    const existingUrls = importTasks.map(t => t.url);
    const uniqueUrls = urls.filter(url => !existingUrls.includes(url));
    
    if (uniqueUrls.length === 0) return toast.error("These links are already in the queue!");

    const newTasks = uniqueUrls.map((url, index) => ({
      id: Date.now() + index,
      url,
      status: 'pending', // pending, scraping, creating, success, failed
      appName: '',
      icon: '',
      message: 'Ready to import'
    }));

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
    if (pendingTasks.length > 20) return toast.error("Please import maximum 20 links at a time to prevent server overload.");

    setIsProcessing(true);
    let updatedTasks = [...importTasks];
    
    const updateTask = (id, updates) => {
      setImportTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    for (let i = 0; i < pendingTasks.length; i++) {
      const task = pendingTasks[i];
      
      try {
        // Step 1: Scrape
        updateTask(task.id, { status: 'scraping', message: 'Scraping app details...' });
        const scrapeRes = await scrapePlayStore({ url: task.url }).unwrap();
        
        const appName = scrapeRes.title || 'Unknown App';
        const icon = scrapeRes.icon || '';
        updateTask(task.id, { status: 'creating', appName, icon, message: 'Creating Draft Post...' });

        // Step 2: Create Post
        const formData = {
          title: appName,
          slug: appName ? appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now() : 'draft-' + Date.now(),
          description: scrapeRes.description ? scrapeRes.description.slice(0, 150) + '...' : '',
          content: scrapeRes.description ? `<p>${scrapeRes.description}</p>` : '',
          featuredImage: scrapeRes.icon || '',
          appLogo: scrapeRes.icon || '',
          publisher: scrapeRes.developer || 'Unknown',
          size: scrapeRes.size || 'Varies',
          version: scrapeRes.version || 'Varies',
          status: 'draft',
          categories: [], 
          downloadLinks: scrapeRes.downloadUrl ? [{ label: 'Download APK', url: scrapeRes.downloadUrl }] : [],
          galleryImages: scrapeRes.screenshots ? scrapeRes.screenshots.slice(0, 5) : []
        };

        await createPost(formData).unwrap();
        updateTask(task.id, { status: 'success', message: 'Imported successfully!' });
        
      } catch (error) {
        console.error("Task failed:", error);
        updateTask(task.id, { status: 'failed', message: error?.data?.message || 'Failed to process link' });
      }
      
      // Delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setIsProcessing(false);
    toast.success("Bulk Import Process Completed!");
  };

  const pendingCount = importTasks.filter(t => t.status === 'pending' || t.status === 'failed').length;
  const successCount = importTasks.filter(t => t.status === 'success').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <BackButton />
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
            Bulk App Importer 
            <span className="bg-[#1ed760] text-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Beta</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Smart URL parsing for DevUploads, Mediafire, Terabox, and Play Store.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Col: Input Zone */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl shadow-[0_0_30px_rgba(30,215,96,0.03)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1ed760] to-teal-400"></div>
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-[#1ed760]" />
              Paste Links
            </h2>
            <p className="text-[#b3b3b3] text-sm mb-4">
              Paste URLs here (one per line). The smart scraper will extract IDs automatically.
            </p>
            
            <textarea
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              disabled={isProcessing}
              placeholder="https://devuploads.com/...&#10;https://play.google.com/..."
              className="w-full h-48 bg-[#181818] border border-white/5 hover:border-white/20 transition-colors rounded-xl p-4 text-sm font-mono text-white focus:outline-none focus:border-[#1ed760] focus:ring-1 focus:ring-[#1ed760] disabled:opacity-50 resize-none custom-scrollbar"
            />
            
            <button
              onClick={handleAddLinks}
              disabled={isProcessing || !linksText.trim()}
              className="w-full mt-4 flex justify-center items-center gap-2 bg-white hover:bg-gray-200 text-black disabled:bg-white/10 disabled:text-white/30 px-6 py-3 rounded-full font-bold transition-colors"
            >
              <UploadCloud className="w-5 h-5" /> Add to Queue
            </button>
          </div>
        </div>

        {/* Right Col: Queue */}
        <div className="lg:col-span-2 flex flex-col bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] min-h-[500px]">
          
          {/* Queue Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#181818]">
            <div>
              <h2 className="text-lg font-bold text-white">Import Queue</h2>
              <p className="text-sm text-[#b3b3b3]">
                {importTasks.length} items ({successCount} completed)
              </p>
            </div>
            {successCount > 0 && (
              <button 
                onClick={handleClearCompleted}
                className="text-xs font-medium text-[#b3b3b3] hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors"
              >
                Clear Completed
              </button>
            )}
          </div>

          {/* Queue List */}
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {importTasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <LinkIcon className="w-8 h-8 text-white/50" />
                </div>
                <h3 className="text-white font-medium mb-1">Queue is empty</h3>
                <p className="text-sm text-[#b3b3b3]">Paste links on the left to get started</p>
              </div>
            ) : (
              <div className="space-y-1">
                <AnimatePresence>
                  {importTasks.map((task, index) => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`group flex items-center gap-4 p-3 rounded-xl transition-colors ${
                        task.status === 'success' ? 'bg-[#1ed760]/5' : 
                        task.status === 'failed' ? 'bg-red-500/5' : 
                        'hover:bg-white/5'
                      }`}
                    >
                      {/* Icon / Status Indicator */}
                      <div className="relative w-10 h-10 shrink-0 bg-[#282828] rounded-lg overflow-hidden flex items-center justify-center">
                        {task.icon ? (
                          <img src={task.icon} alt="Icon" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[#b3b3b3] font-mono text-xs">{index + 1}</span>
                        )}
                        
                        {/* Overlay for processing */}
                        {(task.status === 'scraping' || task.status === 'creating') && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                            <Loader2 className="w-5 h-5 text-[#1ed760] animate-spin" />
                          </div>
                        )}
                        {task.status === 'success' && (
                          <div className="absolute inset-0 bg-[#1ed760]/20 flex items-center justify-center backdrop-blur-[1px]">
                            <CheckCircle className="w-5 h-5 text-[#1ed760]" />
                          </div>
                        )}
                        {task.status === 'failed' && (
                          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center backdrop-blur-[1px]">
                            <XCircle className="w-5 h-5 text-red-500" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate text-sm">
                          {task.appName || task.url}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs flex items-center gap-1 ${
                            task.status === 'success' ? 'text-[#1ed760]' :
                            task.status === 'failed' ? 'text-red-400' :
                            task.status === 'scraping' || task.status === 'creating' ? 'text-[#1ed760]' :
                            'text-[#b3b3b3]'
                          }`}>
                            {task.message}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="shrink-0 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {(task.status === 'pending' || task.status === 'failed') && !isProcessing && (
                          <button 
                            onClick={() => handleRemoveTask(task.id)}
                            className="p-2 text-[#b3b3b3] hover:text-white hover:bg-white/10 rounded-full transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t border-white/5 bg-[#181818] flex items-center justify-between">
            <div className="text-sm font-medium text-[#b3b3b3]">
              {isProcessing ? (
                <span className="flex items-center gap-2 text-[#1ed760]">
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing Queue...
                </span>
              ) : (
                `${pendingCount} pending items`
              )}
            </div>
            
            <button
              onClick={processTasks}
              disabled={isProcessing || pendingCount === 0}
              className="flex items-center gap-2 bg-[#1ed760] hover:scale-105 disabled:hover:scale-100 disabled:bg-[#1ed760]/30 disabled:text-black/30 text-black px-6 py-2.5 rounded-full font-bold transition-all"
            >
              {isProcessing ? 'Importing...' : 'Start Import'}
            </button>
          </div>
          
        </div>
      </div>
      
      {/* Global override for scrollbars in this component to match dark theme */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
};

export default BulkImport;
