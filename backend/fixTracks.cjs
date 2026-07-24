const mongoose = require('mongoose');

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
    await mongoose.connect('mongodb://127.0.0.1:27017/mods_apps');
    
    const tracks = await NexoriaTrack.find({}, 'title artist album genre');
    console.log(`Found ${tracks.length} tracks.`);
    
    let deletedCount = 0;
    for (const track of tracks) {
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
