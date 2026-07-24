const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://127.0.0.1:27017/mods_apps';

const trackSchema = new mongoose.Schema({
  title: String,
  lyrics: [{
    time: Number,
    text: String
  }]
}, { strict: false });

const Track = mongoose.model('NexoriaTrack', trackSchema);

const testLyrics = [
  { time: 0, text: "(Instrumental Intro)" },
  { time: 5, text: "Pal bhar thahar jaao" },
  { time: 10, text: "Dil ye sambhal jaaye" },
  { time: 15, text: "Kaise tumhe roka karun" },
  { time: 20, text: "Meri taraf aata har gham phisal jaaye" },
  { time: 27, text: "Aankhon mein tum ko bharun" },
  { time: 33, text: "Bin bole baatein tumse karun" },
  { time: 39, text: "Agar tum saath ho..." },
  { time: 44, text: "(Instrumental Break)" },
  { time: 50, text: "Behti rehti nahar, nadiya si teri duniya mein" },
  { time: 56, text: "Meri duniya hai teri chaahaton mein" },
  { time: 62, text: "Main dhal jaati hoon teri aadaton mein" },
  { time: 68, text: "Agar tum saath ho..." }
];

async function updateLyrics() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');
    const track = await Track.findOne({ title: { $regex: /Agar Tum Saath Ho/i } });
    if (track) {
      track.lyrics = testLyrics;
      await track.save();
      console.log('Successfully updated lyrics for:', track.title);
    } else {
      console.log('Track not found!');
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

updateLyrics();
