/**
 * Created by alex on 8/2/16.
 */
(function(){
    'use strict';

    // acd stands for "Alex's Custom Directive"
    //Usage: "acd-repeat-password" as an attribute in the 2nd input[password] element in html file,
    // and set the value as the string of the ng-model value of the 1st input[password] element.
    angular.module("PassportApp")
        .directive("acdRepeatPassword", acdRepeatPassword);

    //reference: Fredric, and Maciek's sample from stackoverflow.com/questions/14012239/password-check-directive-in-angularjs#
    function acdRepeatPassword(){
        return {
            require: 'ngModel',
            restrict: 'A',
            link: repeatPwdValidatorLink
        };

        //////////////////////////////////
        function repeatPwdValidatorLink(scope, elm, attrs, ngModelCtrl){
            ngModelCtrl.$validators.acdRepeatPassword = repeatPwdValidator;

            function repeatPwdValidator(modelValue, viewValue){
                console.log("in repeatPwdValidator directive, modelValue : %s, and viewValue : %s, another Pwd : %s", modelValue, viewValue, attrs.acdRepeatPassword);

                if(!attrs.acdRepeatPassword) {
                    console.error('acdRepeatPassword expects a model as an argument!');
                    return;
                }

                scope.$watch(attrs.acdRepeatPassword, function (value) {
                    // Only compare values if the second ctrl has a value.
                    if (!ngModelCtrl.$isEmpty(viewValue)) {
                        ngModelCtrl.$setValidity('acdRepeatPassword', value === viewValue);
                    }
                });

                //console.log("scope.$eval(attrs.acdRepeatPassword) : " + scope.$eval(attrs.acdRepeatPassword));
                if(viewValue === scope.$eval(attrs.acdRepeatPassword)) {
                    return true;
                }else{
                    return false;
                }
            }
        }
    }
})();