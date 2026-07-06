import axios from 'axios';
import * as cheerio from 'cheerio';

async function testScrape() {
  const url = 'https://getmodsapk.com/';
  
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    
    let targetUrl = $('a[href*="/"]').first().attr('href');
    if (!targetUrl.startsWith('http')) targetUrl = `https://getmodsapk.com${targetUrl}`;
    
    const { data: gameData } = await axios.get(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $game = cheerio.load(gameData);
    
    const title = $game('h1').text().trim();
    const ogImage = $game('meta[property="og:image"]').attr('content');
    const firstW20Img = $game('img.w-20.h-20, img[class*="w-20"][class*="h-20"], img[class*="w-24"][class*="h-24"]').first().attr('src');
    
    console.log('Title:', title);
    console.log('OG Image:', ogImage);
    console.log('First App Icon Match:', firstW20Img);
    
  } catch (error) {
    console.error('Error fetching:', error.message);
  }
}

testScrape();
