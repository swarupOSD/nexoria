import toast from 'react-hot-toast';

export const downloadMp3 = async (song) => {
  if (song.isYoutube || !song.audioUrl) {
    toast.error('This track cannot be downloaded.');
    return;
  }

  const toastId = toast.loading(`Downloading ${song.title}...`);

  try {
    const response = await fetch(song.audioUrl);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${song.title} - ${song.artist}.mp3`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success('Download complete!', { id: toastId });
  } catch (error) {
    console.error('Download failed:', error);
    toast.error('Failed to download. The file might be restricted by CORS.', { id: toastId });
  }
};
