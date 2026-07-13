import React from 'react';

const AdminYTDownloader = () => {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Video Downloader</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Download YouTube videos, extract audio, and create GIFs directly from your dashboard.
          </p>
        </div>
      </div>

      <div className="flex-1 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative bg-black">
        {/* We assume the Flask app is running on localhost:5000 */}
        <iframe
          src="http://localhost:5000"
          title="Nexoria YT Downloader"
          width="100%"
          height="100%"
          className="w-full h-[800px] border-0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default AdminYTDownloader;
