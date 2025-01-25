const usersModel = require('../Models/userModel');
const getAllUsers = async (req, res) => {
  // console.log(req.user);//' { id: '67911e3c449e47c82566c8ed', roles: undefined }
  const allUsers = await usersModel.find({}).select('-password').lean();

  if (allUsers.length == 0)
    return res.status(400).json({ status: 'error', message: 'No Users Found' });

  return res.status(200).json({ status: 'success', data: allUsers });
};

module.exports = {
  getAllUsers,
};
