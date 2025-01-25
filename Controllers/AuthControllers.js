const bcryptjs = require('bcryptjs');
const usersModel = require('../Models/userModel');
const jwt = require('jsonwebtoken');
const {
  accessTokenGenerated,
  refreshTokenGenerated,
} = require('../Helpers/GenerateToken');

//#region register Controller
const register = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  //'validation
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'all fields are required',
    });
  }

  //' check if the  existanc{e of the email
  const userFound = await usersModel.findOne({ email });
  if (userFound) {
    return res.status(400).json({
      status: 'error',
      message: 'this email already exist',
    });
  }

  //' hashing the password

  const hashPassword = await bcryptjs.hash(password, 10);

  //   const newUser = new usersModel({
  //     first_name,
  //     last_name,
  //     email,
  //     password: hashPassword,
  //   });
  //   newUser.save();

  const userInfo = {
    first_name,
    last_name,
    email,
    password: hashPassword,
  };

  //' adding a new user to DB
  const newUser = await usersModel.create(userInfo);

  //'handleing the token (Access Token & Reresh Token)

  const accessToken = accessTokenGenerated(newUser);
  const refreshToken = refreshTokenGenerated(newUser);

  //   ' create cookies
  res.cookie('jwt', refreshToken, {
    httpOnly: true, //' accessable only by web servers
    secure: true, //'https only can access
    sameSite: 'None', //'Cross_Site Cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //' to match the expiration period of refreshToken Expiresin
  });

  res.json({
    status: 'success',
    data: {
      accessToken,
      email: newUser.email,
    },
  });
};
//#endregion

//#region Login Controller
const login = async (req, res) => {
  const { email, password } = req.body;

  //'validation
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'all fields are required',
    });
  }

  const userFound = await usersModel.findOne({ email }).exec();
  //' if email doesn't exist
  if (!userFound)
    return res.status(400).json({
      status: 'error',
      message: "this email doesn't exist please create new account ",
    });

  //' check password
  const passwordMatch = await bcryptjs.compare(password, userFound.password);

  if (!passwordMatch)
    return res
      .status(400)
      .json({ status: 'error', message: 'invalid email / password' });

  //'handling the token (Access Token & Reresh Token)
  const accessToken = accessTokenGenerated(userFound);
  const refreshToken = refreshTokenGenerated(userFound);

  //   ' create cookies
  res.cookie('jwt', refreshToken, {
    httpOnly: true, //' accessable only by web servers
    secure: true, //'https only can access
    sameSite: 'None', //'Cross_Site Cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //' to match the expiration period of refreshToken Expiresin
  });
  res.json({
    status: 'success',
    data: {
      accessToken,
      email: userFound.email,
    },
  });
};
//#endregion

//#region refresh Token
const refresh = async (req, res) => {
  // Extract cookies from the request
  const cookies = req.cookies;

  // Check if the JWT cookie exists; return Unauthorized (401) if missing
  if (!cookies?.jwt) {
    return res.status(401).json({
      status: 'error',
      message: 'Refresh token is missing. Unauthorized access.',
    });
  }

  // Get the refresh token from cookies
  const refreshToken = cookies.jwt;

  // Verify the refresh token using the secret key
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      // If verification fails, return Forbidden (403)
      if (err) {
        return res.status(403).json({
          status: 'error',
          message:
            'Invalid or expired refresh token. Access forbidden.  PLease log in ',
        });
      }

      try {
        // Find the user associated with the decoded token ID in the database
        const foundUser = await usersModel.findById(decoded.UserInfo.id).exec();

        // If no user is found, return Unauthorized (401)
        if (!foundUser) {
          return res.status(401).json({
            status: 'error',
            message: 'User not found. Unauthorized access.',
          });
        }

        // Generate a new access token with a 15-minute expiration
        const accessToken = accessTokenGenerated(foundUser);

        // Return the new access token to the client
        return res.status(200).json({
          status: 'success',
          message: 'New access token generated successfully.',
          accessToken,
        });
      } catch (error) {
        // Handle unexpected errors (e.g., database connection issues)
        console.error('Error refreshing token:', error);
        return res.status(500).json({
          status: 'error',
          message: 'An internal server error occurred.',
        });
      }
    }
  );
};

//#endregion

//#region Logout Function
const logout = (req, res) => {
  const cookies = req.cookies;

  // Check if the JWT cookie exists
  if (!cookies?.jwt) {
    return res.sendStatus(204); // No JWT cookie found; send a 204 No Content response
  }

  // Clear the JWT cookie with the specified options:
  res.clearCookie('jwt', {
    httpOnly: true, // - `httpOnly: true`: Prevents client-side scripts from accessing the cookie
    sameSite: 'None', // - `sameSite: 'None'`: Allows the cookie to be sent with cross-origin requests
    secure: true, // - `secure: true`: Ensures the cookie is only transmitted over HTTPS
  });

  // Send a 200 OK response with a success message
  res.status(200).json({
    status: 'success',
    message: 'User successfully logged out and cookies cleared.',
  });
};
//#endregion

//#endregion

module.exports = {
  register,
  login,
  refresh,
  logout,
};
