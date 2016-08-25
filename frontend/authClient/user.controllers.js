(function() {
    'use strict';
    
    angular.module("PassportApp")
        .controller("ForgotCtrl", ForgotCtrl)
        .controller("LoginCtrl", LoginCtrl)
        .controller("NavCtrl", NavCtrl)
        .controller("ResetCtrl", ResetCtrl)
        .controller("SignUpCtrl", SignUpCtrl);

    NavCtrl.$inject = ['$scope', 'userService', '$rootScope', '$location'];
    function NavCtrl($scope, userService, $rootScope, $location) {
        var navVm = this;

        navVm.logout = logout;

        ////////////////////////////////////
        function logout(){
            return userService.logout()
                .then(logoutComplete);

            function logoutComplete(response){
                if(response.status === 200) {
                    $rootScope.currentUser = null;
                    $location.url("/home");
                    console.info("logout is completed.");
                }
            }
        }
    }


    SignUpCtrl.$inject = ['$scope', 'userService', '$rootScope', '$location'];
    function SignUpCtrl($scope, userService, $rootScope, $location) {
        var signupVm = this;

        signupVm.signup = signup;

        /////////////////////////////
        function signup(user){
            return userService.signup(user)
                .then(signupComplete);
        }

        function signupComplete(response) {
            if (response.data) {
                $rootScope.currentUser = response.data;
                $location.url("/profile");
                console.debug("user signup is completed." + JSON.stringify(response.data));
            }
        }
    }

    LoginCtrl.$inject = ['$scope', 'userService', '$rootScope', '$location'];
    function LoginCtrl($scope, userService, $rootScope, $location) {
        var loginVm = this;

        loginVm.login = login;
        /////////////////////////////////
        function login(user) {
            return userService.login(user)
                .then(loginComplete);
        }

        function loginComplete(response) {
            if (response) {
                console.debug("user login is completed --> response.data " + JSON.stringify(response.data));
                $rootScope.currentUser = response.data;
                $location.url("/profile");
            }
        }
    }

    ForgotCtrl.$inject = ['$scope', 'userService', '$routeParams', 'Flash'];
    function ForgotCtrl($scope, userService, $routeParams, Flash){
        var forgotVm = this;

        forgotVm.forgot = forgot;

        if($routeParams.initAgainInfo) {
            Flash.create("info", $routeParams.initAgainInfo);
        }

        /////////////////////////////////
        function forgot(user){
            return userService.forgot(user);
        }
    }

    ResetCtrl.$inject = ['$scope', 'userService', '$routeParams', '$location', '$rootScope'];
    function ResetCtrl($scope, userService, $routeParams, $location, $rootScope){
        var resetVm = this;

        resetVm.params = $routeParams;
        resetVm.resetPwd = resetPwd;

        ////////////////////////////////////////
        function resetPwd(user){
            user.resetToken = resetVm.params.token;

            return userService.resetPwd(user)
                .then(resetPwdComplete)
                .catch(resetPwdFailed);
        }

        function resetPwdComplete(response) {
            if (response.data.username) {
                $rootScope.currentUser = response.data;
                return $location.url("/profile");
            }
        }
        function resetPwdFailed(response){
            //status = 406 for invalid/expired reset token,  need to redirect to '/forgot' for requesting reset again
            if (response.status<500 && response.data.error) {
                return $location.url('/forgot');
            }
        }
    }

})();