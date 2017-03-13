var request = require('request')
//variable de entorno para cambiar la url de la API entre development y producción
var apiOptions = {
server : "http://localhost:3000"
};
if (process.env.NODE_ENV === 'production') {
    apiOptions.server = "https://getting-mean-loc8r.herokuapp.com";
}

var mongoose=require('mongoose');


/* GET 'home' page */
module.exports.homelist = function (req, res){
    var requestOptions, path;
    path = '/api/locations';


    requestOptions = {
        url : apiOptions.server + path,
        method : "GET",
        json : {},
        qs : {
            lng : -0.9690884002,
            lat : 51.455041023,
            maxDistance : 20
        }
    };

    request(requestOptions, function(err, response, body) {
        var i, data;
        data = body;
        console.log("response: "+response.statusCode)
        if(response.statusCode==200 && data.length){
            for (i=0; i<data.length; i++) {
                data[i].distance = _formatDistance(data[i].distance);
            }    
        }        
        renderHomePage(req, res, data);
    });
};

var _formatDistance = function (distance) {
    var numDistance, unit;
    if (distance > 1) {
        numDistance = parseFloat(distance).toFixed(1);
        unit = 'km';
    } else {
        numDistance = parseInt(distance * 1000,10);
        unit = 'm';
    }
    return numDistance + unit;
};


var getLocationInfo = function (req, res, callback) {
    var requestOptions, path;
    path = "/api/locations/" + req.params.locationid;
    requestOptions = {
        url : apiOptions.server + path,
        method : "GET",
        json : {}
    };
    request(requestOptions, function(err, response, body) {
        var data = body;
        if (response.statusCode === 200) {
            data.coords = {
                lng : body.coords[0],
                lat : body.coords[1]
            };
            callback(req, res, data);
        } else {
            _showError(req, res, response.statusCode);
        }
    });
};


/* GET location info page */
module.exports.locationInfo = function(req, res){
    getLocationInfo(req, res, function(req, res, responseData) {
        renderDetailPage(req, res, responseData);
    });
};

var renderReviewForm = function (req, res, locDetail) {
    res.render('location-review-form', {
        title: 'Review ' + locDetail.name + ' on Loc8r',
        pageHeader: { title: 'Review '+locDetail.name  },
        error: req.query.err
    });
};

/* GET add review page */
module.exports.addReview = function(req, res){
    getLocationInfo(req, res, function(req, res, responseData) {
        renderReviewForm(req, res, responseData);
    });
};


/* POST add review page */
module.exports.saveReview = function(req, res){
   
    var requestOptions, path, locationid, postdata;
    locationid = req.params.locationid;
    path = "/api/locations/" + locationid + '/reviews';
    postdata = {
        author: req.body.name,
        rating: parseInt(req.body.rating, 10),
        reviewText: req.body.review
    };
    requestOptions = {
        url : apiOptions.server + path,
        method : "POST",
        json : postdata
    };
    if (!postdata.author || !postdata.rating || !postdata.reviewText) {
        res.redirect('/location/' + locationid + '/review/new?err=val');
    } else {
        request(requestOptions, function(err, response, body) {
            if (response.statusCode === 201) {
                console.log("review guardada! redireccionando");
                res.redirect('/location/' + locationid);
            } else if (response.statusCode === 400 && body.name && body.name === "ValidationError" ) {
                res.redirect('/location/' + locationid + '/review/new?err=val');
            } else {
                _showError(req, res, response.statusCode);
            }
        });
    }
    
};


var _showError = function (req, res, status) {
    var title, content;
    if (status === 404) {
        title = "404, page not found";
        content = "Oh dear. Looks like we can't find this page. Sorry.";
    } else {
        title = status + ", something's gone wrong";
        content = "Something, somewhere, has gone just a little bit wrong.";
    }
    res.status(status);
    res.render('generic-text', {
        title : title,
        content : content
    });
};

module.exports.doAddReview = function(req, res){

};


/******************
*                 *
*   Renderings    *
*                 *
******************/

var renderHomePage = function(req,res, responseBody){
    var message;
    if(!(responseBody instanceof Array)){
        message = "API lookup error";
        responseBody = [];
    } else {
        if(!responseBody.length) {
            message = "No places found nearby";
        }
    }

    res.render('locations-list',{
        title:'Home',
        pageHeader:{
            title:'loc8r',
            strapline:'Find places to work with twifi near you!"'
        },
        sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for.",
        locations: responseBody,
        message: message
    });
};

var renderDetailPage = function (req, res, locDetail) {
    console.log("locDetail: "+locDetail.name);
    res.render('location-info', {
    title: locDetail.name,
    pageHeader: {title: locDetail.name},
    sidebar: {
        context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.', 
        callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
    },
    location: locDetail
    });
};