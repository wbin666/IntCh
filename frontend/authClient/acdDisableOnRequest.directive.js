/**
 * Created by alex on 8/18/16.
 */
(function() {
    'use strict';

    // used with form to stop the "submit" event, and then find the "submit" input by its id and disable it for 5 seconds
    // Todo: the level of the directive should be 0, highest, and put it before ng-submit.  then check the sequence of registered event listeners on the form
    angular.module("PassportApp")
        .directive("acdDisableOnRequest", acdDisableOnRequest);

    //reference: http://blog.csdn.net/kongjiea/article/details/38872503
    // http://stackoverflow.com/questions/34904424/how-to-disable-buttons-until-http-request-is-processed-loaded-in-angularjs#
    //http://stackoverflow.com/questions/35289867/how-to-disable-and-showing-another-button-text-untill-the-button-is-loaded-in-an
    //http://stackoverflow.com/questions/34964146/how-to-disable-a-button-until-http-request-is-loaded-in-angularjs#
    //another option: http://stackoverflow.com/questions/22710241/angularjs-disable-button-on-http-q-calls
    function acdDisableOnRequest($document, $timeout){
        return {
            restrict: 'A',
            link: linkFn
        };

        function linkFn(scope, element, attrs) {
            //var submitting = false;
            //var submitBtnElement = $document.find('#'+attrs.acdsubmitbtnid);
            var submitBtnElement = element.find('#'+attrs.acdsubmitbtnid);

            console.log("attrs.acdsubmitbtnid is : " + attrs.acdsubmitbtnid);

            console.log(scope, element, attrs);
            // console.log("element in acdDisableOnRequest : " + JSON.stringify(element));
            // console.log("attrs in acdDisableOnRequest : " + JSON.stringify(attrs));
            //
            // console.log("submitBtnElement found is : " + JSON.stringify(submitBtnElement));

            element.on('submit', submitHandler);

            function submitHandler(submitEvent) {
                //console.log('var submitting = ' + submitting);
                console.log('the detail submitEvent : ' + JSON.stringify(submitEvent));

                // if (submitting) {
                //     // submitEvent.stopImmediatePropagation();
                //     // submitEvent.preventDefault();
                //
                // } else {
                //     submitting = true;

                    submitBtnElement.prop('disabled', true);
                    //submitBtnElement.val(attrs.acdprocessing);

                    $timeout(function(){
                        //submitting = false;
                        submitBtnElement.attr('disabled', false);
                        //submitBtnElement.val(attrs.acdnotprocessing);
                    }, attrs.acdtimeout);   //disable the submit button for 5 seconds.
                // }
            }
        }

    }

})();