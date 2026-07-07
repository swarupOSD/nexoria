import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const broadcastNotification = async (req, res) => {
  try {
    const { title, message, type = 'SYSTEM', actionUrl, icon } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    // Insert a notification for every active user
    // Note: For a very large user base, this should ideally be a background job using a queue
    const activeUsers = await User.find({ status: 'active' }, '_id');
    
    const notifications = activeUsers.map(user => ({
      user: user._id,
      title,
      message,
      type,
      actionUrl,
      icon: icon || 'Bell',
      isRead: false
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(200).json({ success: true, message: `Broadcast sent to ${notifications.length} users` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendDirectNotification = async (req, res) => {
  try {
    const { userId, title, message, type = 'SYSTEM', actionUrl, icon } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({ success: false, message: 'User ID, title, and message are required' });
    }

    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      actionUrl,
      icon: icon || 'Mail',
      isRead: false
    });

    res.status(200).json({ success: true, message: 'Message sent successfully', data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = { user: req.user._id };
    if (req.query.unreadOnly === 'true') {
      query.isRead = false;
    }
    
    // Support filtering by multiple types (e.g. types=SYSTEM,COMMENT)
    if (req.query.types) {
      const typesArray = req.query.types.split(',');
      query.type = { $in: typesArray };
    }
    
    // Support search by title or message
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { message: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({ 
      success: true, 
      data: notifications,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUnreadNotificationsCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
