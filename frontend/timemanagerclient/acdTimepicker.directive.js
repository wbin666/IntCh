/**
 * Created by alex on 5/13/16.
 */
(function() {
    angular.module('timeManager')
        .directive('acdTimepicker', acdTimepicker)
        .controller('TimepickerCtrl', TimepickerCtrl);

    function acdTimepicker() {
        return {
            restrict: 'E',
            scope: {
                baseTimeModel: '=',
                baseLabelText: '@'
            },
            templateUrl: 'timemanagerclient/acdTimepicker.html',
            controller : TimepickerCtrl,
            controllerAs: 'baseTimeCtrl',
            replace: true,
            bindToController: true
        };
    }

    TimepickerCtrl.$inject = ['$filter'];
    function TimepickerCtrl($filter) {
        var vm = this;

        initTimeCtrl();

        vm.updateTimepicker = updateTimepicker;
        vm.changed = updateInputField;

        function initTimeCtrl() {
            //$scope.baseLabelText="Base Sample Time";
            //$scope.baseTimeModel="11:30";
            var d = new Date();

            if (isHHMMvalid(vm.baseTimeModel)) {
                d.setHours(getInputHH());
                d.setMinutes(getInputMM());
                vm.baseTime4Picker = d;
            } else {
                d.setMinutes(0);
                vm.baseTime4Picker = d;
                updateInputField();
            }
        }

        function updateTimepicker() {
            var d = new Date();
            d.setHours(getInputHH());
            d.setMinutes(getInputMM());
            vm.baseTime4Picker = d;
        }

        function updateInputField() {
            vm.baseTimeModel = $filter('date')(vm.baseTime4Picker, 'HH:mm');
        }

        function getInputHH() {
            return vm.baseTimeModel.substr(0, 2);
        }

        function getInputMM() {
            return vm.baseTimeModel.substr(3, 2);
        }

        function isHHMMvalid(timeStr) {
            if (!isUndefinedOrNull(timeStr)) {
                var timeHHMMPattern = "^(0[0-9]|1[0-9]|2[0-3]):(00|15|30|45)$";
                var timeHHMMReg = new RegExp(timeHHMMPattern);

                if (timeHHMMReg.test(timeStr)) {
                    return true;
                }
            }
            return false;
        }

        function isUndefinedOrNull(val) {
            return angular.isUndefined(val) || val === null;
        }

    }


    // Attention: original file of acdTimepicker.directive.js before replacing '$scope' with 'vm'
    // and work with the commented codes following.
    //
    // <ng-form name="baseTimeForm">
    //     <div class="row" ng-class="{ 'has-error': baseTimeForm.baseTimeInput.$touched && baseTimeForm.baseTimeInput.$invalid }">
    //     <p>
    //     <div class="col-md-2" style="text-align: right">
    //     <label>{{::baseLabelText}}</label>
    // </div>
    // <div class="col-md-2">
    //     <span class="input-group">
    //     <input name="baseTimeInput" type="text" class="form-control" placeholder="HH:MM"
    // ng-model="baseTimeModel"
    // pattern="(0[0-9]|1[0-9]|2[0-3])(:(00|15|30|45))"
    // maxlength="5"
    // required="required">
    //     <span class="input-group-btn" uib-dropdown auto-close="outsideClick">
    //     <button type="button" ng-click="baseTimeForm.baseTimeInput.$valid && (baseTimeForm.baseTimeInput.$dirty || baseTimeForm.baseTimeInput.$pristine) && updateTimepicker()" class="btn btn-default dropdown-toggle" uib-dropdown-toggle><i class="glyphicon glyphicon-time"></i></button>
    //     <ul class="dropdown-menu dropdown-menu-right" uib-dropdown-menu>
    // <li><uib-timepicker ng-model="baseTime4Picker" ng-change="changed()" hour-step="1" minute-step="15" show-meridian="false"></uib-timepicker>
    //     </ul>
    //     </span>
    //     </span>
    //     </div>
    //     <div class="help-block" ng-messages="baseTimeForm.baseTimeInput.$error" ng-if="baseTimeForm.baseTimeInput.$touched">
    //     <p ng-messages-include="html/errorMessages.html"></p>
    //     </div>
    //     </p>
    //     </div>
    // </ng-form>
    //

    // TimepickerCtrl.$inject = ['$scope', '$filter'];
    // function TimepickerCtrl($scope, $filter) {
    //     initTimeCtrl();
    //
    //     $scope.updateTimepicker = function () {
    //         var d = new Date();
    //         d.setHours(getInputHH());
    //         d.setMinutes(getInputMM());
    //         $scope.baseTime4Picker = d;
    //     };
    //
    //     $scope.changed = function () {
    //         updateInputField();
    //     };
    //
    //     function initTimeCtrl() {
    //         //$scope.baseLabelText="Base Sample Time";
    //         //$scope.baseTimeModel="11:30";
    //
    //         var d = new Date();
    //
    //         if (isHHMMvalid($scope.baseTimeModel)) {
    //             d.setHours(getInputHH());
    //             d.setMinutes(getInputMM());
    //             $scope.baseTime4Picker = d;
    //         } else {
    //             d.setMinutes(0);
    //             $scope.baseTime4Picker = d;
    //             updateInputField();
    //         }
    //     }
    //
    //     function updateInputField() {
    //         $scope.baseTimeModel = $filter('date')($scope.baseTime4Picker, 'HH:mm');
    //     }
    //
    //     function getInputHH() {
    //         return $scope.baseTimeModel.substr(0, 2);
    //     }
    //
    //     function getInputMM() {
    //         return $scope.baseTimeModel.substr(3, 2);
    //     }
    //
    //     function isHHMMvalid(timeStr) {
    //         if (!isUndefinedOrNull(timeStr)) {
    //             var timeHHMMPattern = "^(0[0-9]|1[0-9]|2[0-3]):(00|15|30|45)$";
    //             var timeHHMMReg = new RegExp(timeHHMMPattern);
    //
    //             if (timeHHMMReg.test(timeStr)) {
    //                 return true;
    //             }
    //         }
    //         return false
    //     }
    //
    //     function isUndefinedOrNull(val) {
    //         return angular.isUndefined(val) || val === null;
    //     }
    //
    // }
})();

