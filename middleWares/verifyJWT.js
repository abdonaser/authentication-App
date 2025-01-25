const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  // Retrieve the Authorization header from the request
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // Validate if the Authorization header exists and starts with 'Bearer '
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message:
        'Authorization header is missing or improperly formatted. Access denied.',
    });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(' ')[1];

  // Verify the token using the secret key
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      // Determine the specific error type for better feedback
      const errorMessage =
        err.name === 'TokenExpiredError'
          ? 'Your session has expired. Please log in again.'
          : 'The provided token is invalid or tampered with. Access forbidden.';
      return res.status(403).json({
        status: 'error',
        message: errorMessage,
      });
    }

    // Attach user details from the decoded token to the request object
    req.user = {
      id: decoded.UserInfo.id,
      roles: decoded.UserInfo.roles, // Optional: Add roles or other payload details if available
    };

    // Proceed to the next middleware or route handler
    next();
  });
};

module.exports = verifyJWT;
