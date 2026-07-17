const Contact = require('../models/Contact');
const CrudRepository = require('./crud-repository');

class ContactRepository extends CrudRepository {
  constructor() {
    super(Contact);
  }
}

module.exports = ContactRepository;
