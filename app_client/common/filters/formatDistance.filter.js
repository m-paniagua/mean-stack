(function () {
    angular
        .module('loc8rApp')
        .filter('formatDistance', formatDistance);
        
    var _isNumeric = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };
    
    // custom angular filter
    function formatDistance() {
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
    }
})();