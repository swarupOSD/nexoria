import MoviePurchaseRequest from '../models/MoviePurchaseRequest.js';
import Movie from '../models/Movie.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Submit a movie purchase request
// @route   POST /api/movies/purchase
// @access  Private
export const submitMoviePurchaseRequest = async (req, res) => {
  try {
    const { movieId, amount, transactionId, proofImage } = req.body;

  const movie = await Movie.findById(movieId);
  if (!movie) {
    res.status(404);
    throw new Error('Movie not found');
  }

  const existingRequest = await MoviePurchaseRequest.findOne({
    user: req.user._id,
    movie: movieId,
    status: { $in: ['Pending', 'Approved'] },
  });

  if (existingRequest) {
    if (existingRequest.status === 'Approved') {
      res.status(400);
      throw new Error('You already own this movie');
    } else {
      res.status(400);
      throw new Error('You already have a pending purchase request for this movie');
    }
  }

  const purchaseRequest = await MoviePurchaseRequest.create({
    user: req.user._id,
    movie: movieId,
    amount,
    transactionId,
    proofImage,
  });

    res.status(201).json({
      success: true,
      data: purchaseRequest,
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ success: false, message: error.message });
  }
};

// @desc    Get user's movie purchase requests
// @route   GET /api/movies/purchase/my-requests
// @access  Private
export const getMyMoviePurchaseRequests = async (req, res) => {
  try {
    const requests = await MoviePurchaseRequest.find({ user: req.user._id })
    .populate('movie', 'title posterImage price')
    .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all movie purchase requests
// @route   GET /api/movies/purchase
// @access  Private/SuperAdmin
export const getAllMoviePurchaseRequests = async (req, res) => {
  try {
    const { status, search } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = {};
  if (status) {
    query.status = status;
  }

  // To search by transaction ID or user email
  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');
    const userIds = users.map(u => u._id);

    query.$or = [
      { transactionId: { $regex: search, $options: 'i' } },
      { user: { $in: userIds } }
    ];
  }

  const total = await MoviePurchaseRequest.countDocuments(query);
  const requests = await MoviePurchaseRequest.find(query)
    .populate('user', 'name email avatar')
    .populate('movie', 'title price posterImage')
    .sort('-createdAt')
    .skip(startIndex)
    .limit(limit);

    res.status(200).json({
      success: true,
      count: requests.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      },
      data: requests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update movie purchase request status
// @route   PUT /api/movies/purchase/:id
// @access  Private/SuperAdmin
export const updateMoviePurchaseRequestStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
  const request = await MoviePurchaseRequest.findById(req.params.id)
    .populate('user', 'name email')
    .populate('movie', 'title');

  if (!request) {
    res.status(404);
    throw new Error('Purchase request not found');
  }

  if (request.status !== 'Pending') {
    res.status(400);
    throw new Error('Only pending requests can be updated');
  }

  request.status = status;
  if (status === 'Rejected') {
    request.rejectionReason = rejectionReason;
  }
  request.approvedBy = req.user._id;

  await request.save();

  // If approved, add movie to user's purchased movies
  if (status === 'Approved') {
    const user = await User.findById(request.user._id);
    if (!user.purchasedMovies) {
      user.purchasedMovies = [];
    }
    if (!user.purchasedMovies.includes(request.movie._id)) {
      user.purchasedMovies.push(request.movie._id);
      await user.save();
    }
  }

  // Create notification
  await Notification.create({
    user: request.user._id,
    type: 'purchase_update',
    title: `Movie Purchase ${status}`,
    message: status === 'Approved' 
      ? `Your purchase for ${request.movie.title} has been approved. You can now access it.`
      : `Your purchase for ${request.movie.title} was rejected. Reason: ${rejectionReason || 'Invalid proof'}`,
    link: '/dashboard',
  });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ success: false, message: error.message });
  }
};
