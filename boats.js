const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const ds = require('./datastore');

const datastore = ds.datastore;

const BOAT = "Boat";
const LOAD = "Load";

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

// VIEW ALL BOATS

function get_all_boats(req){
  var q = datastore.createQuery(BOAT).limit(3);
  const results = {};
  if(Object.keys(req.query).includes("cursor")){
      q = q.start(req.query.cursor);
  }
  return datastore.runQuery(q)
    .then( (entities) => {
      console.log("Entities: ", entities);
      // console.log("Entities[0]", entities[0]);
      // console.log("Entities[1]", entities[1]);
      // console.log("Entities[2]", entities[2]);
      results.boats = entities[0].map(ds.fromDatastore);
      if(entities[1].moreResults !== ds.Datastore.NO_MORE_RESULTS ){
        results.next = req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + entities[1].endCursor;
      }
    return results;
  });
}

// DELETE A BOAT

function delete_boat(boat_id){
  const key = datastore.key([BOAT, parseInt(boat_id,10)]);
  return datastore.delete(key);
}

// ADD LOAD TO BOAT

function put_load(boat_id, load_id){
  const boat_key = datastore.key([BOAT, parseInt(boat_id,10)]);
  return datastore.get(boat_key)
  .then( (boat) => {
      if( typeof(boat[0].loads) === 'undefined'){
        console.log("boat[0].loads: ", boat[0].loads)
          boat[0].loads = [];
      }
      boat[0].loads.push(load_id);
      return datastore.save({"key":boat_key, "data":boat[0]});
  });
}

// VIEW ALL LOADS ON BOAT

function get_boat_loads(req, boat_id){
  const key = datastore.key([BOAT, parseInt(boat_id,10)]);
  return datastore.get(key)
  .then( (boats) => {
      const boat = boats[0];
      const load_keys = boat.loads.map( (load_id) => {
          return datastore.key([LOAD, parseInt(load_id,10)]);
      });
      return datastore.get(load_keys);
  })
  .then((loads) => {
      loads = loads[0].map(ds.fromDatastore);
      return loads;
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

// VIEW ALL BOATS

// GET to get all boats
router.get('/', function(req, res){
  get_all_boats(req)
	.then( (boats) => {
        res.status(200).json(boats);
    });
});

// DELETE A BOAT

router.delete('/:boat_id', function(req, res){
  get_boat(req.params.boat_id)
  .then((boat) => {
    // console.log("Boat in Delete: ", boat);
    if(boat === '') {
      return res.status(404).json({"Error": "No boat with this boat_id exists"});
    } else {
      delete_boat(req.params.boat_id).then(res.status(204).end())
    }
  });
});

// ADD LOAD TO BOAT

router.put('/:boat_id/loads/:load_id', function(req, res){
  put_load(req.params.boat_id, req.params.load_id)
  .then(res.status(204).end());
});

// VIEW ALL LOADS ON BOAT

router.get('/:boat_id/loads', function(req, res){
  const boats = get_boat_loads(req, req.params.boat_id)
.then( (boats) => {
      res.status(200).json(boats);
  });
});

/* ------------- End Boat Controller Functions ------------- */

module.exports = router;  