import Game from '../models/Game.js';
import { logSecurityEvent } from '../utils/securityLogger.js';

// @desc    Get all games
// @route   GET /api/games
// @access  Public
export const getGames = async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: games });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving games' });
  }
};

// @desc    Get single game
// @route   GET /api/games/:id
// @access  Public
export const getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }
    res.status(200).json({ success: true, data: game });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving game' });
  }
};

// @desc    Create new game
// @route   POST /api/games
// @access  Private/Admin
export const createGame = async (req, res) => {
  try {
    const game = await Game.create(req.body);
    
    if (req.user) {
      logSecurityEvent({
        eventType: 'GAME_CREATED',
        user: req.user.id,
        req,
        details: { gameId: game._id, title: game.title }
      });
    }

    res.status(201).json({ success: true, data: game });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error creating game' });
  }
};

// @desc    Update game
// @route   PUT /api/games/:id
// @access  Private/Admin
export const updateGame = async (req, res) => {
  try {
    let game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    game = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (req.user) {
      logSecurityEvent({
        eventType: 'GAME_UPDATED',
        user: req.user.id,
        req,
        details: { gameId: game._id, title: game.title }
      });
    }

    res.status(200).json({ success: true, data: game });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error updating game' });
  }
};

// @desc    Delete game
// @route   DELETE /api/games/:id
// @access  Private/Admin
export const deleteGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    await game.deleteOne();

    if (req.user) {
      logSecurityEvent({
        eventType: 'GAME_DELETED',
        user: req.user.id,
        req,
        details: { gameId: req.params.id, title: game.title }
      });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting game' });
  }
};
