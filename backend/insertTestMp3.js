import mongoose from 'mongoose';
import Music from './models/Music.js';

mongoose.connect('mongodb://127.0.0.1:27017/mods_apps')
  .then(async () => {
    console.log("Connected to MongoDB.");
    
    const newSong = new Music({
      title: "Test MP3",
      artist: "SoundHelix",
      category: "Other",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      isYoutube: false,
      image: "https://via.placeholder.com/300?text=Test+MP3",
      status: "Active",
      duration: 372
    });

    await newSong.save();
    console.log("Test MP3 successfully inserted into database!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });
