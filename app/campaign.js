// create the module and name it phpro
// also include ngRoute for all our routing needs
var phpro = angular.module('campaign', ['ngRoute']);

// configure our routes
phpro.config(function($routeProvider,$locationProvider) {
$locationProvider.hashPrefix('');
$routeProvider
        
        .when('/', {
                templateUrl : 'templates/campaign/camp.html',
                controller  : 'mainCtrl'
        })

        .when('/createCampaign', {
            templateUrl : 'templates/campaign/create_camp.html',
            controller  : 'createCtrl'
        })

        .when('/createRefferal', {
            templateUrl : 'templates/campaign/create_refferal.html',
            controller  : 'createRefferalCtrl'
        })

        .when('/editCampaign/:myParam', {
            templateUrl : 'templates/campaign/create_camp.html',
            controller  : 'editCtrl'
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


phpro.controller('mainCtrl', function($scope,$http,$location){

    var url = 'http://'+base_url+'/campaign/getAllCampaigns?access_token='+access_token;
    $http({
        method  : 'GET',
        url     : url,
    }).then(function(response){
        $scope.promo = response.data.promo;
    });

    $scope.getCampaignData = function(value){
        $scope.segment = value.name;
        $scope.campaign_detail = true;

        var url = 'http://'+base_url+'/campaign/getCampaignData?access_token='+access_token+'&id='+parseInt(value.id);
        $http({
            method  : 'GET',
            url     : url,
        }).then(function(response){
            $scope.data = response.data.campaign;
        }); 
    }

    $scope.getClass = function(status){
        if(status == 'Pending'){
            return 'badge-pending';    
        }else if(status == 'Active'){
            return 'badge-active';
        }else{
            return 'badge-expired';
        }
    }

    $scope.editCampaignData = function(id){
        $location.path('/editCampaign/'+id+' ');
    }

    $scope.deleteCampaign = function(id){
        swal({
          title: "Are you sure?",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, Delete it!",
          closeOnConfirm: false
        },
        function(){
            $http({
                method  : 'GET',
                url     : 'http://'+base_url+'/campaign/deleteCampaign',
                params  :{access_token:access_token,id:id} 
            }).then(function(response){
                swal("Deleted", "Campaign has been deleted!", "success");
                $scope.promo = response.data.promo;
            }); 
        });
    }
});

phpro.controller('createCtrl', function($scope,$http,$location){

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

    $scope.offer_type = 'Select Offer Type';
    $scope.message = 'Hi [customer name] ';
    $scope.count = 0;
    $scope.getSegmentData = function(val){
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
                // if(response.data.status == 'success'){
                //     $scope.campaign = '';
                //     $scope.segment = 0;
                //     $scope.message = 'Hi [customer name] ';
                //     $scope.offer_type = 0;
                //     $scope.offer_value = '';
                //     $scope.expiry = '';
                //     $scope.schedule = '';
                // } 
                $location.path('/');                                         
            }); 
        }else{
            swal("You don't have enough credits");
        }
    }

   
});

phpro.controller('editCtrl', function($scope,$http,$routeParams,$filter,$location){
    $scope.createCampBtn = true;
    $scope.updateCampBtn = true;
    var url = 'http://'+base_url+'/campaign/getCampaignData?access_token='+access_token+'&id='+parseInt($routeParams.myParam);
    $http({
        method  : 'GET',
        url     : url,
    }).then(function(response){
        $scope.segmentList = response.data.segment;
        $scope.segment = response.data.campaign.segment_id;
        var data = response.data.campaign;
        $scope.campaign = data.campaign_name;
        $scope.message = data.message;
        $scope.offer_type = data.offer_type;
        $scope.offer_value = data.offer_value;
        $scope.expiry = $filter('date')(data.expiry_date, "yyyy-MM-dd");
        $scope.schedule = $filter('date')(data.schedule_date, "yyyy-MM-dd");
    }); 

    $scope.count = 0;
    $scope.getSegmentData = function(val){
        $http({
            method  : 'GET',
            url     : 'http://'+base_url+'/customer/getSegmentCustomers',
            params  :{access_token:access_token,segment_id:val,lastId:0} 
        }).then(function(response){
            $scope.count = response.data.length;
        }); 
    } 

    $scope.info = {};
    $scope.updateCampaign = function(){
        var url = 'http://'+base_url+'/campaign/updateCampaign';
        $scope.info['id']               = parseInt($routeParams.myParam)
        $scope.info['access_token']     = access_token;
        $scope.info['campaign']         = $scope.campaign;
        $scope.info['segment']          = $scope.segment;
        $scope.info['message']          = $scope.message;
        $scope.info['offer_type']       = $scope.offer_type;
        $scope.info['offer_value']      = $scope.offer_value;
        $scope.info['expiry']           = $scope.expiry;
        $scope.info['schedule']         = $scope.schedule;

        
            var data =  JSON.stringify($scope.info);
            $http({
                method  : 'POST',
                url     : url,
                data    : {payload:data}
            }).then(function(response){
                if(response.data.status == 'success'){
                    $location.path('/');    
                }
                                                     
            }); 
       
    }

});

phpro.controller('createRefferalCtrl', function($scope,$http,$routeParams,$filter,$location){
    $scope.message = 'Recieve free 1x month membership on every successful referral';
    $scope.offer_type_referral = 'Select Offer Type';
    $scope.offer_type_referee = 'Select Offer Type';

    $scope.info = {};
    $scope.createRefferal = function(){
        
        var url = 'http://'+base_url+'/campaign/createRefferal';

        $scope.info['access_token']             = access_token;
        $scope.info['message']                  = $scope.message;
        $scope.info['offer_type_referral']      = $scope.offer_type_referral;
        $scope.info['offer_value_referral']     = $scope.offer_value_referral;
        $scope.info['offer_type_referee']       = $scope.offer_type_referee;
        $scope.info['offer_value_referee']      = $scope.offer_value_referee;
        $scope.info['expiry']                   = $scope.expiry;

        var data =  JSON.stringify($scope.info);
        $http({
            method  : 'POST',
            url     : url,
            data    : {payload:data}
        }).then(function(response){
           
            $location.path('/');                                         
        }); 
       
    }


    
});