// create the module and name it phpro
// also include ngRoute for all our routing needs
var phpro = angular.module('segment', ['ngRoute']);

// configure our routes
phpro.config(function($routeProvider) {

$routeProvider
        // route for the index page
        .when('/', {
                templateUrl : 'templates/segment/seg.html',
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
// var base_url = 'zalonstyle.in:8080';
var base_url = 'localhost:3000';

phpro.controller('mainCtrl', function($scope,$http){
    $scope.hideRules = false;
    $scope.rules = [];
    $scope.segment_id = 0;
    $scope.categories = [
        {cat:'Gender'},
        {cat:'Membership'},
        {cat:'Service'},
        {cat: 'Total Amount Spent'},
        {cat: 'Packages'},
        {cat: 'Feedback'},
        {cat: 'Prepaid Card'},
        {cat: 'Last Visit'},
    ]

    $scope.lastId = 0;
    var data =  JSON.stringify($scope.rules);
    $http({
        method  : 'GET',
        url     : 'http://'+base_url+'/customer/segments',
        params  :{access_token:access_token} 
    }).then(function(response){
        $scope.segession_box = false;
        //$scope.searchList = response.data.result;
        $scope.segmentList = response.data.segments;
        //$scope.count = $scope.searchList.length;
    }); 

    $scope.loadMore = function(){
        var last = $scope.searchList[$scope.searchList.length-1].customer_id;
        if($scope.hideRules == false){
            var data =  JSON.stringify($scope.rules);
            $http({
                method  : 'GET',
                url     : 'http://'+base_url+'/customer/testFilter',
                params  :{access_token:access_token,lastId:last,rules:data} 
            }).then(function(response){
                $scope.segession_box = false;
                $scope.searchList = $scope.searchList.concat(response.data.result);
                //$scope.segmentList = response.data.segments;
                //$scope.count = $scope.searchList.length;
            });

        }else{
            $http({
                method  : 'GET',
                url     : 'http://'+base_url+'/customer/getSegmentData',
                params  :{access_token:access_token,segment_id:$scope.segment_id,lastId:last} 
            }).then(function(response){
                $scope.segession_box = false;
                $scope.searchList = $scope.searchList.concat(response.data.result);
                //$scope.count = $scope.searchList.length;
                //$scope.segmentRules = response.data.rules;
            }); 
        }
    };

    var clearServiceFilter = function(){
        $scope.serviceBox = false;
        $scope.searchServiceBox = false;
        $scope.inputValue = false;
    }

    $scope.count = 0;
    $scope.category = 'SELECT CATEGORY';
    $scope.subCat = 'SELECT OPTION';
    $scope.serviceCat = 'SELECT SERVICE CATEGORY';
    $scope.childCat = 'SELECT MONTH';
    $scope.selectedCategory = '';
    $scope.getSubCategory = function(cat){
        $scope.hideRules = false;
        $scope.showSegmentRules = false;
        $scope.childCat = 'SELECT MONTH';
        $scope.selectedCategory = cat;
        $scope.category = cat;
        switch(cat){
            case 'Gender':
                $scope.subCat = 'SELECT GENDER';
                $scope.subCategory = [{id:1, value:'Male'},{id:0, value:'Female'}];
                clearServiceFilter();
                $scope.childCategory = false;
                break;
            case 'Membership':
                $scope.subCat = 'SELECT EXPIRY';
                $scope.subCategory = [{id:0,value:'Expired'},{id:1,value:'Expire In'}];
                clearServiceFilter();
                $scope.childCategory = true;
                $scope.childValues = [{id:1,value:'1 Month'},{id:3,value:'3 Months'},{id:6,value:'6 Months'},{id:12,value:'12 Months'}];
                break;

            case 'Last Visit':
                $scope.subCat = 'SELECT';
                $scope.subCategory = [{id:1,value:'Is Within'},{id:0,value:'Is Not Within'}];
                clearServiceFilter();
                $scope.childCategory = true;
                $scope.childValues = [{id:1,value:'1 Month'},{id:3,value:'3 Months'},{id:6,value:'6 Months'},{id:12,value:'12 Months'}];
                break;

            case 'Prepaid Card':
                $scope.subCat = 'SELECT EXPIRY';
                $scope.subCategory = [{id:0,value:'Expired'},{id:1,value:'Expire In'}];
                clearServiceFilter();
                $scope.childCategory = true;
                $scope.childValues = [{id:1,value:'1 Month'},{id:3,value:'3 Months'},{id:6,value:'6 Months'},{id:12,value:'12 Months'}];
                break;

            case 'Service':
                $scope.subCat = 'SELECT OPTION';
                $scope.subCategory = [{id:0,value:"Has't tried"},{id:1,value:"Has tried"}];
                $scope.serviceCategory = [{id:1,value:"Body"},{id:2,value:"Hair"},{id:3,value:"Nail"},{id:4,value:"Face"},{id:5,value:"Hair Removal"},{id:6,value:"Massage"}];
                $scope.serviceBox = true;
                $scope.childCategory = false;
                $scope.inputValue = false;
                $scope.searchServiceBox = true;
                break;
            case 'Total Amount Spent':
                $scope.subCat = 'SELECT OPTION';
                $scope.subCategory = [{id:0,value:"Less Than"},{id:1,value:"More Than"}];
                $scope.serviceBox = false;
                $scope.searchServiceBox = false;
                $scope.childCategory = false;
                $scope.inputValue = true;
                break;
            case 'Packages':
                $scope.subCat = 'SELECT EXPIRY';
                $scope.subCategory = [{id:0,value:'Expired'},{id:1,value:'Expire In'}];
                clearServiceFilter();
                $scope.childCategory = true;
                $scope.childValues = [{id:1,value:'1 Month'},{id:3,value:'3 Months'},{id:6,value:'6 Months'},{id:12,value:'12 Months'}];
                break;
            case 'Feedback':
                $scope.subCat = 'SELECT FEEDBACK';
                $scope.subCategory = [{id:1, value:'Has Given Low'},{id:0, value:'Has Given High'}];
                $scope.childCategory = false;
                clearServiceFilter();
                break;
        }
    } 

    var removeByAttr = function(arr, attr, value){
        var i = arr.length;
        while(i--){
            if( arr[i] 
               && arr[i].hasOwnProperty(attr) 
               && (arguments.length > 2 && arr[i][attr] === value ) ){ 
               arr.splice(i,1);
            }
        }
        return arr;
    }

    var index = 1;
    $scope.getSubCategoryStats = function(param){
        $scope.selectedSubCategory = param.id;
        $scope.subCat = param.value;
        var last = 0;
        if(param.category == 'Gender' || param.value == 'Expired'){
            $scope.limit = 50;
            $scope.childCategory = false;
            //$scope.rules = removeByAttr($scope.rules,'category','Gender');
            $scope.rules.push({index:index,category:param.category,subCategory:0,value:param.value,subValue:$scope.subCat,type:''});
            index++;
            var data =  JSON.stringify($scope.rules);
            if($scope.rules.length != 0){
                $http({
                    method  : 'GET',
                    url     : 'http://'+base_url+'/customer/testFilter',
                    params  :{access_token:access_token,rules:data,lastId:last} 
                }).then(function(response){
                    $scope.searchList = response.data.result;
                    if(last == 0){
                        $scope.count = response.data.count;    
                    }
                }); 
            }else{
                $scope.searchList = [];
            }  

        }else if(param.category == 'Total Amount Spent' || param.category == 'Service'){
            $scope.childCategory = false;    
        }else{
            $scope.childCategory = true;
        }
        
    }

    
    $scope.getChildCategoryStats = function(param){
        $scope.limit = 50;
        if(param.type == 'category'){
            $scope.str = '';
        }else{
            $scope.str = param.value;
        }
        var last = 0;
        $scope.serviceCat = param.value;
        $scope.childCat = param.value;
        //$scope.rules = removeByAttr($scope.rules,'category',param.category);
        $scope.rules.push({index:index,category:param.category,subCategory:$scope.selectedSubCategory,value:param.id,subCat:$scope.subCat,subValue:param.value,type:param.type});
        index++;
        var data =  JSON.stringify($scope.rules);
        if($scope.rules.length != 0){
            $http({
                method  : 'GET',
                url     : 'http://'+base_url+'/customer/testFilter',
                params  :{access_token:access_token,rules:data,lastId:last} 
            }).then(function(response){
                $scope.segession_box = false;
                $scope.searchList = response.data.result;
                if(last == 0){
                    $scope.count = response.data.count;    
                }
            });
        }else{
            $scope.searchList = [];
        }
       
    }

    $scope.resetFilter = function(){
        index = 1;
        $scope.rules  = [];
    }

    $scope.removeRule = function(index){
        var last = 0;
        $scope.limit = 50;
        if(index == 'all'){
            $scope.rules  = [];   
        }else{
            $scope.rules = removeByAttr($scope.rules,'index',index);    
        }
        var data =  JSON.stringify($scope.rules);
        if($scope.rules.length != 0){
            $http({
                method  : 'GET',
                url     : 'http://'+base_url+'/customer/testFilter',
                params  :{access_token:access_token,rules:data,lastId:last} 
            }).then(function(response){
                $scope.searchList = response.data.result;
                if(last == 0){
                    $scope.count = response.data.count;    
                }
            });
        }else{
            $scope.searchList = [];
        }
    }

    $scope.serachService = function(str){
        $http({
            method  : 'GET',
            url     : 'http://'+base_url+'/customer/searchService',
            params  :{access_token:access_token,serachStr:str} 
        }).then(function(response){
            $scope.segession_box = true;
            $scope.serviceList = response.data.result;
            //console.log(response.data.result);
        }); 
    }

    $scope.segment = '';
    $scope.saveCustomerSegment = function(){
        info = {};
        info['access_token']    = access_token;
        info['segment']         = $scope.segment;
        info['rules']           = $scope.rules;  
        if($scope.segment.length != 0 && $scope.segment != '' && $scope.rules.length != 0){
            var data =  JSON.stringify(info);
            $http({
                method  : 'POST',
                url     : 'http://'+base_url+'/customer/saveCustomerSegment',
                data  : {payload:data}
            }).then(function(response){
                var list =  response.data.segment;
                $scope.segmentList.push({id:list[0].id,segment_name:list[0].segment_name});
            }); 
        }else{
            swal('Please check your segmentation rules');
        }     
            
    }

    $scope.getSegmentData = function(segment_id){
        $scope.limit = 50;
        var last = 0;
        $scope.hideRules = true;
        $scope.showSegmentRules = true;
        $scope.segment_id = segment_id;
        $scope.rules = [];
        $http({
            method  : 'GET',
            url     : 'http://'+base_url+'/customer/getSegmentData',
            params  :{access_token:access_token,segment_id:segment_id,lastId:last} 
        }).then(function(response){
            $scope.segession_box = false;
            $scope.searchList = response.data.result;
            if(last ==0){
                $scope.count = response.data.count;
            }
            $scope.segmentRules = response.data.rules;
        }); 
    }

    $scope.deleteSegment = function(segment_id){
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
                url     : 'http://'+base_url+'/customer/deleteSegment',
                params  :{access_token:access_token,segment_id:segment_id} 
            }).then(function(response){
                 swal("Deleted", "segment has been deleted!", "success")   
                $scope.segmentList = response.data.segments;
            }); 
        });
    }

});

