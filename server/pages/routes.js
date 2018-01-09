const express = require('express');

const router = express.Router();
const { index, graphqlGet, graphqlPost } = require('./controllers');

router.get('/', index);

module.exports = router;
