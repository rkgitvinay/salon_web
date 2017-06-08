// create the module and name it phpro
// also include ngRoute for all our routing needs
var phpro = angular.module('admin', ['ngRoute']);

// configure our routes
phpro.config(function($routeProvider) {

$routeProvider
        // route for the index page
        .when('/', {
                templateUrl : 'templates/home.html',
                controller  : 'mainCtrl'
        })

        // route for the FAQ page
        .when('/sales', {
        templateUrl : 'templates/sales.html',
        controller  : 'faqCtrl'
        })

        // route for the contact page
        .when('/customers', {
                templateUrl : 'templates/customer.html',
                controller  : 'contactCtrl'
        });
});

// create the controller and inject Angular's $scope
phpro.controller('mainCtrl', function($scope) {
       
});

phpro.controller('faqCtrl', function($scope) {

});

phpro.controller('contactCtrl', function($scope) {
      
});