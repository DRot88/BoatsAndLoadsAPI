const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const ds = require('./datastore');

const datastore = ds.datastore;

const LOAD = "Load";

router.use(bodyParser.json());

/* ------------- Begin Load Model Functions ------------- */

// CREATE A LOAD

function post_load(weight, content, delivery_date){
  var key = datastore.key(LOAD);
  const new_load = {"weight": weight, "content": content, "delivery_date": delivery_date, "carrier": null};
  return datastore.save({"key":key, "data":new_load}).then(() => {return key});
}

// VIEW A LOAD

function get_load(load_id){
  const key = datastore.key([LOAD, parseInt(load_id)]);
  return datastore.get(key).then( (entity) => {
      if (entity[0] === undefined) {
        return '';
      }
      return entity.map(ds.fromDatastore)[0];
  });
}

// VIEW ALL LOADS

function get_all_loads(req){
  var q = datastore.createQuery(LOAD).limit(3);
  const results = {};
  if(Object.keys(req.query).includes("cursor")){
      q = q.start(req.query.cursor);
  }
  return datastore.runQuery(q)
    .then( (entities) => {
      console.log("Entities: ", entities);
      results.loads = entities[0].map(ds.fromDatastore);
      if(entities[1].moreResults !== ds.Datastore.NO_MORE_RESULTS ){
        results.next = req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + entities[1].endCursor;
      }
    return results;
  });
}

// DELETE A LOAD

function delete_load(load_id){
  const key = datastore.key([LOAD, parseInt(load_id,10)]);
  return datastore.delete(key);
}


/* ------------- End Load Model Functions ------------- */

/* ------------- Begin Load Controller Functions ------------- */

// CREATE A LOAD

router.post('/', function(req, res){
  const fullUrl = `${req.protocol}://${req.get('host')}${req.url}loads/`;
  if (!req.body.weight || !req.body.content || !req.body.delivery_date) {
    res.status(400).json({ 
      "Error":  "The request object is missing at least one of the required attributes" 
    }); 
    return;
  }
  post_load(req.body.weight, req.body.content, req.body.delivery_date, carrier = null)
  .then( key => {console.log("Key: ", key);
    res.status(201).json({ 
      "id":  key.id, 
      "weight": req.body.weight, 
      "content": req.body.content,
      "delivery_date": req.body.delivery_date,
      "carrier": carrier,
      "self": fullUrl + key.id
    })} 
  );
});

// VIEW A LOAD

router.get('/:load_id', function(req, res){
  const specificLoad = req.params.load_id; // gets the id of the load
  get_load(specificLoad)
  .then( (load) => {
    if (load) {
      // if(!load.carrier) {
      //   carrier = [];
      // }
      load.self = `${req.protocol}://${req.get('host')}/loads${req.url}`
      return res.status(200).json(load);
    }
    return res.status(404).json({"Error": "No load with this load_id exists"});
  })
});

// VIEW ALL LOADS

router.get('/', function(req, res){
  get_all_loads(req)
	.then( (loads) => {
        res.status(200).json(loads);
    });
});

// DELETE A LOAD

router.delete('/:load_id', function(req, res){
  get_load(req.params.load_id)
  .then((load) => {
    // console.log("Boat in Delete: ", boat);
    if(load === '') {
      return res.status(404).json({"Error": "No load with this load_id exists"});
    } else {
      delete_load(req.params.load_id).then(res.status(204).end())
    }
  });
});

/* ------------- End Load Controller Functions ------------- */

module.exports = router;