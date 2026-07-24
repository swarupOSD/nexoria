import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();
import NexoriaTrack from './models/NexoriaTrack.js';
import NexoriaLyrics from './models/NexoriaLyrics.js';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const track = await NexoriaTrack.findOne({}).sort({createdAt: -1});
  if(!track) {
    console.log('No track found');
    process.exit(0);
  }
  console.log('Found track:', track.title);
  
  const lyricsText = [
    { time: 0, text: '🎵 (Instrumental Intro) 🎵' },
    { time: 4, text: 'This is the first line of the song' },
    { time: 8, text: 'Singing along to the melody' },
    { time: 12, text: 'When the beat drops, we go crazy' },
    { time: 16, text: 'Yeah, we are coding in the night' },
    { time: 20, text: 'Making Spotify clones feel so right' },
    { time: 24, text: 'Ohhhhhh, synchronized lyrics!' },
    { time: 28, text: 'Watch the lines scroll up the screen' },
    { time: 32, text: 'Just like the real thing, pristine' },
    { time: 36, text: '🎵 (Guitar Solo) 🎵' },
    { time: 45, text: 'And we fade out...' }
  ];
  
  await NexoriaLyrics.deleteMany({ trackId: track._id });
  const newLyrics = await NexoriaLyrics.create({
    trackId: track._id,
    syncedLyrics: lyricsText,
    plainText: lyricsText.map(l => l.text).join('\n'),
    addedBy: track.addedBy
  });
  
  track.lyricsId = newLyrics._id;
  await track.save();
  
  console.log('Successfully seeded lyrics for', track.title);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
