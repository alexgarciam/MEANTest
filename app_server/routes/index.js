var express = require('express');
var router = express.Router();

//var ctrlMain = require('../controllers/main')
var ctrlLocations = require('../controllers/locations');
var ctrlOthers = require('../controllers/others');
var ctrlLocationPromises = require('../controllers/promises');

/* GET home page. */
//router.get('/', ctrlMain.index );

/* Locations pages */

//estas dos hacen lo mismo pero una usa la api fetch y la otra un request
//router.get('/', ctrlLocationPromises.homelist);
//router.get('/', ctrlLocations.homelist);
router.get('/', ctrlOthers.angularApp);

router.get('/location/:locationid', ctrlLocations.locationInfo);
router.get('/location/:locationid/review/new', ctrlLocations.addReview);
router.post('/location/:locationid/review/new', ctrlLocations.saveReview);

/* Other pages */
router.get('/about', ctrlOthers.about);
module.exports = router;
