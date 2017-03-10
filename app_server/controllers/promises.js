var fetch= require('node-fetch'); 

//metodo de test
module.exports.homelist = function (req, res) {

    fetch('http://localhost:3000/api/locations?lng=-0.9690884&lat=51.455041')
    .then(function(response){
        if(response.ok){
            return response.json();
        }else{
            return Promise.reject(new Error(response.statusText));
        }
    })
    .then(function(json){
        console.log(json);
        var i, data;
        data = json;        
        for (i=0; i<data.length; i++) {
            data[i].distance = _formatDistance(data[i].distance);
        }                    
        renderHomePage(req, res, data);
    }).catch(function(err){
       renderHomePage(req, res, err);
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

var renderHomePage = function(req,res, responseBody){
    console.log("pintando....");
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