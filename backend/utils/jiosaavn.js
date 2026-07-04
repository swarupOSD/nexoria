import CryptoJS from 'crypto-js';

// JioSaavn decryption key
const KEY = '38346591';

/**
 * Decrypts the encrypted media URL from JioSaavn API
 * @param {string} encryptedUrl 
 * @returns {string} Decrypted URL
 */
export const decryptUrl = (encryptedUrl) => {
  try {
    const keyUtf8 = CryptoJS.enc.Utf8.parse(KEY);
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) },
      keyUtf8,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    let decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
    
    // Replace default _96.mp4 with _320.mp4 for highest quality
    return decryptedStr.replace('_96.mp4', '_320.mp4').replace('_160.mp4', '_320.mp4');
  } catch (error) {
    console.error('Error decrypting JioSaavn URL:', error);
    return null;
  }
};

/**
 * Search for songs on JioSaavn
 * @param {string} query 
 * @returns {Promise<Array>} List of songs
 */
export const searchSongs = async (query) => {
  try {
    const response = await fetch(`https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (!data || !data.songs || !data.songs.data) {
      return [];
    }

    return data.songs.data.map(song => ({
      saavnId: song.id,
      title: song.title.replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
      artist: song.more_info?.primary_artists || song.more_info?.singers || 'Unknown Artist',
      image: song.image.replace('50x50', '500x500') // Get high-res image
    }));
  } catch (error) {
    console.error('Error searching JioSaavn:', error);
    return [];
  }
};

/**
 * Get full song details and direct streaming URL
 * @param {string} songId 
 * @returns {Promise<Object>} Song details with decrypted URL
 */
export const getSongDetails = async (songId) => {
  try {
    const response = await fetch(`https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=${songId}`);
    const data = await response.json();
    
    if (!data || !data[songId]) {
      throw new Error('Song not found on JioSaavn');
    }

    const song = data[songId];
    
    if (!song.encrypted_media_url) {
      throw new Error('No encrypted media URL found');
    }

    const decryptedUrl = decryptUrl(song.encrypted_media_url);

    return {
      saavnId: song.id,
      title: song.song.replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
      artist: song.primary_artists || song.singers || 'Unknown Artist',
      image: song.image.replace('150x150', '500x500'), // Get high-res image
      audioUrl: decryptedUrl,
      duration: song.duration
    };
  } catch (error) {
    console.error('Error fetching JioSaavn song details:', error);
    throw error;
  }
};
