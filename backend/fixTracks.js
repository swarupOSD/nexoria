import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const NexoriaTrackSchema = new mongoose.Schema({
  title: String,
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'NexoriaArtist' },
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'NexoriaAlbum' },
  genre: { type: mongoose.Schema.Types.ObjectId, ref: 'NexoriaGenre' },
  audioUrl: String,
  telegramFileId: String,
  coverImage: String,
  duration: Number,
  playCount: { type: Number, default: 0 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const NexoriaTrack = mongoose.models.NexoriaTrack || mongoose.model('NexoriaTrack', NexoriaTrackSchema);

const fixTracks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexoria');
    
    // Find tracks that look like MovieBox apps/games or don't have standard music fields
    const tracks = await NexoriaTrack.find({}, 'title artist album genre');
    console.log(`Found ${tracks.length} tracks.`);
    
    let deletedCount = 0;
    for (const track of tracks) {
      // Examples mentioned: "Drift for Life", "JioSaavn"
      // Or we could check if artist and album are null (assuming all real music has artist)
      if (
        !track.artist && !track.album && !track.genre ||
        track.title.includes('Drift') || 
        track.title.includes('JioSaavn')
      ) {
        console.log(`Deleting suspicious track: ${track.title}`);
        await NexoriaTrack.findByIdAndDelete(track._id);
        deletedCount++;
      }
    }
    
    console.log(`Deleted ${deletedCount} non-music tracks.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixTracks();
