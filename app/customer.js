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
    $scope.customer_id = 0;
    $scope.getCustomerDetails = function(customer){
        $scope.customer_id = customer.id;
        $scope.name = customer.name;
        $scope.mobile = customer.mobile;
        $scope.gender = customer.gender;
        $scope.email = customer.email;

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
            
            //$scope.gender = $scope.general[2].value;
            $scope.dob = $scope.general[3].value;
        }); 
    }

    var arr = {};
    $scope.updateCustomer = function(){
        arr['access_token']     = access_token;
        arr['id']               = $scope.customer_id;
        arr['name']             = $scope.name;
        arr['phone_number']     = $scope.mobile;
        arr['gender']           = $scope.gender;
        arr['dob']              = $scope.dob;
        arr['email']            = $scope.email;
        var data                =  JSON.stringify(arr);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/customer/updateCustomer',
            data  : {payload:data}
        }).then(function(response){
            console.log(response);
            angular.element('#editModal').modal('hide');
        }); 
    }

    var new_arr = {};
    $scope.createCustomer = function(){
        new_arr['access_token']     = access_token;
        new_arr['phone_second']     = null;
        new_arr['name']             = $scope.new_name;
        new_arr['phone']            = $scope.new_mobile;
        new_arr['gender']           = $scope.new_gender;
        new_arr['dateOfBirth']      = $scope.new_dob;
        new_arr['email']            = $scope.new_email;
        var data                    = JSON.stringify(new_arr);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/customer/addCustomer',
            data  : {payload:data}
        }).then(function(response){
            console.log(response);
            angular.element('#createModel').modal('hide');
        }); 
    }

});

