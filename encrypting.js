var crypto = require('crypto');

var methods = {
  getSalt: function(length) {
    return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length);
  },
  sha512: function(password, salt) {
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return {
      salt:salt,
      passwordHash:value
    };
  },
  saltHashPassword: function(password) {
    var salt = methods.getSalt(16);
    var passwordData = methods.sha512(password, salt);
    return {
      hash:passwordData.passwordHash,
      salt:passwordData.salt
    }
  }
};

module.exports = methods