// create the module and name it phpro
// also include ngRoute for all our routing needs
var phpro = angular.module('customer', ['ngRoute']);

// configure our routes
phpro.config(function($routeProvider) {

$routeProvider
        // route for the index page
        .when('/', {
                templateUrl : 'templates/customer/cust.html',
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

// var access_token = localStorage.getItem("access_token");
if(localStorage.getItem("access_token") == null){
    window.location = 'login.html';

}else{
    var access_token = localStorage.getItem("access_token");  
}
var base_url = 'zalonstyle.in:8080';
// var base_url = 'localhost:3000';

phpro.controller('mainCtrl', function($scope,$http) {

    $scope.categories = [
        {cat:'Gender'},
        {cat:'Membership'},
        {cat:'Service'},
        {cat: 'Amount Spent'}
    ]

    var url = 'http://'+base_url+'/accounting/getInfoStats?access_token='+access_token;
    $http({
        method  : 'GET',
        url     : url,
    }).then(function(response){
        if(response.data.category.length > 0){
            $scope.payment_log = response.data.log;
        }

    }); 


    $scope.category = 'SELECT CATEGORY';
    $scope.subCat = 'SELECT OPTION';
    $scope.selectedCategory = '';
    $scope.getSubCategory = function(cat){
        $scope.selectedCategory = cat;
        $scope.category = cat;
        switch(cat){
            case 'Gender':
                $scope.subCat = 'SELECT GENDER';
                $scope.subCategory = [{id:1, value:'Male'},{id:0, value:'Female'}];
                $scope.searchServiceBox = false;
                $scope.inputValue = false;
                $scope.childCategory = false;
                break;
            case 'Membership':
                $scope.subCat = 'SELECT EXPIRY';
                $scope.subCategory = [{id:0,value:'Expired'},{id:1,value:'Expire In'}];
                $scope.searchServiceBox = false;
                $scope.inputValue = false;
                $scope.childCategory = true;
                $scope.childValues = [{id:1,value:'1 Month'},{id:3,value:'3 Months'},{id:6,value:'6 Months'},{id:12,value:'12 Months'}];
                break;
            case 'Service':
                $scope.subCat = 'SELECT OPTION';
                $scope.subCategory = [{id:0,value:"Has't tried"},{id:1,value:"Has tried"}];
                $scope.childCategory = false;
                $scope.inputValue = false;
                $scope.searchServiceBox = true;
                break;
            case 'Amount Spent':
                $scope.subCat = 'SELECT OPTION';
                $scope.subCategory = [{id:0,value:"Less Than"},{id:1,value:"More Than"}];
                $scope.searchServiceBox = false;
                $scope.childCategory = false;
                $scope.inputValue = true;
                break;
        }
    } 

    $scope.selectedSubCategory = '';
    $scope.getSubCategoryStats = function(val){

        $scope.selectedSubCategory = val.id;
        $scope.subCat = val.value;

        if($scope.selectedCategory == 'Gender'){
            $http({
                method  : 'GET',
                url     : 'http://'+base_url+'/customer/getCustomerList',
                params  :{access_token:access_token,category:$scope.selectedCategory,subCategory:$scope.selectedSubCategory,value:val.value} 
            }).then(function(response){
                $scope.segession_box = false;
                $scope.searchList = response.data.result;
                
            }); 
        }
    }

    $scope.serachService = function(str){
        $http({
            method  : 'GET',
            url     : 'http://'+base_url+'/customer/searchService',
            params  :{access_token:access_token,serachStr:str} 
        }).then(function(response){
            $scope.segession_box = true;
            $scope.searchList = response.data.result;
            //console.log(response.data.result);
        }); 
    }

    $scope.getCustomerStats = function(val){
        $http({
            method  : 'GET',
            url     : 'http://'+base_url+'/customer/getCustomerList',
            params  :{access_token:access_token,category:$scope.selectedCategory,subCategory:$scope.selectedSubCategory,value:val.id} 
        }).then(function(response){
            $scope.segession_box = false;
            $scope.searchList = response.data.result;
            
        }); 
    }

    $scope.getListByAmount = function(value){
        $http({
            method  : 'GET',
            url     : 'http://'+base_url+'/customer/getCustomerList',
            params  :{access_token:access_token,category:$scope.selectedCategory,subCategory:$scope.selectedSubCategory,value:parseInt(value)} 
        }).then(function(response){
            $scope.searchList = response.data.result;
            
        }); 
    }

    // $scope.selectedChildCategory = '';
    // $scope.setChildCategory = function(childCat){
    //     $scope.selectedChildCategory = childCat;
    // }

    // $scope.selectedSubChildCategory = '';
    // $scope.getChildCategoryList = function(subChildCat){
    //    $scope.selectedSubChildCategory = subChildCat;
    //    $http({
    //         method  : 'GET',
    //         url     : 'http://'+base_url+'/customer/getCustomerStats',
    //         params  :{access_token:access_token,category:$scope.selectedCategory,subCategory:$scope.selectedSubCategory,childCategory:$scope.selectedChildCategory,subChildCategory:subChildCat} 
    //     }).then(function(response){
            
    //         console.log(response);
    //     }); 
    // }
    
});

