import Post from '../models/Post.js';
import Movie from '../models/Movie.js';
import User from '../models/User.js';

// @desc    Get all trashed items
// @route   GET /api/admin/trash
// @access  Private/Admin
export const getTrashItems = async (req, res) => {
  try {
    const { type = 'all', page = 1, limit = 20 } = req.query;
    
    let items = [];
    
    if (type === 'all' || type === 'posts') {
      const trashedPosts = await Post.find({ isDeleted: true })
        .select('title slug isDeleted deletedAt createdAt appLogo')
        .lean();
      
      const mappedPosts = trashedPosts.map(p => ({
        ...p,
        itemType: 'post',
        image: p.appLogo
      }));
      items = [...items, ...mappedPosts];
    }
    
    if (type === 'all' || type === 'movies') {
      const trashedMovies = await Movie.find({ isDeleted: true })
        .select('title slug isDeleted deletedAt createdAt posterImage')
        .lean();
        
      const mappedMovies = trashedMovies.map(m => ({
        ...m,
        itemType: 'movie',
        image: m.posterImage
      }));
      items = [...items, ...mappedMovies];
    }
    
    if (type === 'all' || type === 'users') {
      const trashedUsers = await User.find({ status: 'deleted' })
        .select('name username email status createdAt profileImage actionDate')
        .lean();
        
      const mappedUsers = trashedUsers.map(u => ({
        _id: u._id,
        title: u.name,
        slug: u.username,
        isDeleted: true,
        deletedAt: u.actionDate || u.updatedAt,
        createdAt: u.createdAt,
        itemType: 'user',
        image: u.profileImage
      }));
      items = [...items, ...mappedUsers];
    }
    
    // Sort by deletedAt descending
    items.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedItems = items.slice(startIndex, endIndex);

    res.status(200).json({ 
      success: true, 
      data: paginatedItems,
      pagination: {
        total: items.length,
        page: parseInt(page),
        pages: Math.ceil(items.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore trashed item
// @route   PUT /api/admin/trash/:type/:id/restore
// @access  Private/Admin
export const restoreItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    
    if (type === 'post') {
      await Post.findByIdAndUpdate(id, { isDeleted: false, deletedAt: null });
    } else if (type === 'movie') {
      await Movie.findByIdAndUpdate(id, { isDeleted: false, deletedAt: null });
    } else if (type === 'user') {
      await User.findByIdAndUpdate(id, { status: 'active', actionDate: null });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid item type' });
    }
    
    res.status(200).json({ success: true, message: 'Item restored successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Permanently delete item
// @route   DELETE /api/admin/trash/:type/:id
// @access  Private/SuperAdmin
export const permanentlyDeleteItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    
    if (type === 'post') {
      await Post.findByIdAndDelete(id);
    } else if (type === 'movie') {
      await Movie.findByIdAndDelete(id);
    } else if (type === 'user') {
      await User.findByIdAndDelete(id);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid item type' });
    }
    
    res.status(200).json({ success: true, message: 'Item permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Empty Trash
// @route   DELETE /api/admin/trash/empty
// @access  Private/SuperAdmin
export const emptyTrash = async (req, res) => {
  try {
    await Post.deleteMany({ isDeleted: true });
    await Movie.deleteMany({ isDeleted: true });
    await User.deleteMany({ status: 'deleted' });
    
    res.status(200).json({ success: true, message: 'Trash emptied completely' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
