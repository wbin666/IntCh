/**
 * Created by alex on 8/26/16.
 */
(function(){
    'use strict';

    angular.module('booking')
        .controller('AvailTimeCandidateCtrl', AvailTimeCandidateCtrl);

    // AvailTimeCandidateCtrl.$inject = ['bookingDataClient', 'firstPageData', '$routeParams', '$uibModal', '$location'];
    // function AvailTimeCandidateCtrl(bookingDataClient, firstPageData, $routeParams, $uibModal, $location) {
    AvailTimeCandidateCtrl.$inject = ['bookingDataClient', '$routeParams', '$uibModal', '$location'];
    function AvailTimeCandidateCtrl(bookingDataClient, $routeParams, $uibModal, $location) {
        var vm = this;

        console.log("$routeParam in AvailTimeCandidateCtrl is : " + JSON.stringify($routeParams));
        vm.queryCriteria = $routeParams.params;
        vm.bookSession = bookSession;
        vm.candidateList=[];

        //vm.pageno = 1; // initialize page no to 1
        vm.total_count = 0;
        vm.itemsPerPage = 10;  //this could be a dynamic value from a drop down
        vm.getData = getResultsPage;  // This would fetch the data on page change.
        vm.getData(1, 1); // Call the function to fetch initial data on page load.   initPageno = 1,  and set initOldPageNo = 1 for skip (0) in mongodb query

        function getResultsPage(newPageNumber, oldPageNumber){ // This would fetch the data on page change.
            // if(newPageNumber === oldPageNumber) {
            //     return null;
            // }
            //
            // if(oldPageNumber){
            //     oldPageNumber =1;
            // }

            vm.queryCriteria.idOf1stRecordOnCurrentPage = '000000000000000000000000';  // null and 12-zero string don't work.  so try a 24-zero string
            if(vm.candidateList.length>0){
                vm.queryCriteria.idOf1stRecordOnCurrentPage = vm.candidateList[0]._id;
            }

            vm.queryCriteria.newPageNumber = newPageNumber;
            vm.queryCriteria.oldPageNumber = oldPageNumber;
            vm.queryCriteria.itemsPerPage = vm.itemsPerPage;
            
            // vm.candidateList = [];   //why put it to [] before get the response.data?   Not necessary, even goes wrong.
            
            return bookingDataClient.queryAvailTimeByPage(vm.queryCriteria)
                .then(function(data){
                    vm.candidateList = data.pageData;  // data to be displayed on current page.
                    vm.total_count = data.totalCount; // total data count.
                });
        }
        
        //vm.candidateList = firstPageData; //declare an empty array
        
        // vm.getData = getAvailTimeForBooking;
        // vm.getData();
        ////////////////////////////////////////////////////////
        // function getAvailTimeForBooking(){
        //     console.log("$routeParams is : " + JSON.stringify($routeParams));
        //     vm.candidateList=[];
        //     return bookingDataClient.queryAvailTime($routeParams)
        //         .then(function(data){
        //             vm.candidateList=data;
        //         });
        // }

        //Todo: need to implement the pagination in server side instead of loading all the records via resolve approach in route
        // vm.pageno = 1; // initialize page no to 1
        // vm.total_count = 0;
        // vm.itemsPerPage = 10; //this could be a dynamic value from a drop down
        // vm.getData = function(pageno){ // This would fetch the data on page change.
        //     //In practice this should be in a factory.
        //     vm.candidateList = [];
        //     $http.get("http://yourdomain/apiname/{itemsPerPage}/{pagenumber}").success(function(response){
        //         //ajax request to fetch data into vm.data
        //         vm.candidateList = response.data;  // data to be displayed on current page.
        //         vm.total_count = response.total_count; // total data count.
        //     });
        // };
        // vm.getData(vm.pageno); // Call the function to fetch initial data on page load.
        
        function bookSession(selectedItem){
                //console.log('step into bookSession() method to open a modal and the selected item ...' + JSON.stringify(selectedItem));

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'booking/bookingConfirmation.ModalDialog.html',
                    controller: 'ModalInstanceCtrl',
                    controllerAs: 'bookingConfirmVm',
                    resolve: {
                        selectedRecord: function () {
                            //console.log("the passed item is " + JSON.stringify(selectedItem))
                            return selectedItem;
                        }
                    }
                });

                modalInstance.result.then(function modalConfirm(confirmedRecord) {
                    console.info('Modal confirmed result is : ' + JSON.stringify(confirmedRecord));

                    //Todo: then to book the record by updating database with username/userid and 'booked' status
                    bookingDataClient.toBookRecord(confirmedRecord, 'currentUsername as student', vm.queryCriteria.earliestStartTime, vm.queryCriteria.latestEndTime)
                        .then(function(response){
                            //then redirect to "bookedSessionDetail" view with cancel button or option
                            //passed the booked record or its id as a parameter
                            console.log('the returned booked session is : ' + JSON.stringify(response));
                            $location.url('bookedSessionDetail').search({params: response.data}); // may need to use response.data to find the booked record later
                            //$location.url('bookedSessionDetail').search({params: confirmedRecord});
                        })
                        .catch(function(err){
                            console.log('failed to book the session : ' + err.message);
                            //add flash message here
                        });
                }, function modalCancel() {
                    console.info('Modal dismissed at: ' + new Date());
                });
        }
    }
})();