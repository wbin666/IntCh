/**
 * Created by alex on 8/26/16.
 */
(function(){
    'use strict';

    angular.module('booking')
        .controller('AvailTimeCandidateCtrl', AvailTimeCandidateCtrl);

    AvailTimeCandidateCtrl.$inject = ['bookingDataClient', 'firstPageData', '$routeParams', '$uibModal', '$log'];
    function AvailTimeCandidateCtrl(bookingDataClient, firstPageData, $routeParams, $uibModal, $log) {
        var vm = this;
        vm.items = ['item1', 'item2', 'item3'];

        console.log("$routeParam in AvailTimeCandidateCtrl is : " + JSON.stringify($routeParams));

        vm.candidateList = firstPageData; //declare an empty array
        // vm.pageno = 1; // initialize page no to 1
        // vm.total_count = 0;
        // vm.itemsPerPage = 10; //this could be a dynamic value from a drop down
        // vm.getData = function(pageno){ // This would fetch the data on page change.
        //     //In practice this should be in a factory.
        //     vm.candidateList = [];  $http.get("http://yourdomain/apiname/{itemsPerPage}/{pagenumber}").success(function(response){
        //         //ajax request to fetch data into vm.data
        //         vm.candidateList = response.data;  // data to be displayed on current page.
        //         vm.total_count = response.total_count; // total data count.
        //     });
        // };
        // vm.getData(vm.pageno); // Call the function to fetch initial data on page load.
        
        vm.bookSession = bookSession;
        
        function bookSession(){
                console.log('step into bookSession() method to open a modal ...');

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'booking/bookingConfirmationModalDialog.html',
                    controller: 'ModalInstanceCtrl',
                    controllerAs: 'bookingConfirmVm',
                    resolve: {
                        items: function () {
                            return vm.items;
                        }
                    }
                });

                console.log("open a modal in bookSession() method");

                modalInstance.result.then(function (selectedItem) {
                    vm.selected = selectedItem;
                    $log.info('selected item is' + selectedItem);
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                console.log('finished the booksession() method ... ');
        }
        
    }
})();