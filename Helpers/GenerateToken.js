const jwt = require('jsonwebtoken');

const accessTokenGenerated = (userData) => {
  const userTokenInfo = {
    UserInfo: {
      id: userData._id,
    },
  };
  return jwt.sign(userTokenInfo, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 18,
  });
};

const refreshTokenGenerated = (userData) => {
  const userTokenInfo = {
    UserInfo: {
      id: userData._id,
    },
  };
  return jwt.sign(userTokenInfo, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
};

module.exports = { accessTokenGenerated, refreshTokenGenerated };
