const { readDb } = require('../db');

exports.getDenProgress = (req, res) => {
  try {
    const db = readDb();
    const user = db.users.find(u => u.id === req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      denLevel: user.denLevel || 'Gold',
      completedDens: user.completedDens !== undefined ? user.completedDens : 4,
      denProgress: user.denProgress !== undefined ? user.denProgress : 6,
      referredBy: user.referredBy || null,
      referredByName: user.referredByName || null
    });
  } catch (error) {
    console.error("Get Den Progress error:", error);
    return res.status(500).json({ message: 'Server error fetching Den Level progress' });
  }
};
