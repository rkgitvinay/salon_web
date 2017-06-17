var phpro = angular.module('customer', ['ngRoute']);
phpro.config(function($routeProvider) {

$routeProvider
        
        .when('/', {
                templateUrl : 'templates/customer/cust.html',
                controller  : 'mainCtrl'
        })

        .when('/sales', {
            templateUrl : 'templates/sales.html',
            controller  : 'faqCtrl'
        })

        
        .when('/customers', {
                templateUrl : 'templates/customer.html',
                controller  : 'contactCtrl'
        });
});


if(localStorage.getItem("access_token") == null){
    window.location = 'login.html';
}else{
    var access_token = localStorage.getItem("access_token");  
}

var base_url = 'zalonstyle.in:8080';
// var base_url = 'localhost:3000';

phpro.controller('mainCtrl', function($scope,$http) {

    var search_arr = {};
    $scope.searchCustomerByMobile = function(value){
        if(value.str.length > 2){
            search_arr['access_token'] = access_token;
            search_arr['str']  = value.str;
            search_arr['type'] = value.type;
            var data =  JSON.stringify(search_arr);
            $http({
                method  : 'POST',
                url     : 'http://'+base_url+'/customer/searchCustomerByMobile',
                data  : {payload:data}
            }).then(function(response){
                if(response.data.customers.length > 0){
                    $scope.suggestionBox = true;
                    $scope.customerList = response.data.customers;
                }else{
                    $scope.suggestionBox = false;
                }
            }); 
        }
    }

    var cust_arr = {};
    $scope.getCustomerDetails = function(customer){
        $scope.name = customer.name;
        $scope.mobile = customer.mobile;
        $scope.gender = customer.gender;

        cust_arr['access_token'] = access_token;
        cust_arr['customer_id']  = customer.id;
        $scope.suggestionBox = false;
        var data =  JSON.stringify(cust_arr);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/customer/getAllDetailsOfCustomer',
            data  : {payload:data}
        }).then(function(response){
            $scope.general = response.data.general;
            $scope.package = response.data.package;
            $scope.membership = response.data.membership;
            $scope.prepaid = response.data.prepaid;
            $scope.appointments = response.data.appointments;
            $scope.billing = response.data.billing;
        }); 
    }

});

