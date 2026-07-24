const CACHE_NAME = 'nexoria-music-downloads';

export const downloadTrack = async (url) => {
  if (!('caches' in window)) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    await cache.put(url, response);
    return true;
  } catch (error) {
    console.error('Failed to download track:', error);
    return false;
  }
};

export const removeDownloadedTrack = async (url) => {
  if (!('caches' in window)) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    return await cache.delete(url);
  } catch (error) {
    console.error('Failed to remove downloaded track:', error);
    return false;
  }
};

export const isTrackDownloaded = async (url) => {
  if (!('caches' in window)) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(url);
    return !!response;
  } catch (error) {
    return false;
  }
};

export const getBlobUrlForTrack = async (url) => {
  if (!('caches' in window)) return null;
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(url);
    if (response) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
    return null;
  } catch (error) {
    console.error('Failed to get blob url:', error);
    return null;
  }
};
