const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const ds = require('./datastore');

const datastore = ds.datastore;

const BOAT = "Boat";

router.use(bodyParser.json());

/* ------------- Begin Boat Model Functions ------------- */

// CREATE A BOAT
function post_boat(name, type, length){
  var key = datastore.key(BOAT);
  const new_boat = {"name": name, "type": type, "length": length};
  return datastore.save({"key":key, "data":new_boat}).then(() => {return key});
}

// VIEW A BOAT

function get_boat(boat_id){
  const key = datastore.key([BOAT, parseInt(boat_id)]);
  return datastore.get(key).then( (entity) => {
      if (entity[0] === undefined) {
        return '';
      }
      return entity.map(ds.fromDatastore)[0];
  });
}


/* ------------- End Boat Model Functions ------------- */

/* ------------- Begin Boat Controller Functions ------------- */

// CREATE A BOAT
router.post('/', function(req, res){
  // const fullUrl = req.protocol + '://' + req.get('host') + req.url;
  const fullUrl = `${req.protocol}://${req.get('host')}${req.url}boats/`;
  if (!req.body.name || !req.body.type || !req.body.length) {
    res.status(400).json({ 
      "Error":  "The request object is missing at least one of the required attributes" 
    }); 
    return;
  }
  post_boat(req.body.name, req.body.type, req.body.length)
  .then( key => {console.log("Key: ", key);
    res.status(201).json({ 
      "id":  key.id, 
      "name": req.body.name, 
      "type": req.body.type,
      "length": req.body.length,
      "loads": JSON.stringify([]),
      "self": fullUrl + key.id
    })} 
  );
});

// VIEW A BOAT

router.get('/:boat_id', function(req, res){
  const specificBoat = req.params.boat_id; // gets the id of the boat
  get_boat(specificBoat)
  .then( (boat) => {
    if (boat) {
      if(!boat.loads) {
        boat.loads = [];
      }
      boat.self = `${req.protocol}://${req.get('host')}/boats${req.url}`
      return res.status(200).json(boat);
    }
    return res.status(404).json({"Error": "No boat with this boat_id exists"});
  })
});

/* ------------- End Boat Controller Functions ------------- */

module.exports = router;