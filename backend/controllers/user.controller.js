const User = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/password.util');

// GET /api/users/me
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  res.json({ user });
};

// PATCH /api/users/me
exports.updateProfile = async (req, res) => {
  const { name, email, mobile } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email, mobile },
    { new: true }
  ).select('-passwordHash');

  res.json({ user });
};

// PATCH /api/users/me/password
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);

  const ok = await comparePassword(oldPassword, user.passwordHash);
  if (!ok) {
    return res.status(400).json({ message: 'Incorrect current password' });
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  res.json({ message: 'Password updated successfully' });
};
