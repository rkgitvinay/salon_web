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
// var base_url = 'zalonstyle.in:8080';
var base_url = 'localhost:3000';


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
            $scope.showRunBtn = true;
        }); 
    }

    $scope.sendCampaign = function(campaign_id){
        //console.log(campaign_id);
        var url = 'http://'+base_url+'/campaign/sendCampaign';
        swal({
          title: "Are you sure?",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, Run it!",
          closeOnConfirm: false
        },
        function(){
            $http({
                method  : 'GET',
                url     : url,
                params  :{access_token:access_token,campaign_id:campaign_id} 
            }).then(function(response){
                swal("Sent", "Campaign has been sent!", "success");
                //$scope.promo = response.data.promo;
            }); 
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
    $scope.offer_valid = 'Select Type';
    $scope.offer_rule = 'Select Rule';
    $scope.category = '';

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
            $scope.serviceList = response.data.service;
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
        $scope.info['offer_list']       = $scope.offer_list;
        $scope.info['segment']          = $scope.segment;
        $scope.info['message']          = $scope.message;
        $scope.info['offer_type']       = $scope.offer_type;
        $scope.info['offer_value']      = $scope.offer_value;
        $scope.info['start']            = $scope.start_date;
        $scope.info['expiry']           = $scope.end_date;
        $scope.info['schedule']         = $scope.schedule;
        $scope.info['ruleList']         = $scope.ruleList;

        //console.log($scope.info);
        if($scope.sms_left >= ($scope.credit*$scope.count)){
            var data =  JSON.stringify($scope.info);
            $http({
                method  : 'POST',
                url     : url,
                data    : {payload:data}
            }).then(function(response){
                $location.path('/');                                         
            }); 
        }else{
            swal("You don't have enough credits");
        }
    }

    $scope.services = [
        {id:0,name:'Select Service'},
        {id:1,name:'Body'},
        {id:2,name:'Hair'},
        {id:3,name:'Nail'},
        {id:4,name:'Face'},
        {id:5,name:'Hair Removal'},
        {id:6,name:'Massage'},
        {id:7,name:'Others'}
    ]

    var offer_service_id = 0;
    var first_param ;
    var second_param;
    var first_id;
    var second_id;
    $scope.day = 'Monday';
    var service_name = '';
    var service_id = 0;
    $scope.service = {id:0,name:'Select Service'};
    $scope.offer_service = {id:0,name:'Select Service'};
    $scope.ruleList = [];
    var index = 1;
    $scope.addRuleList = function(offer){
        switch(offer){
            case 'Minimum Bill Amount':
                first_param = $scope.bill_amount;
                second_param = '';
                break;
            case 'Service Category':
                first_param = $scope.service.name;
                second_param = $scope.service.id;
                break;
            case 'Indidual Service':
                first_param = service_name;
                second_param = service_id;
                break;
            case 'Day Based':
                first_param = $scope.day;
                second_param = '';
                break;
            case 'Time Based':
                first_param = $scope.start_time;
                second_param = $scope.end_time;
                break;
            case 'Date Based':
                first_param = $scope.start_date;
                second_param = $scope.end_date;
                break;
        }


        var obj = {index:index,name:$scope.offer_rule,first_param:first_param,second_param:second_param}
        $scope.ruleList.push(obj);
        index++;
    }

    var i = 0;
    $scope.offer_list = [];
    var effect_type;
    var effect_param;
    var name;
    $scope.addValidList = function(valid){
        switch(valid){
            case 'Total Bill':
                effect_type = $scope.offer_valid;
                name = ''
                effect_param = '';
                break;
            case 'Service Category':
                effect_type = $scope.offer_valid;
                name = $scope.offer_service.name;
                effect_param = $scope.offer_service.id;
                break;
            case 'Indidual Service':
                effect_type = $scope.offer_valid;
                name =  $scope.offer_category;
                effect_param = offer_service_id;
                break;
        }


        var obj = {index:i,name:name,effect_type:effect_type,effect_param:effect_param}
        $scope.offer_list.push(obj);
        i++;
        console.log($scope.offer_list);
    }

    $scope.removeRule = function(list){
        $scope.ruleList =  $scope.ruleList.filter(function( obj ){
            return obj.index !== list.index;
        });
    }

    $scope.removeOffer = function(list){
        $scope.offer_list =  $scope.offer_list.filter(function( obj ){
            return obj.index !== list.index;
        });
    }

    $scope.showBox = function(){
        $scope.showSearchResultBox = true;
    }
    $scope.setCategoryDetail = function(ser){
        $scope.showSearchResultBox = false;
        $scope.category = ser.name;
        service_name    = ser.name;
        service_id      = ser.id;
    }

    $scope.setOfferCategoryDetail = function(ser){
        $scope.showSearchResultBox = false;
        $scope.offer_category       = ser.name;
        offer_service_id            = ser.id;
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
    $scope.offer_type_referral = 'Rupee Discount';
    $scope.offer_type_referee = 'Rupee Discount';

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