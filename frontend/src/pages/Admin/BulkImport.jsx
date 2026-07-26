import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, Play, CheckCircle, XCircle, Loader2, Link as LinkIcon, AlertCircle, ArrowRight
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

  const handleStartImport = () => {
    if (!linksText.trim()) return toast.error("Please enter at least one link");
    
    // Split by new line, remove empty lines
    const urls = linksText.split('\n').map(l => l.trim()).filter(l => l);
    
    if (urls.length === 0) return toast.error("No valid links found");
    if (urls.length > 20) return toast.error("Please import maximum 20 links at a time to prevent server overload.");

    const newTasks = urls.map((url, index) => ({
      id: Date.now() + index,
      url,
      status: 'pending', // pending, scraping, creating, success, failed
      appName: '',
      message: 'Waiting...'
    }));

    setImportTasks(newTasks);
    setLinksText('');
    processTasks(newTasks);
  };

  const processTasks = async (tasks) => {
    setIsProcessing(true);
    let updatedTasks = [...tasks];
    
    const updateTaskStatus = (index, status, appName = '', message = '') => {
      updatedTasks = [...updatedTasks];
      updatedTasks[index] = { ...updatedTasks[index], status, appName: appName || updatedTasks[index].appName, message };
      setImportTasks(updatedTasks);
    };

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      
      try {
        // Step 1: Scrape
        updateTaskStatus(i, 'scraping', '', 'Scraping details...');
        const scrapeRes = await scrapePlayStore({ url: task.url }).unwrap();
        
        const appName = scrapeRes.title || 'Unknown App';
        updateTaskStatus(i, 'creating', appName, 'Creating Draft Post...');

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
        updateTaskStatus(i, 'success', appName, 'Draft created successfully!');
        
      } catch (error) {
        console.error("Task failed:", error);
        updateTaskStatus(i, 'failed', '', error?.data?.message || 'Failed to process link');
      }
      
      // Delay between requests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setIsProcessing(false);
    toast.success("Bulk Import Process Completed!");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-indigo-500" />
          Smart Bulk Import
        </h1>
      </div>

      <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Paste Links</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Paste multiple DevUploads, Mediafire, Terabox, or Google Play links (one per line). 
          The Smart Scraper will fetch all details and create Draft posts automatically.
        </p>

        <textarea
          value={linksText}
          onChange={(e) => setLinksText(e.target.value)}
          disabled={isProcessing}
          placeholder={`https://devuploads.com/...&#10;https://play.google.com/store/apps/details?id=...&#10;https://mediafire.com/...`}
          className="w-full h-48 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={handleStartImport}
            disabled={isProcessing || !linksText.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            {isProcessing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
              <><Play className="w-5 h-5" /> Start Bulk Import</>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {importTasks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#151515] flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 dark:text-white">Import Progress</h3>
              <span className="text-xs font-medium px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                {importTasks.filter(t => t.status === 'success' || t.status === 'failed').length} / {importTasks.length} Completed
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
              {importTasks.map((task, index) => (
                <div key={task.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-[#151515] transition-colors">
                  <div className="mt-1">
                    {task.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />}
                    {(task.status === 'scraping' || task.status === 'creating') && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />}
                    {task.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {task.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-800 dark:text-white truncate">
                        {task.appName || `Link ${index + 1}`}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {task.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate mb-1.5">
                      <LinkIcon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{task.url}</span>
                    </div>

                    <div className={`text-xs flex items-center gap-1.5 ${
                      task.status === 'failed' ? 'text-red-500' : 
                      task.status === 'success' ? 'text-green-500' : 
                      'text-indigo-500'
                    }`}>
                      {task.status === 'failed' ? <AlertCircle className="w-3.5 h-3.5" /> : 
                       (task.status === 'scraping' || task.status === 'creating') ? <ArrowRight className="w-3.5 h-3.5" /> : null}
                      {task.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BulkImport;
