const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const ds = require('./datastore');

const datastore = ds.datastore;

const BOAT = "Boat";

router.use(bodyParser.json());

/* ------------- Begin Boat Model Functions ------------- */

/* ------------- End Boat Model Functions ------------- */

/* ------------- Begin Boat Controller Functions ------------- */

/* ------------- End Boat Controller Functions ------------- */

module.exports = router;