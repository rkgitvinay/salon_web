// create the module and name it phpro
// also include ngRoute for all our routing needs
var phpro = angular.module('manage', ['ngRoute']);

// configure our routes
phpro.config(function($routeProvider) {

$routeProvider
        // route for the index page
        .when('/', {
                templateUrl : 'templates/manage/service.html',
                controller  : 'serviceCtrl'
        })

        // route for the FAQ page
        .when('/sales', {
        templateUrl : 'templates/manage/employee.html',
        controller  : 'employeeCtrl'
        })

        // route for the contact page
        .when('/customers', {
                templateUrl : 'templates/manage/inventory.html',
                controller  : 'inventoryCtrl'
        });
});


if(localStorage.getItem("access_token") == null){
    window.location = 'login.html';
}else{    
    var access_token = localStorage.getItem("access_token");  
}
// var base_url = 'zalonstyle.in:8080';
var base_url = 'localhost:3000';

phpro.controller('serviceCtrl', function($scope,$http) {
    $scope.selected = 'Body';
    $scope.selectedId = 1;

    $scope.services = [
        {id:1,name:'Body'},
        {id:2,name:'Hair'},
        {id:3,name:'Nail'},
        {id:4,name:'Face'},
        {id:5,name:'Hair Removal'},
        {id:6,name:'Massage'}
    ]

    var lineup = {};
    lineup['access_token'] = access_token;
    lineup['has_lineup']   = 1;
    lineup['service_id']   = $scope.selectedId;
    var data =  JSON.stringify(lineup);
    $http({
        method  : 'POST',
        url     : 'http://'+base_url+'/service/get_service_lineup',
        data  : {payload:data}
    }).then(function(response){
       if(response.data.status == 'success'){
            $scope.lineup = response.data.payload;
       }
    });  

   
    $scope.getServiceCategory = function(service){
        $scope.selected = service.name;
        $scope.selectedId = service.id;

        var lineup = {};
        lineup['access_token'] = access_token;
        lineup['has_lineup']   = 1;
        lineup['service_id']   = service.id;
        var data =  JSON.stringify(lineup);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/service/get_service_lineup',
            data  : {payload:data}
        }).then(function(response){
           if(response.data.status == 'success'){
                $scope.lineup = response.data.payload;
           }
        });  
    }

    $scope.addNewServiceLineup = function(){
        var lineup = {};
        lineup['access_token'] = access_token;
        lineup['has_lineup']   = 0;
        lineup['service_id']   = $scope.selectedId;
        var data =  JSON.stringify(lineup);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/service/get_service_lineup',
            data  : {payload:data}
        }).then(function(response){
           if(response.data.status == 'success'){
                $scope.categories = response.data.payload;
                $scope.categories.unshift({category_id:0,category_name:'Service Category'});
                $scope.category = {category_id:0,category_name:'Service Category'};
           }
           //console.log(response);
        });  

        var addNew = {};
        addNew['access_token'] = access_token;
        addNew['is_add']   = 1;
        var data =  JSON.stringify(addNew);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/service/get_category_detail',
            data  : {payload:data}
        }).then(function(response){
           if(response.data.status == 'success'){
                $scope.stylistCategory = response.data.price;
                $scope.roles = response.data.staff;
           }
        });  
    }


    $scope.user = {
        roles: []
    };
      
    $scope.toggleUserRole = function(role){
        if($scope.user.roles.indexOf(role) == -1){
          $scope.user.roles.push(role);
        } 
        else{
          $scope.user.roles.splice($scope.user.roles.indexOf(role),1);
        }
    };



    var staffBased=false;
    var genderBased=false;
    $scope.setOptions = function(e){
        if(e.type =='staff'){
            if(e.value =='true'){
                staffBased = true;
            }else{
                staffBased = false;
            }
        }else if(e.type == 'gender'){
            if(e.value =='true'){
                genderBased = true;
            }else{
                genderBased = false;
            }
        }
        
        if(staffBased == true && genderBased == false){
            $scope.staffBased = true;
            $scope.initialScreen = true;
            $scope.genderBased = false;
        }else if(staffBased == false && genderBased == true){
            $scope.genderBased = true;
            $scope.staffBased = false;
            $scope.initialScreen = true;
        }else if(staffBased == true && genderBased == true){
            $scope.staffGenderBased = true;
            $scope.genderBased = false;
            $scope.staffBased = false;
            $scope.initialScreen = true;
        }else{
            $scope.initialScreen = false;
            $scope.staffGenderBased = false;
            $scope.genderBased = false;
            $scope.staffBased = false;
        }
    }

    $scope.addServiceLineUp = function(form){
        console.log($scope.stylistCategory);
    }

    $scope.selectCategory = function(val){
        $scope.serviceName = val.category_name;
    }


});

