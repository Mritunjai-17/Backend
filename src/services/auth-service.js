const UserRepository = require('../repository/user-repository');

class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async registerUser(data) {
    try {
      const user = await this.userRepository.create(data);
      return user;
    } catch (error) {
      console.error("Something went wrong in the auth service: registerUser");
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await this.userRepository.findByEmail(email);
      return user;
    } catch (error) {
      console.error("Something went wrong in the auth service: getUserByEmail");
      throw error;
    }
  }
}

module.exports = AuthService;
