const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
  //   res.render('main.ejs');
  res.sendFile(path.join(__dirname, '..', 'Views', 'main.html'));
});

module.exports = router;
