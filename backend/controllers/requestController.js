import Request from '../models/Request.js';

// @desc    Get all requests
// @route   GET /api/requests
// @access  Public
export const getRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;

    let query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.type) {
      query.type = req.query.type;
    }

    const sort = req.query.sort === 'popular' ? { upvotes: -1, createdAt: -1 } : { createdAt: -1 };

    const total = await Request.countDocuments(query);
    const requests = await Request.find(query)
      .sort(sort)
      .skip(startIndex)
      .limit(limit)
      .populate('user', 'name profileImage');

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: requests,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create new request
// @route   POST /api/requests
// @access  Private
export const createRequest = async (req, res) => {
  try {
    const { title, type, description } = req.body;

    const request = await Request.create({
      title,
      type,
      description,
      user: req.user.id,
    });

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to create request' });
  }
};

// @desc    Upvote or remove upvote from a request
// @route   PUT /api/requests/:id/upvote
// @access  Private
export const toggleUpvote = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const isUpvoted = request.upvotedBy.includes(req.user.id);

    if (isUpvoted) {
      // Remove upvote
      request.upvotedBy = request.upvotedBy.filter(
        (userId) => userId.toString() !== req.user.id.toString()
      );
      request.upvotes -= 1;
    } else {
      // Add upvote
      request.upvotedBy.push(req.user.id);
      request.upvotes += 1;
    }

    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update request status
// @route   PUT /api/requests/:id
// @access  Private/SuperAdmin
export const updateRequest = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status, adminResponse },
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to update request' });
  }
};

// @desc    Delete request
// @route   DELETE /api/requests/:id
// @access  Private (Owner) / SuperAdmin
export const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Ensure user is owner or superadmin
    if (request.user.toString() !== req.user.id && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this request' });
    }

    await request.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
