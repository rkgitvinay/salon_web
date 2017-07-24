var phpro = angular.module('report', ['ngRoute']);

phpro.config(function($routeProvider) {

$routeProvider

        // .when('/', {
        //         templateUrl : 'templates/report/test.html',
        //         controller  : 'CustomerCtrl'
        // })

        .when('/', {
                templateUrl : 'templates/report/customer.html',
                controller  : 'CustomerCtrl'
        })

        .when('/staff', {
            templateUrl : 'templates/report/staff.html',
            controller  : 'staffCtrl'
        })

        .when('/sale', {
            templateUrl : 'templates/report/sale.html',
            controller  : 'saleCtrl'
        })

        .when('/service', {
            templateUrl : 'templates/report/service.html',
            controller  : 'serviceCtrl'
        })

        .when('/product', {
            templateUrl : 'templates/report/product.html',
            controller  : 'productCtrl'
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

phpro.controller('staffCtrl', function($scope,$http,$window,$rootScope){
    $scope.staffStats;

    $scope.subList = [
        
        {id:1,text:'Today Stats',subText:''},
        {id:2,text:'Yesterday Stats',subText:''},
        {id:3,text:'This Week Stats',subText:''},
        {id:4,text:'This Month Stats',subText:''},
        {id:5,text:'Last Month Stats',subText:''},
        {id:6,text:'This Year Stats',subText:''},
        // {id:1,text:'Sale wise (This Month)',subText:'Clients life time spending (high to low)'},
        // {id:4,text:'Sale wise (Last Month)',subText:''},
        // {id:5,text:'Sale wise (This Year)',subText:''},
        
    ];
            

        $http({
            method  : 'GET',
            url     : 'http://'+base_url+'/stats/staffReport',
            params  :{access_token:access_token} 
        }).then(function(response){
            if(response.data.status=='success'){
                $scope.staffStats = response.data; 
                $scope.result = $scope.staffStats.today;
                $scope.heading = 'Today Stats';
            }
        }); 

        $scope.getStaffData = function(row){
            $scope.heading = row.text;
            if(row.id == 1){
                $scope.result = $scope.staffStats.today;
            }else if(row.id == 2){
                $scope.result = $scope.staffStats.yesterday;
            }else if(row.id == 3){
                 $scope.result = $scope.staffStats.thisWeek;
            }else if(row.id == 4){
                $scope.result = $scope.staffStats.thisMonth;
            }else if(row.id == 5){
                 $scope.result = $scope.staffStats.lastMonth;
            }else if(row.id == 6){
                 $scope.result = $scope.staffStats.thisYear;
            }
            //console.log($scope.staffStats);
        }

        $scope.exportData = function(heading){
            var file_name = heading+'.xls';
            var blob = new Blob([document.getElementById('exportable').innerHTML], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
            });
            saveAs(blob, file_name);
        }
});


phpro.controller('serviceCtrl', function($scope,$http,$window,$rootScope){  
    // $scope.subList = [
    //     {id:1,text:'Sales (This Month)',subText:''},
    //     {id:2,text:'Sales (This Year)',subText:''},
    // ];
        $http({
            method  : 'GET',
            url     : 'http://'+base_url+'/stats/serviceReport',
            params  :{access_token:access_token} 
        }).then(function(response){
            if(response.data.status=='success'){
                $scope.subList = response.data.result;
            }
        }); 
});

phpro.controller('productCtrl', function($scope,$http,$window,$rootScope){  
    // $scope.subList = [
    //     {id:1,text:'Sales (This Month)',subText:''},
    //     {id:2,text:'Sales (This Year)',subText:''},
    // ];
        $http({
            method  : 'GET',
            url     : 'http://'+base_url+'/stats/productReport',
            params  :{access_token:access_token} 
        }).then(function(response){
            if(response.data.status=='success'){
                $scope.subList = response.data.result;
            }
        }); 
});

phpro.controller('saleCtrl', function($scope,$http,$window,$rootScope){  
    // $scope.subList = [
    //     {id:1,text:'Today',subText:''},
    //     {id:2,text:'This Month',subText:''},
    //     {id:3,text:'Last Month',subText:''},
    //     {id:4,text:'This Year',subText:''},
    //     {id:5,text:'Last Year',subText:''},
    // ];

        
        $http({
            method  : 'GET',
            url     : 'http://'+base_url+'/stats/saleReport',
            params  :{access_token:access_token} 
        }).then(function(response){
            if(response.data.status=='success'){
                $scope.subList = response.data.result;
            }
        }); 
    
});


