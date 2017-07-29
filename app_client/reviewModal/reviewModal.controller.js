(function () {
    angular
        .module('loc8rApp')
        .controller('reviewModalCtrl', reviewModalCtrl);
    reviewModalCtrl.$inject = ['$modalInstance', 'locationData'];
    // reviewModalCtrl.$inject = ['$uibModalInstance'];
    function reviewModalCtrl ($modalInstance, locationData) {
    // function reviewModalCtrl ($uibModalInstance) {
        var vm = this;
        vm.locationData = locationData;
        vm.modal = {
            cancel : function () {
            $modalInstance.dismiss('cancel');
            // $uibModalInstance.dismiss('cancel');
            }
        };
    }
})();