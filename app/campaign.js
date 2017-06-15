// create the module and name it phpro
// also include ngRoute for all our routing needs
var phpro = angular.module('campaign', ['ngRoute']);

// configure our routes
phpro.config(function($routeProvider) {

$routeProvider
        // route for the index page
        .when('/', {
                templateUrl : 'templates/campaign/camp.html',
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
    // window.location = 'index.html';
    var access_token = localStorage.getItem("access_token");  
}
var base_url = 'zalonstyle.in:8080';
// var base_url = 'localhost:3000';

phpro.controller('mainCtrl', function($scope,$http){
    var url = 'http://'+base_url+'/customer/segments?access_token='+access_token;
    $http({
        method  : 'GET',
        url     : url,
    }).then(function(response){
        if(response.data.segments.length > 0){
            $scope.segmentList = response.data.segments;
            $scope.segmentList.unshift({id:0,segment_name:'select a custom segment'});
            $scope.segment = response.data.segments[0].id;
            $scope.sms_left = response.data.sms.sms_credits;
        }

    });  

    $scope.message = 'Hi [customer name] ';
    $scope.count = 0;
    $scope.getSegmentData = function(val){

        //$scope.campaign = val.name;
        $http({
            method  : 'GET',
            url     : 'http://'+base_url+'/customer/getSegmentCustomers',
            params  :{access_token:access_token,segment_id:val,lastId:0} 
        }).then(function(response){
            $scope.count = response.data.length;
        }); 
    } 

    $scope.credit = 1;
    $scope.removeTagOnBackspace = function (event) {
        // if (event.keyCode === 8) {
        //     $scope.message = $scope.message.replace("Hi [customer name]", "Hi ");
        // }

        var len = $scope.message.length;
        var value = Math.round(len/160);
        $scope.credit = value + 1;

    }

    $scope.info = {};
    $scope.createCampaign = function(){
        var url = 'http://'+base_url+'/campaign/createCampaign';   
        $scope.info['access_token']     = access_token;
        $scope.info['campaign']         = $scope.campaign;
        $scope.info['segment']          = $scope.segment;
        $scope.info['message']          = $scope.message;
        $scope.info['offer_type']       = $scope.offer_type;
        $scope.info['offer_value']      = $scope.offer_value;
        $scope.info['expiry']           = $scope.expiry;
        $scope.info['schedule']         = $scope.schedule;

        if($scope.sms_left >= ($scope.credit*$scope.count)){
            var data =  JSON.stringify($scope.info);
            $http({
                method  : 'POST',
                url     : url,
                data    : {payload:data}
            }).then(function(response){
                if(response.data.status == 'success'){
                    $scope.campaign = '';
                    $scope.segment = 0;
                    $scope.message = 'Hi [customer name] ';
                    $scope.offer_type = 0;
                    $scope.offer_value = '';
                    $scope.expiry = '';
                    $scope.schedule = '';
                }                                          
            }); 
        }else{
            swal("You don't have enough credits");
        }
    }

   
});

