angular.module('loc8rApp', []);

var locationListCtrl = function($scope, loc8rData, geolocation) {
    $scope.message = "Checking your location";
    
    $scope.getData = function(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        $scope.message = "Searching for nearby locations";
        loc8rData.locationByCoords(lat, lng)
        .then(function (data) {
            $scope.message = data.data.length > 0 ? "" : "No locations found";
            $scope.data = data.data;
            console.log(data);
        }, function(e) {
            //some error
            $scope.message = "Sorry, something's gone wrong ";
            console.log(e);
        });
    }
    
    $scope.showError = function(error) {
        $scope.$apply(function() {
            $scope.message = error.message;
        });
    };
    
    $scope.noGeo = function() {
        $scope.$apply(function() {
            $scope.message = "Geolocation not supported by this browser.";
        });
    };
    
    geolocation.getPosition($scope.getData, $scope.showError, $scope.noGeo);
};

var _isNumeric = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};
// custom angular filter
var formatDistance = function() {
    return function (distance) {
        var numDistance, unit;
        if(distance && _isNumeric(distance)) {
            if(distance > 1) {
                // round km to 1 decimal place
                numDistance = parseFloat(distance).toFixed(1);
                unit = 'km';
            } else {
                // if less than 1 km, display as meters
                numDistance = parseInt(distance * 1000, 10);
                unit ='m';
            }
            return numDistance + unit;
        } else {
            return '?';
        }
    };
};

var ratingStars = function() {
    return {
        scope: {thisRating: '=rating'},
        templateUrl: '/angular/rating-stars.html'
    };
};

/*var loc8rData = function($http) {
    return $http.get('/api/locations?lng=-118.457197&lat=34.264995&maxDistance=20');
};*/

var loc8rData = function ($http) {
    var locationByCoords = function (lat, lng) {
        return $http.get('/api/locations?lng=' + lng + '&lat=' + lat + '&maxDistance=15');
    };
    return {
        locationByCoords : locationByCoords
    };
};

var geolocation = function() {
    var getPosition = function(cbSuccess, cbError, cbNoGeo) {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
        } else {
            cbNoGeo();
        }
    };
    return {
        getPosition : getPosition
    };
};

// attach controller to angular app
angular
    .module('loc8rApp')
    .controller('locationListCtrl', locationListCtrl)
    .filter('formatDistance', formatDistance)
    .directive('ratingStars', ratingStars)
    .service('loc8rData', loc8rData)
    .service('geolocation', geolocation);