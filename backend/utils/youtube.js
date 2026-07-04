import ytSearch from 'yt-search';

export const searchYouTube = async (query) => {
  try {
    const r = await ytSearch(query);
    const videos = r.videos.slice(0, 15); // Get top 15 results

    return videos.map(v => ({
      youtubeId: v.videoId,
      title: v.title,
      artist: v.author.name,
      image: v.thumbnail,
      audioUrl: v.url,
      duration: v.timestamp
    }));
  } catch (error) {
    console.error('Error searching YouTube:', error);
    throw new Error('Failed to search YouTube');
  }
};
