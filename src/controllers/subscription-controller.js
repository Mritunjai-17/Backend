const SubscriptionService = require('../services/subscription-service');

const subscriptionService = new SubscriptionService();

/**
 * Handle subscription request from frontend
 * @route POST /api/subscribe
 */
const create = async (req, res) => {
  try {
    const { fullName, email, domain } = req.body;

    if (!fullName || !email || !domain) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and service domain are required.'
      });
    }

    const response = await subscriptionService.createSubscription({
      fullName,
      email,
      domain
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for subscribing! We will tailor updates for your chosen domain.',
      data: response
    });
  } catch (error) {
    console.error('Error in subscription-controller: create', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while subscribing.',
      error: error.message
    });
  }
};

/**
 * Fetch subscribers list for CMS dashboard (paginated, searchable, status filtered)
 * @route GET /api/subscribe
 */
const getAll = async (req, res) => {
  try {
    const response = await subscriptionService.getSubscriptions(req.query);
    return res.status(200).json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error('Error in subscription-controller: getAll', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching subscribers.',
      error: error.message
    });
  }
};

/**
 * Update subscriber state (e.g., mark as read, change status)
 * @route PATCH /api/subscribe/:id
 */
const update = async (req, res) => {
  try {
    const response = await subscriptionService.updateSubscription(req.params.id, req.body);
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Subscription record not found.'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Subscription record updated successfully.',
      data: response
    });
  } catch (error) {
    console.error('Error in subscription-controller: update', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while updating subscription.',
      error: error.message
    });
  }
};

/**
 * Soft delete a subscription record
 * @route DELETE /api/subscribe/:id
 */
const deleteSubscription = async (req, res) => {
  try {
    const response = await subscriptionService.softDeleteSubscription(req.params.id);
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Subscription record not found.'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Subscription deleted successfully.'
    });
  } catch (error) {
    console.error('Error in subscription-controller: deleteSubscription', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while deleting subscription.',
      error: error.message
    });
  }
};

module.exports = {
  create,
  getAll,
  update,
  deleteSubscription
};
