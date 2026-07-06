import axios from 'axios';
import * as cheerio from 'cheerio';

async function testScrape() {
  const url = 'https://getmodsapk.com/7169-youtube-music-free-Premium-mod-apk/';
  
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    
    const allImages = [];
    $('img').each((i, el) => {
      allImages.push({
        src: $(el).attr('src'),
        class: $(el).attr('class')
      });
    });
    
    console.log('Images 5 to 25:', JSON.stringify(allImages.slice(5, 25), null, 2));

  } catch (error) {
    console.error('Error fetching:', error.message);
  }
}

testScrape();
