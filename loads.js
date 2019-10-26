const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const ds = require('./datastore');

const datastore = ds.datastore;

const LOAD = "Load";

router.use(bodyParser.json());

/* ------------- Begin Load Model Functions ------------- */

/* ------------- End Load Model Functions ------------- */

/* ------------- Begin Load Controller Functions ------------- */

/* ------------- End Load Controller Functions ------------- */

module.exports = router;