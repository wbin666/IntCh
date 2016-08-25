/**
 * Created by alex on 7/26/16.
 */
(function(){
    'use strict';

    // acd stands for "Alex's Custom Directive"
    //Usage: "acd-unique-check" as an attribute in the input[email] element in html file
    angular.module("PassportApp")
        .directive("acdUniqueCheck", acdUniqueCheck);

    acdUniqueCheck.$inject=['$q', 'userService'];
    function acdUniqueCheck($q, userService){
        return {
            restrict: 'A',
            require: 'ngModel',
            link: uniqueCheckLink
        };

        //////////////////////////////////
        function uniqueCheckLink(scope, elm, attrs, ctrl) {
            ctrl.$asyncValidators.uniqueCheck = uniqueCheck;

            function uniqueCheck(modelValue, viewValue) {
                console.log("in usernameUnique directive, modelValue : %s, and viewValue : %s, scope.name : %s", modelValue, viewValue, scope.name);

                if (ctrl.$isEmpty(modelValue)) {
                    //Todo: ??? think more logically here since $q.when is actually meaning "resolve"
                    // consider empty model valid  from "https://code.angularjs.org/1.5.4/docs/guide/forms"
                    return $q.when();
                }

                //Q: angularjs modelValue vs viewValue in ngModelController
                //A: http://stackoverflow.com/questions/29498610/in-angularjs-how-value-propagate-from-real-view-value-viewvalue-model
                //A: http://stackoverflow.com/questions/19383812/whats-the-difference-between-ngmodel-modelvalue-and-ngmodel-viewvalue
                //A: sample of $asyncValidators from https://code.angularjs.org/1.5.7/docs/api/ng/type/ngModel.NgModelController
                //A: sample of custom validation from https://code.angularjs.org/1.5.7/docs/guide/forms
                //my summary
                // Here I want to add more detail based a sample.
                //     real view value(from UI) -->$viewValue -->(debounce delay) --> $parsers --> $modelValue --> $validators/$asynValidators -->real model value($scope.yourVar)
                //
                // Below is how to run the sample to understand the propogation.
                //     I dig into the topic by running the sample in custom validation from "https://code.angularjs.org/1.5.3/docs/guide/forms".
                //     Acutually, I added a line to print the values of different variables.
                // "console.log("modelValue : %s, and viewValue : %s, scope.name : %s", modelValue, viewValue, scope.name);". And I added a attribute "ng-model-options="{updateOn: 'blur'}" to the "input" element in html.
                //
                // BTW, I also refer to this blog for understanding the $parsers and $formatters.
                //     https://www.nadeau.tv/using-ngmodelcontroller-with-custom-directives/

                return userService.uniqueCheck(modelValue);  // return a promise
            }
        }
    }

})();