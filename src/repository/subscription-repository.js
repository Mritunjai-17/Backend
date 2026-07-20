const Subscription = require('../models/Subscription');

class SubscriptionRepository {
  async create(data) {
    try {
      const subscription = await Subscription.create(data);
      return subscription;
    } catch (error) {
      console.error("Error creating subscription in repository:", error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      return await Subscription.findOne({ email: email.toLowerCase(), isDeleted: false });
    } catch (error) {
      console.error("Error finding subscription by email in repository:", error);
      throw error;
    }
  }

  async getAllSubscriptions(filter = {}, skip = 0, limit = 10) {
    try {
      const data = await Subscription.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Subscription.countDocuments(filter);
      return { data, total };
    } catch (error) {
      console.error("Error fetching subscriptions in repository:", error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const updatedSubscription = await Subscription.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      return updatedSubscription;
    } catch (error) {
      console.error("Error updating subscription in repository:", error);
      throw error;
    }
  }
}

module.exports = SubscriptionRepository;
