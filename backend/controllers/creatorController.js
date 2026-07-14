import UserActivity from '../models/UserActivity.js';
import User from '../models/User.js';
import SiteSettings from '../models/SiteSettings.js';
import mongoose from 'mongoose';
import { getIO } from '../config/socket.js';

// @desc    Get God's Eye Audit logs
// @route   GET /api/creator/audit
// @access  Private/Owner
export const getAuditLogs = async (req, res) => {
  try {
    const activities = await UserActivity.find()
      .populate('user', 'name email role profileImage')
      .sort('-createdAt')
      .limit(500);

    const adminActivities = activities.filter(a => 
      a.user && (a.user.role === 'admin' || a.user.role === 'superadmin')
    );

    res.status(200).json({ success: true, count: adminActivities.length, data: adminActivities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Aura God Mode
// @route   PUT /api/creator/god-mode/:userId
// @access  Private/Owner
export const updateAuraGodMode = async (req, res) => {
  try {
    const { aura, auraRank, rewardPoints, isPremium } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (aura !== undefined) user.aura = aura;
    if (auraRank !== undefined) user.auraRank = auraRank;
    if (rewardPoints !== undefined) user.rewardPoints = rewardPoints;
    if (isPremium !== undefined) user.isPremium = isPremium;

    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Database Backup
// @route   GET /api/creator/backup
// @access  Private/Owner
export const databaseBackup = async (req, res) => {
  try {
    const users = await mongoose.connection.db.collection('users').find().toArray();
    const posts = await mongoose.connection.db.collection('posts').find().toArray();
    const settings = await mongoose.connection.db.collection('sitesettings').find().toArray();

    const backupData = {
      timestamp: new Date().toISOString(),
      collections: {
        users,
        posts,
        settings
      }
    };

    res.setHeader('Content-disposition', 'attachment; filename=nexoria_backup.json');
    res.setHeader('Content-type', 'application/json');
    res.status(200).send(JSON.stringify(backupData));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Database Wipe (Specific Collections)
// @route   DELETE /api/creator/wipe
// @access  Private/Owner
export const databaseWipe = async (req, res) => {
  try {
    const { collections } = req.body; 
    
    if (!collections || !Array.isArray(collections)) {
      return res.status(400).json({ success: false, message: 'Please provide collections to wipe.' });
    }

    const safeToWipe = ['chatmessages', 'useractivities', 'notifications', 'adblocklogs', 'securitylogs'];
    const wiped = [];

    for (const coll of collections) {
      if (safeToWipe.includes(coll)) {
        await mongoose.connection.db.collection(coll).deleteMany({});
        wiped.push(coll);
      }
    }

    res.status(200).json({ success: true, message: `Wiped collections: ${wiped.join(', ')}`, wiped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Branding Override & Maintenance
// @route   PUT /api/creator/branding
// @access  Private/Owner
export const overrideBranding = async (req, res) => {
  try {
    const { primaryColor, theme, logo, maintenanceMode } = req.body;
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      settings = new SiteSettings();
    }

    if (primaryColor) {
      if (!settings.uiTheme) settings.uiTheme = {};
      settings.uiTheme.primaryColor = primaryColor;
    }
    if (theme !== undefined) settings.theme = theme;
    if (logo !== undefined) settings.logo = logo;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;

    await settings.save();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Global System Broadcast
// @route   POST /api/creator/broadcast
// @access  Private/Owner
export const systemBroadcast = async (req, res) => {
  try {
    const { title, message, type = 'info' } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const io = getIO();
    io.emit('systemBroadcast', {
      title: title || 'SYSTEM ALERT',
      message,
      type,
      timestamp: new Date()
    });

    res.status(200).json({ success: true, message: 'Broadcast sent globally' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
