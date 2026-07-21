const SubscriptionRepository = require("../repository/subscription-repository");

const {
  sendSubscriptionWelcomeEmail,
  sendSubscriptionAdminNotification,
} = require("./email-service");

class SubscriptionService {
  constructor() {
    this.subscriptionRepository = new SubscriptionRepository();
  }

  async createSubscription(data) {
    try {
      let subscriber;

      // Check if email already exists
      const existing = await this.subscriptionRepository.findByEmail(data.email);

      if (existing) {
        // Update existing subscriber
        subscriber = await this.subscriptionRepository.update(existing._id, {
          fullName: data.fullName || existing.fullName,
          domain: data.domain || existing.domain,
          status: "Active",
          isRead: false,
        });
      } else {
        // Create new subscriber
        subscriber = await this.subscriptionRepository.create(data);
      }

      // ==========================
      // Send Emails
      // ==========================
      await sendSubscriptionWelcomeEmail(subscriber);
      await sendSubscriptionAdminNotification(subscriber);

      return subscriber;
    } catch (error) {
      console.error(
        "Error in subscription service: createSubscription",
        error
      );
      throw error;
    }
  }

  async getSubscriptions(options = {}) {
    try {
      const page = Math.max(1, parseInt(options.page) || 1);
      const limit = Math.max(1, parseInt(options.limit) || 10);
      const skip = (page - 1) * limit;

      const filter = { isDeleted: false };

      if (options.status && options.status !== "All") {
        filter.status = options.status;
      }

      if (options.search) {
        const searchRegex = new RegExp(options.search.trim(), "i");

        filter.$or = [
          { fullName: searchRegex },
          { email: searchRegex },
          { domain: searchRegex },
        ];
      }

      const { data, total } =
        await this.subscriptionRepository.getAllSubscriptions(
          filter,
          skip,
          limit
        );

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        totalPages,
        currentPage: page,
        limit,
      };
    } catch (error) {
      console.error(
        "Error in subscription service: getSubscriptions",
        error
      );
      throw error;
    }
  }

  async updateSubscription(id, updateData) {
    try {
      return await this.subscriptionRepository.update(id, updateData);
    } catch (error) {
      console.error(
        "Error in subscription service: updateSubscription",
        error
      );
      throw error;
    }
  }

  async softDeleteSubscription(id) {
    try {
      return await this.subscriptionRepository.update(id, {
        isDeleted: true,
      });
    } catch (error) {
      console.error(
        "Error in subscription service: softDeleteSubscription",
        error
      );
      throw error;
    }
  }
}

module.exports = SubscriptionService;