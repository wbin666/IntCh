/**
 * Created by alex on 8/10/16.
 */
(function() {
    'use strict';

    angular.module("PassportApp")
        .factory('userService', userService);

    //reference of flash message:
    //1.  https://github.com/sachinchoolur/angular-flash
    //2.  http://stackoverflow.com/questions/38094224/how-to-show-flash-message-only-in-current-page-for-particular-time-only-using-an
    //    http://stackoverflow.com/questions/29248401/unknown-provider-for-directive
    //3. https://github.com/gtramontina/angular-flash
    //4. connect-flash: http://stackoverflow.com/questions/25480633/how-do-i-display-flash-message-without-page-refresh-using-express-and-connect-fl
    //5. another solution:  put "index.html" in express engine, so get the support of "connect-flash".  other partial views are managed by angularjs

    userService.$inject = ['$http', '$q', 'Flash'];
    function userService($http, $q, Flash) {
        return {
            forgot: forgot,
            login: login,
            loggedinCheck: loggedinCheck,
            logout: logout,
            signup: signup,
            resetPwd: resetPwd,
            uniqueCheck: uniqueCheck
        };

        function forgot(user){
            return $http.post("/forgot", user)
                .then(forgotSuccessCb)
                .catch(forgotErrorCb);

            function forgotSuccessCb(response){
                console.log('An e-mail has been sent to ' + user.email + ' with further instructions.' + JSON.stringify(response));
                Flash.create("success", 'An e-mail has been sent to ' + user.email + ' with further instructions.')
            }
            function forgotErrorCb(response){
                console.log("Error occurred while initiating the password reset for " + user.email + " : " + JSON.stringify(response));
                Flash.create("danger", response.data.error);
            }
        }

        function login(user){
            return $http.post('/login', user)
                .then(loginSuccessCb)
                .catch(loginErrorCb);
            
            function loginSuccessCb(response){
                console.log("user login is successful : " + JSON.stringify(response));
                Flash.create("success", "You've logged in successfully!");

                return response;
            }
            function loginErrorCb(response){
                console.log("user login error is : " + JSON.stringify(response));
                Flash.create("danger", response.data.error);
            }
        }
        
        function loggedinCheck(){
            return $http.get('/loggedin');
        }

        function logout() {
            //console.log("the user is going to logout");

            return $http.post("/logout")
                .then(logoutSuccessCb)
                .catch(logoutErrorCb);

            function logoutSuccessCb(response) {
                console.log("logout success : " + JSON.stringify(response));
                Flash.create("success", "Log out successfully.");
                
                return response;
            }

            function logoutErrorCb(error) {
                console.log("logout error : " + JSON.stringify(error));
                Flash.create("danger", "Error occurred while requesting logout. Please try again.");
            }
        }

        function signup(user){
            console.log("user signup info to be posted from Anguluar is : " + JSON.stringify(user));

            return $http.post('/signup', user)
                .then(signupSuccessCb)
                .catch(signupErrorCb);

            function signupSuccessCb(response){
                console.log("user signup is successful : " + JSON.stringify(response));
                Flash.create("success", "User signup is completed successfully");
                
                return response;
            }

            function signupErrorCb(response){
                console.log("user signup error is : " + JSON.stringify(response));
                Flash.create("danger", "Please try again. User signup error : " + response.data.error);
                
                //return $q.reject(response);
            }
        }
        
        function resetPwd(user){
            console.log("resetting password request is going to submit : " + JSON.stringify(user));
            var resetPromise = $http.post('/reset', user);

            resetPromise.then(resetPwdSuccessCb)
                .catch(resetPwdErrorCb);

            return resetPromise;

            function resetPwdSuccessCb(response){
                console.log("Password has been reset successfully for the user : " + JSON.stringify(response));
                Flash.create('success', "Password has been reset successfully");
            }
            function resetPwdErrorCb(response){
                console.log("Failed to reset the password and the error is : " + JSON.stringify(response));
                Flash.create('danger', response.data.error);
            }
        }

        function uniqueCheck(checkValue){
            var fieldName = 'username';  // to check for username by default;

            console.log("Unique check is going for : " + checkValue);

            if(checkValue.indexOf("@") !== -1){
                fieldName='email';   // set the field name to 'email' for email unique check
                console.log("Unique check is going with email : " + checkValue);
            }


            //Todo: why use "modelValue" here?  because it's an async and custom validator??
            //Todo: how to use urlencode to include the email in url via query string,  not as parameter in path
            //C# sample: http://stackoverflow.com/questions/15978555/mvc4-url-routing-with-email-as-parameter/15978622
            //c# sample: http://stackoverflow.com/questions/5796789/passing-email-address-via-query-string-in-c-sharp#

            //Using route in server side: /authClient/uniquecheck/:fieldname/:fieldvalue
            // Todo: is it necessary to handle the "@" in email address? and avoid the plain text in url for security.  maybe by url encode or escape or SSL?
            // https://en.wikipedia.org/wiki/Percent-encoding
            //     http://stackoverflow.com/questions/15978555/mvc4-url-routing-with-email-as-parameter
            //         https://code.angularjs.org/1.5.7/docs/api/ng/service/$httpParamSerializerJQLike
            //             http://stackoverflow.com/questions/24710503/how-do-i-post-urlencoded-form-data-with-http-in-angularjs
            //                 or via ssl/https??
            //     more : http://stackoverflow.com/questions/1634271/url-encoding-the-space-character-or-20

            var newPromise = $q(function newPromiseCb(resolve, reject){
                //Using route in server side: /authClient/uniquecheck/:fieldname/:fieldvalue
                $http.get('/authClient/uniquecheck/' + fieldName + '/' + checkValue)
                    .then(function sucessCb(response){
                        console.log("Found existing value in user database for : " + checkValue);
                        reject("Existing value found");
                    })
                    .catch(function errorCb(response){
                        //the username is legal/unique to use since it has not been registered
                        console.log("Not found the value in user database for : " + checkValue);
                        resolve("It's qualified for a new user");
                    });
            });

            return newPromise;

        }
    }
})();