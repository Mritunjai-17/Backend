const CrudRepository = require('./crud-repository');
const User = require('../models/User');

class UserRepository extends CrudRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      console.error("Something went wrong in the user repository: findByEmail");
      throw error;
    }
  }
}

module.exports = UserRepository;
