var  mongoose = require('mongoose');
var request = require('request')
require('../models/locations.js');
var Loc = mongoose.model('Location');

//variable de entorno para cambiar la url de la API entre development y producción
var apiOptions = {
server : "http://localhost:3000"
};
if (process.env.NODE_ENV === 'production') {
	apiOptions.server = "https://getting-mean-loc8r.herokuapp.com";
}

//metodo genérico para encapsular la respuesta
var sendJSONresponse = function(res, status, content) {
	res.status(status); 
	res.json(content);
};


var theEarth = (function(){
	var earthRadius = 6371; // km, miles is 3959
	var getDistanceFromRads = function(rads) {
		return parseFloat(rads * earthRadius);
	};
	var getRadsFromDistance = function(distance) {
		return parseFloat(distance / earthRadius);
	};
	return {
		getDistanceFromRads : getDistanceFromRads,
		getRadsFromDistance : getRadsFromDistance	
	};
})();

module.exports.locationsListByDistance = function(req, res) {
	var lng = parseFloat(req.query.lng);
	var lat = parseFloat(req.query.lat);
	var point = {
	type: "Point",
		coordinates: [lng, lat]
	};
	
	var geoOptions = {
		spherical: true,
		maxDistance: theEarth.getRadsFromDistance(20),
		num: 10
	};

	  if (!lng || !lat ) {
	    console.log('locationsListByDistance missing params');
	    sendJSONresponse(res, 404, {"message": "lng, lat and maxDistance query parameters are all required"});
	    return;
	  }

	Loc.geoNear(point, geoOptions, function (err, results, stats) {
		var locations = [];
		results.forEach(function(doc) {
			locations.push({
				distance: theEarth.getDistanceFromRads(doc.dis),
				name: doc.obj.name,
				address: doc.obj.address,
				rating: doc.obj.rating,
				facilities: doc.obj.facilities,
				_id: doc.obj._id
			});
		});
		sendJSONresponse(res, 200, locations);
	});
};

//metodo de test
module.exports.locationsCreate = function (req, res) {
	sendJSONresponse(res, 200, {"status" : "success"});
};

//metodo que busca en la base de datos por locationid que viene en los parametros del req
module.exports.locationsReadOne = function(req, res) {
	if(req.params && req.params.locationid){
		console.log("buscando: "+req.params.locationid);
		Loc.findById(req.params.locationid).exec(function(err, location) {
			if(!location){
				sendJSONresponse(res, 404, {"message":"locationid not found"});
				return;
			}else if(err){
				sendJSONresponse(res, 404, err);
			}
			sendJSONresponse(res, 200, location);
			
			console.log("location: "+location);
		});
	}else{
		sendJSONresponse(res, 404, {"message":"no locationid in request"});
	}
};



module.exports.locationsCreate = function(req, res) {
	Loc.create({
		name: req.body.name,
		address: req.body.address,
		facilities: req.body.facilities.split(","),
		coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
		openingTimes: [{
			days: req.body.days1,
			opening: req.body.opening1,
			closing: req.body.closing1,
			closed: req.body.closed1,
		}, {
			days: req.body.days2,
			opening: req.body.opening2,
			closing: req.body.closing2,
			closed: req.body.closed2,
		}]
		}, 
		function(err, location) {
			if (err) {
				sendJSONresponse(res, 400, err);
			} else {
				sendJSONresponse(res, 201, location);
			}
	});
};

module.exports.locationsUpdateOne = function(req, res) {
	if (!req.params.locationid) {
		sendJSONresponse(res, 404, {"message": "Not found, locationid is required"});
		return;
	}
	Loc.findById(req.params.locationid).select('-reviews -rating').exec(function(err, location) {
		if (!location) {
			sendJSONresponse(res, 404, {"message": "locationid not found"});
			return;
		} else if (err) {
			sendJSONresponse(res, 400, err);
			return;
		}
		location.name = req.body.name;
		location.address = req.body.address;
		location.facilities = req.body.facilities.split(",");
		location.coords = [parseFloat(req.body.lng),parseFloat(req.body.lat)];
		location.openingTimes = [{
			days: req.body.days1,
			opening: req.body.opening1,
			closing: req.body.closing1,
			closed: req.body.closed1,
			}, {
			days: req.body.days2,
			opening: req.body.opening2,
			closing: req.body.closing2,
			closed: req.body.closed2,
		}];
		location.save(function(err, location) {
			if (err) {
				sendJSONresponse(res, 404, err);
			} else {
				sendJSONresponse(res, 200, location);
			}
		});
	});
};

module.exports.locationsDeleteOne = function(req, res) {
	var locationid = req.params.locationid;
	if (locationid) {
		Loc.findByIdAndRemove(locationid).exec(function(err, location) {
			if (err) {
				sendJSONresponse(res, 404, err);
				return;
			}
			sendJSONresponse(res, 204, null);
		});
	} else {
		sendJSONresponse(res, 404, {"message": "No locationid"});
	}
};