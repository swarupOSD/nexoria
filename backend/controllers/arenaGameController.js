import asyncHandler from 'express-async-handler';
import ArenaGame from '../models/ArenaGame.js';
import logger from '../middlewares/logger.js';

// @desc    Get all active Arena Games
// @route   GET /api/arena-games
// @access  Public
export const getActiveArenaGames = asyncHandler(async (req, res) => {
  const games = await ArenaGame.find({ isActive: true }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: games.length, data: games });
});

// @desc    Get all Arena Games (including inactive)
// @route   GET /api/arena-games/admin
// @access  Private/Admin
export const getAdminArenaGames = asyncHandler(async (req, res) => {
  const games = await ArenaGame.find({}).sort({ createdAt: -1 }).populate('createdBy', 'name email');
  res.status(200).json({ success: true, count: games.length, data: games });
});

// @desc    Add a new Arena Game
// @route   POST /api/arena-games
// @access  Private/Admin
export const addArenaGame = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user._id;

  const game = await ArenaGame.create(req.body);

  res.status(201).json({ success: true, data: game });
});

// @desc    Update Arena Game
// @route   PUT /api/arena-games/:id
// @access  Private/Admin
export const updateArenaGame = asyncHandler(async (req, res) => {
  let game = await ArenaGame.findById(req.params.id);

  if (!game) {
    res.status(404);
    throw new Error('Arena Game not found');
  }

  game = await ArenaGame.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: game });
});

// @desc    Delete Arena Game
// @route   DELETE /api/arena-games/:id
// @access  Private/Admin
export const deleteArenaGame = asyncHandler(async (req, res) => {
  const game = await ArenaGame.findById(req.params.id);

  if (!game) {
    res.status(404);
    throw new Error('Arena Game not found');
  }

  await game.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
