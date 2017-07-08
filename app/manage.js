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
        .when('/employee', {
        templateUrl : 'templates/manage/employee.html',
        controller  : 'employeeCtrl'
        })

        // route for the contact page
        .when('/inventory', {
                templateUrl : 'templates/manage/inventory.html',
                controller  : 'inventoryCtrl'
        });
});


if(localStorage.getItem("access_token") == null){
    window.location = 'login.html';
}else{    
    var access_token = localStorage.getItem("access_token");  
}
var base_url = 'zalonstyle.in:8080';
// var base_url = 'localhost:3000';

phpro.controller('serviceCtrl', function($scope,$http) {
    $scope.selected = 'Body';
    $scope.selectedId = 1;

    $scope.services = [
        {id:1,name:'Body'},
        {id:2,name:'Hair'},
        {id:3,name:'Nail'},
        {id:4,name:'Face'},
        {id:5,name:'Hair Removal'},
        {id:6,name:'Massage'},
        {id:7,name:'Others'}
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
       }else if(response.data.status == 'empty'){
            $scope.lineup = [];
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
           }else if(response.data.status == 'empty'){
                $scope.lineup = [];
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
    $scope.service_category = '';
    $scope.addServiceLineUp = function(){
        if(staffBased == false && genderBased == false){
            var price_obj = {common_price:$scope.common_price,duration:$scope.duration}
        }else if(staffBased == false && genderBased == true){
            var price_obj = {male_price:$scope.male_price,female_price:$scope.female_price,duration:$scope.duration}
        }else{
            var price_obj = $scope.stylistCategory;
        }

        var staff_list = [];
        $scope.user.roles.forEach(function(row){
            var obj = {category_name:row.name,staff_id:row.staff_id}
            staff_list.push(obj);
        });
        var lineup = {};
        lineup['access_token']      = access_token;
        lineup['service_id']        = $scope.selectedId;
        lineup['is_new']            = 1;   
        lineup['service_category']  = $scope.service_category;
        lineup['gender_based']      = genderBased == true ? 'on' : 'off';
        lineup['staff_based']       = staffBased == true ? 'on' : 'off';
        lineup['category_name']     = $scope.serviceName;
        lineup['description']       = $scope.description;
        

        var info = {};
        info['info'] = lineup;
        info['staff']             = staff_list;
        info['price']             = price_obj;
        var data =  JSON.stringify(info);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/service/set_category_detail',
            data  : {payload:data}
        }).then(function(response){
            console.log(response);
            if(response.data.status == 'success'){
                console.log(response);
                $scope.addNewServiceLineup();
                $scope.setOptions({type:'staff',value:'false'});
                $scope.setOptions({type:'gender',value:'false'});
                $scope.common_price = '';
                $scope.male_price = '';
                $scope.female_price = '';
                $scope.duration = '';
                $scope.serviceName = '';
                $scope.description = '';
            }
        });  


    }

    $scope.selectCategory = function(val){
        $scope.service_category = val.category_name;
        if(selectedId != 7){
           $scope.serviceName = val.category_name; 
       }
    }

    var refreshPanel = function(){
        genderBased = false;
        staffBased = false;
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

        $scope.common_price = '';
        $scope.duration = '';
    }

});

phpro.controller('employeeCtrl', function($scope,$http) {
    $scope.title = {id:0,category:'Select Category'};
    var lineup = {};
    lineup['access_token']  = access_token;
    lineup['staff_id']      = 0;
    
    var data =  JSON.stringify(lineup);
    $http({
        method  : 'POST',
        url     : 'http://'+base_url+'/get_all_staff',
        data  : {payload:data}
    }).then(function(response){
        $scope.staffList = response.data.staff;
    });  

    $scope.getStaffDetail = function(val){
        var get_list = {};
        get_list['access_token']    = access_token;
        get_list['staff_id']          = val.id;
        var data =  JSON.stringify(get_list);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/get_all_staff',
            data  : {payload:data}
        }).then(function(response){
            $scope.emp_name = response.data.staff.name;
            $scope.id = response.data.staff.staff_id;
            $scope.emp_jobtitle = response.data.staff.category;
            $scope.emp_mobile = response.data.staff.mobile;
            $scope.emp_email = response.data.staff.email;
            $scope.emp_services = response.data.staff.services;
            $scope.emp_category = response.data.staff.categories;
            $scope.emp_gender = response.data.staff.gender;
            // $scope.title = {id:54,category: $scope.emp_jobtitle};
            // console.log($scope.title);
        });
    }

    $scope.test = function(test){
        console.log(test);
    }

    $scope.user = {
        emp_services: []
    };
      
    $scope.toggleUserRole = function(role){
        if($scope.user.emp_services.indexOf(role) == -1){
            $scope.user.emp_services.push(role);
            console.log($scope.user.emp_services);
        }else{
            $scope.user.emp_services.splice($scope.user.emp_services.indexOf(role),1);
            console.log($scope.user.emp_services);
        }
    };

    $scope.checkAll = function() {
        for (i = 0; i < $scope.emp_services.length; i++)
            $scope.checkNth(i);
            if($scope.user.emp_services.indexOf($scope.emp_services[i]) == -1){
                $scope.user.emp_services.push($scope.emp_services[i]);
                console.log($scope.user.emp_services);
            } 
    }; 

    $scope.checkNth = function(i) {
        $scope.emp_services[i].is_select = !$scope.emp_services[i].is_select;
        $scope.toggleUserRole($scope.emp_services[i]);
    }
      
    $scope.uncheckAll = function() {
        for (i = 0; i < $scope.emp_services.length; i++)
            $scope.emp_services[i].is_select = false;
            $scope.user.is_select = [];
    };
    //  console.log($scope.user.emp_services);
      
});

