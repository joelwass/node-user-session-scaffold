const jwt = require('jsonwebtoken');
const moment = require('moment');
const uuidV4 = require('uuid/v4');

module.exports = {
  generateJWT: ({ secret }) => jwt.sign({
    id: uuidV4(), // This will become the cart ID
    previousTimestamp: moment(),
    timestamp: moment() // Add a timestamp so we can track poll attempts
  }, secret, { expiresIn: '7d' })
};
