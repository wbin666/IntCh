/**
 * Created by alex on 8/26/16.
 */
(function(){
    'use strict';

    angular.module('booking')
        .controller('AvailTimeCandidateCtrl', AvailTimeCandidateCtrl);

    AvailTimeCandidateCtrl.$inject = ['bookingDataClient', 'firstPageData', '$routeParams', '$uibModal', '$location'];
    function AvailTimeCandidateCtrl(bookingDataClient, firstPageData, $routeParams, $uibModal, $location) {
        var vm = this;

        console.log("$routeParam in AvailTimeCandidateCtrl is : " + JSON.stringify($routeParams));
        vm.queryCriteria = $routeParams;

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
        
        function bookSession(selectedItem){
                console.log('step into bookSession() method to open a modal and the selected item ...' + JSON.stringify(selectedItem));

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'booking/bookingConfirmation.ModalDialog.html',
                    controller: 'ModalInstanceCtrl',
                    controllerAs: 'bookingConfirmVm',
                    resolve: {
                        selectedRecord: function () {
                            console.log("the passed item is " + JSON.stringify(selectedItem))
                            return selectedItem;
                        }
                    }
                });

                modalInstance.result.then(function (confirmedRecord) {
                    console.info('Modal confirmed result is : ' + JSON.stringify(confirmedRecord));

                    //Todo: then to book the record by updating database
                    
                    //Todo: then redirect to "bookedSessionDetail" view with cancel button or option
                    $location.url('bookedSessionDetail');
                }, function () {
                    console.info('Modal dismissed at: ' + new Date());
                });
        }
        
    }
})();