const router = require('express').Router();
const apiRoutes = require('./api');

router.use('/api', apiRoutes);

router.use((req, res) => {
  res.send("<h1>Wrong Route, plesae try again.</h1><h3>Available Routes: </h3><ul><li>/api/categories/</li><li>/api/products/</li><li>/api/tags/</li></ul>")
});

module.exports = router;