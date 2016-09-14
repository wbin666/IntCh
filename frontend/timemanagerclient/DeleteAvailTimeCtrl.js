/**
 * Created by alex on 5/12/16.
 */
(function(){
    angular.module('timeManager')
        .controller('DeleteAvailTimeCtrl', DeleteAvailTimeCtrl);

    DeleteAvailTimeCtrl.$inject = ['openingDataClient'];
    function DeleteAvailTimeCtrl(openingDataClient) {
        var vm = this;
        
        vm.startTimeLabel = "Start time";
        vm.startTimeModel = "09:00";
        vm.endTimeLabel = "End time";
        vm.endTimeModel = "18:00";
    
        vm.startDateLabel = "Starting";
        vm.startDateModel = new Date();

        vm.endDateLabel = "To";
        tempDate.setDate(tempDate.getDate() + 7);
        vm.endDateModel = tempDate;  //by default, it's for 7 days

        vm.releaseType = 'releaseWholeDay';
        
        vm.deleteTime = function deleteTime(){
            if(vm.releaseType === 'releaseTimeRange'){
                return openingDataClient.releaseTimeRange(vm);
            }
            
            if(vm.releaseType === 'releaseWholeDay'){
                return openingDataClient.releaseWholeDay(vm);
            }
            
        };
    }
})();