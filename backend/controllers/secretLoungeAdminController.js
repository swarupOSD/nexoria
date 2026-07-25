import { getActiveSecretRooms, destroySecretRoom } from '../sockets/privateChat.js';

export const getAdminSecretRooms = async (req, res) => {
  try {
    const activeRooms = getActiveSecretRooms();
    
    // Calculate analytics
    const totalRooms = activeRooms.length;
    const totalUsers = activeRooms.reduce((acc, room) => acc + room.participants.size, 0);
    const activeThemes = {};
    
    // Transform Map into Array for JSON serialization
    const formattedRooms = activeRooms.map(room => {
      activeThemes[room.theme] = (activeThemes[room.theme] || 0) + 1;
      return {
        teamCode: room.teamCode,
        ownerId: room.ownerId,
        createdAt: room.createdAt,
        theme: room.theme,
        participants: Array.from(room.participants.values()),
        messageCount: room.messages ? room.messages.length : 0
      };
    });

    res.json({
      success: true,
      data: {
        analytics: {
          totalRooms,
          totalUsers,
          activeThemes
        },
        rooms: formattedRooms
      }
    });
  } catch (error) {
    console.error('Error fetching admin secret rooms:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteAdminSecretRoom = async (req, res) => {
  try {
    const { teamCode } = req.params;
    const io = req.app.get('io');
    
    const destroyed = destroySecretRoom(teamCode, io);
    if (!destroyed) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, message: 'Secret Room successfully destroyed.' });
  } catch (error) {
    console.error('Error deleting secret room:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
