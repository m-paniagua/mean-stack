(function() {
    angular
        .module('loc8rApp')
        .controller('locationDetailCtrl', locationDetailCtrl);
        
        locationDetailCtrl.$inject = ['$routeParams', '$modal', 'loc8rData'];
        function locationDetailCtrl($routeParams, $modal, loc8rData) {
            var vm = this;
            vm.locationid = $routeParams.locationid;
            
            loc8rData.locationById(vm.locationid)
                .then(function (data) {
                    // console.log('this is the data: ' + data.data);
                    vm.data = { location: data.data};
                    vm.pageHeader = {
                        title: vm.data.location.name
                        // title: "should be title"
                    };
                    }, function (e) {
                    console.log(e);
                    });
                    
                vm.popupReviewForm = function () {
                    // alert("Let's add a review!");
                    var modalInstance = $modal.open({
                        templateUrl: '/reviewModal/reviewModal.view.html',
                        controller: 'reviewModalCtrl as vm',
                        resolve: {
                            locationData : function() {
                                return {
                                    locationid : vm.locationid,
                                    locationName : vm.data.location.name
                                };
                            }
                        }
                    });
                    
                    modalInstance.result.then(function (data) {
                        vm.data.location.reviews.push(data.data);
                    });
                };
            
            /*vm.pageHeader = {
                // title: 'Location detail page'
                title: vm.locationid
            };*/
        }
}) ();