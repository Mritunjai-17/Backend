const User = require('../models/User');

/**
 * @desc    Get all registered administrators with optional search and filter
 * @route   GET /api/admin/users
 * @access  Private (Approved Admin only)
 */
exports.getAllUsers = async (req, res) => {
  const { search, filter } = req.query;

  try {
    const query = {};

    // 1. Apply Search (Name or Email)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    // 2. Apply Status Filter
    if (filter && filter !== 'All') {
      query.status = filter;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (err) {
    console.error('Error in adminController: getAllUsers', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve administrators.'
    });
  }
};

/**
 * @desc    Approve administrator
 * @route   PATCH /api/admin/users/:id/approve
 * @access  Private (Approved Admin only)
 */
exports.approveUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(444).json({
        success: false,
        error: 'Administrator not found.'
      });
    }

    user.isApproved = true;
    user.status = 'Approved';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Administrator approved successfully.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Error in adminController: approveUser', err);
    res.status(500).json({
      success: false,
      error: 'Failed to approve administrator.'
    });
  }
};

/**
 * @desc    Reject administrator
 * @route   PATCH /api/admin/users/:id/reject
 * @access  Private (Approved Admin only)
 */
exports.rejectUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(444).json({
        success: false,
        error: 'Administrator not found.'
      });
    }

    user.isApproved = false;
    user.status = 'Rejected';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Administrator rejected successfully.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Error in adminController: rejectUser', err);
    res.status(500).json({
      success: false,
      error: 'Failed to reject administrator.'
    });
  }
};

/**
 * @desc    Delete administrator
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Approved Admin only)
 */
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(444).json({
        success: false,
        error: 'Administrator not found.'
      });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own administrator account.'
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Administrator deleted successfully.'
    });
  } catch (err) {
    console.error('Error in adminController: deleteUser', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete administrator.'
    });
  }
};
