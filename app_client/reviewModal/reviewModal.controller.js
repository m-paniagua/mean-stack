(function () {
    angular
        .module('loc8rApp')
        .controller('reviewModalCtrl', reviewModalCtrl);
        
    reviewModalCtrl.$inject = ['$modalInstance', 'loc8rData', 'locationData'];
    // reviewModalCtrl.$inject = ['$uibModalInstance'];
    function reviewModalCtrl ($modalInstance, loc8rData, locationData) {
    // function reviewModalCtrl ($uibModalInstance) {
        var vm = this;
        vm.locationData = locationData;
        vm.formData = {};
        
        vm.onSubmit = function () {
          vm.formError = "";
          if (!vm.formData.name || !vm.formData.rating || !vm.formData.reviewText) {
            vm.formError = "All fields required, please try again";
            return false;
          } else {
            vm.doAddReview(vm.locationData.locationid, vm.formData);
          }
        };
        
        vm.doAddReview = function (locationid, formData) {
            loc8rData.addReviewById(locationid, {
                author : formData.name,
                rating : formData.rating,
                reviewText : formData.reviewText
            })
            .then(function (data) {
                // console.log(data.data);
                vm.modal.close(data);
            }, function (data) {
                vm.formError = "Your review has not been saved, try again";
            });
            
            return false;
        };
        
        vm.modal = {
            close : function (result) {
                $modalInstance.close(result);
            },
            cancel : function () {
                $modalInstance.dismiss('cancel');
            // $uibModalInstance.dismiss('cancel');
            }
        };
    }
})();