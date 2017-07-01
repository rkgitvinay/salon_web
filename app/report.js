var phpro = angular.module('report', ['ngRoute']);

phpro.config(function($routeProvider) {

$routeProvider
        .when('/', {
                templateUrl : 'templates/report/test.html',
                controller  : 'CustomerCtrl'
        })
        .when('/customer', {
                templateUrl : 'templates/report/customer.html',
                controller  : 'CustomerCtrl'
        })


        .when('/info', {
            templateUrl : 'templates/report/info.html',
            controller  : 'InfoCtrl'
        })

        
        .when('/other', {
                templateUrl : 'templates/report/other.html',
                controller  : 'OtherCtrl'
        });
});

if(localStorage.getItem("access_token") == null){
    window.location = 'login.html';
}else{
    var access_token = localStorage.getItem("access_token");  
}

var base_url = 'zalonstyle.in:8080';
// var base_url = 'localhost:3000';

phpro.controller('CustomerCtrl', function($scope,$http,$window,$rootScope){  
    $scope.subList = [
        {id:1,text:'Big Spender',subText:'Clients life time spending (high to low)'},
        {id:2,text:'Membership holders (active)',subText:''},
        {id:3,text:'Prepaid card holders',subText:''},
        {id:4,text:'Package holders',subText:''},
        {id:5,text:'Clients with pending payments',subText:''},
        {id:6,text:'Clients life time visits',subText:''},
        {id:7,text:'Lost clients',subText:''},
        {id:8,text:'No show clients',subText:''},
        {id:9,text:'Time analysis',subText:'with time of the day basis'},
        {id:10,text:'Day analysis',subText:''},
        {id:11,text:'New Membership holders',subText:''},
        {id:12,text:'New Prepaid card holders',subText:''},
        {id:13,text:'New Package holders',subText:''},
        {id:14,text:"Clients with package expiring soon",subText:''},
        {id:15,text:"Clients with membership expiring soon",subText:''},
        {id:16,text:"Clients with prepaid card expiring soon",subText:''},
        {id:17,text:"Clients with low prepaid balance",subText:''}
    ];

    $scope.getCustomerList = function(val){
        $scope.heading = val.text;
        $http({
            method  : 'GET',
            url     : 'http://'+base_url+'/customer/getCustomerReport',
            params  :{access_token:access_token,category_id:val.id} 
        }).then(function(response){
            $scope.result = response.data.result;
            $scope.count = $scope.result.length;
            $scope.header = response.data.header;
        }); 
    }

     $scope.exportData = function(heading){
        var file_name = heading+'.xls';
        var blob = new Blob([document.getElementById('exportable').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, file_name);
    }

});
