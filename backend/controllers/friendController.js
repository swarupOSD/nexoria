import { FriendRequest } from '../models/FriendRequest.js';
import User from '../models/User.js';

export const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    if (req.user._id.toString() === receiverId) {
      return res.status(400).json({ success: false, message: 'Cannot send request to yourself.' });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'Friend request already exists or pending.' });
    }

    const newRequest = await FriendRequest.create({
      sender: req.user._id,
      receiver: receiverId
    });

    res.status(201).json({ success: true, data: newRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({ receiver: req.user._id, status: 'pending' })
      .populate('sender', 'name username profileImage')
      .lean();
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const respondToFriendRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body; // action: 'accepted' or 'rejected'
    const request = await FriendRequest.findById(requestId);

    if (!request || request.receiver.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (action === 'accepted') {
      request.status = 'accepted';
      await request.save();

      // Add to friends lists
      await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } });
      await User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } });
    } else {
      await request.deleteOne();
    }

    res.status(200).json({ success: true, message: `Request ${action}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getFriendsList = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name username profileImage role isPremium auraRank chatNameColor profileBorder').lean();
    res.status(200).json({ success: true, data: user.friends });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
