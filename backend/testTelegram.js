import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function testTelegram() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;

    if (!botToken || !channelId) {
      console.log('Missing env vars');
      return;
    }

    const formData = new FormData();
    formData.append('chat_id', channelId);
    
    // Create a dummy webm file buffer
    const dummyBuffer = Buffer.from('dummy webm content');
    formData.append('document', dummyBuffer, {
      filename: 'test.webm',
      contentType: 'video/webm'
    });

    // Append these to see if Telegram rejects sendDocument with these parameters
    formData.append('title', 'Test Title');
    formData.append('performer', 'Test Artist');

    console.log('Sending...');
    const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendDocument`, formData, {
      headers: {
        ...formData.getHeaders(),
      }
    });

    console.log('Success:', response.data.result.document.file_id);
  } catch (error) {
    console.error('Telegram API Error:', error.response?.data || error.message);
  }
}

testTelegram();
