import MovieSettings from '../models/MovieSettings.js';

// @desc    Get movie settings
// @route   GET /api/movie-settings
// @access  Public
export const getMovieSettings = async (req, res, next) => {
  try {
    let settings = await MovieSettings.findOne();

    if (!settings) {
      settings = await MovieSettings.create({});
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update movie settings
// @route   PUT /api/movie-settings
// @access  Private/SuperAdmin
export const updateMovieSettings = async (req, res, next) => {
  try {
    let settings = await MovieSettings.findOne();

    if (!settings) {
      settings = await MovieSettings.create({});
    }

    settings.movieBoxName = req.body.movieBoxName !== undefined ? req.body.movieBoxName : settings.movieBoxName;
    settings.movieBoxLogo = req.body.movieBoxLogo !== undefined ? req.body.movieBoxLogo : settings.movieBoxLogo;
    settings.movieBoxBanner = req.body.movieBoxBanner !== undefined ? req.body.movieBoxBanner : settings.movieBoxBanner;
    settings.movieBoxFavicon = req.body.movieBoxFavicon !== undefined ? req.body.movieBoxFavicon : settings.movieBoxFavicon;
    settings.updatedBy = req.user._id;

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
