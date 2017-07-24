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
        console.log(role);
        
        if($scope.user.roles.indexOf(role) == -1){
            if(role.checked == true){
                $scope.user.roles.push(role);
            }else{
                $scope.user.roles.splice($scope.user.roles.indexOf(role),1);
            }
        } 
        else{
            if(role.checked==false){
                $scope.user.roles.splice($scope.user.roles.indexOf(role),1);
            }
        }
       console.log($scope.user.roles);
    };

    $scope.notifyValue = 'false';
    $scope.notifyService = function(val){
        if(val == true){
            $scope.reminderBox = true;
            $scope.notifyValue = 'true';
        }else{
            $scope.reminderBox = false;
            $scope.notifyValue = 'false';
        }
    }

    $scope.notifyMSG = 'Hi [customer], it has been [days] since your last [service]';

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
    $scope.notifyDays = 0;
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
        lineup['notify']            = $scope.notifyValue;
        lineup['notifyDays']        = $scope.notifyDays;
        lineup['notifyMSG']         = $scope.notifyMSG;

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
                //console.log(response);
                $scope.addNewServiceLineup();
                $scope.setOptions({type:'staff',value:'false'});
                $scope.setOptions({type:'gender',value:'false'});
                var obj = {id:$scope.selectedId,name:$scope.selected}
                $scope.getServiceCategory(obj);
                $scope.common_price = '';
                $scope.male_price = '';
                $scope.female_price = '';
                $scope.duration = '';
                $scope.serviceName = '';
                $scope.description = '';
            }
        });  


    }

    $scope.deleteService = function(line){
        var deleteService = {};
        deleteService['access_token']   = access_token;
        deleteService['service_id']     = line.service_id;
        deleteService['category_id']    = line.category_id;
        deleteService['category_name']  = line.category_name;
        deleteService['service_id']     = line.service_id;
        var data =  JSON.stringify(deleteService);

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
                method  : 'POST',
                url     : 'http://'+base_url+'/service/deleteService',
                data  : {payload:data}
            }).then(function(response){
               if(response.data.status == 'success'){
                    swal("Deleted!", "Your bill has been deleted.", "success");
                    var obj = {id:$scope.selectedId,name:$scope.selected}
                    $scope.getServiceCategory(obj);
               }
            }); 
              
        });
        
            
    }

    $scope.selectCategory = function(val){
        //console.log(val);
        $scope.service_category = val.category_name;
        if($scope.selectedId != 7){
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

    $scope.detail;
    $scope.getServiceDetail = function(detail){
        //console.log(detail);

        $scope.detail = detail;
        $scope.service_id = {id: detail.service_id}
        $scope.serviceNameEdit = detail.category_name;
        var getCat = {};
        getCat['access_token'] = access_token;
        getCat['service_id']   = detail.service_id;
        var data =  JSON.stringify(getCat);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/service/get_category',
            data  : {payload:data}
        }).then(function(response){
           if(response.data.status == 'success'){
                $scope.serviceCategory = response.data.payload;
                $scope.category_id = {id:detail.category_id};
           }
        }); 


        var addNew = {};
        addNew['access_token'] = access_token;
        addNew['is_add']   = 0;
        addNew['category_id'] = detail.category_id;
        addNew['category_name']   = detail.category_name;
        var data =  JSON.stringify(addNew);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/service/get_category_detail',
            data  : {payload:data}
        }).then(function(response){
            var info = response.data.info;

            if(info.staff_based == 'on' && info.gender_based == 'off'){
                $scope.staffBased = true;
                $scope.initialScreen = true;
                $scope.genderBased = false;
            }else if(info.staff_based == 'off' && info.gender_based == 'on'){
                $scope.male_price = info.male_price;
                $scope.female_price = info.female_price;
                $scope.duration = info.duration;
                $scope.genderBased = true;
                $scope.staffBased = false;
                $scope.initialScreen = true;
            }else if(info.staff_based == 'on' && info.gender_based == 'on'){
                $scope.staffGenderBased = true;
                $scope.genderBased = false;
                $scope.staffBased = false;
                $scope.initialScreen = true;
            }else{
                $scope.common_price = info.common_price;
                $scope.duration     = info.duration;

                $scope.initialScreen = false;
                $scope.staffGenderBased = false;
                $scope.genderBased = false;
                $scope.staffBased = false;
            }

            $scope.stylistCategory = response.data.price;
            $scope.roles = response.data.staff;
            //$scope.user.roles = response.data.staff;

            $scope.roles.forEach(function(e){
                if(e.checked == 'true'){
                    $scope.user.roles.push(e);
                }
            });
        });  
    }

    $scope.changeService = function(service){
        //console.log(service);

        var getCat = {};
        getCat['access_token'] = access_token;
        getCat['service_id']   = service.id;
        var data =  JSON.stringify(getCat);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/service/get_category',
            data  : {payload:data}
        }).then(function(response){
           if(response.data.status == 'success'){
                $scope.serviceCategory = response.data.payload;
                $scope.category_id = {id:$scope.serviceCategory[0].id};
           }
        }); 
    }

    $scope.updateServiceCategory = function(){

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

        // var lineup = {};
        // lineup['access_token']      = access_token;
        // lineup['service_id']        = $scope.selectedId;
        // lineup['is_new']            = 1;   
        // lineup['service_category']  = $scope.service_category;
        // lineup['gender_based']      = genderBased == true ? 'on' : 'off';
        // lineup['staff_based']       = staffBased == true ? 'on' : 'off';
        // lineup['category_name']     = $scope.serviceName;
        // lineup['description']       = $scope.description;
        // lineup['notify']            = $scope.notifyValue;
        // lineup['notifyDays']        = $scope.notifyDays;
        // lineup['notifyMSG']         = $scope.notifyMSG;

        // var info = {};
        // info['info'] = lineup;
        // info['staff']             = staff_list;
        // info['price']             = price_obj;
        // var data =  JSON.stringify(info);
       

        var update = {};
        update['access_token']      = access_token;
        update['detail']            = $scope.detail;
        update['service_id']        = $scope.service_id.id;
        update['category_id']       = $scope.category_id.id;
        update['category_name']     = $scope.serviceNameEdit;
        update['gender_based']      = genderBased == true ? 'on' : 'off';
        update['staff_based']       = staffBased == true ? 'on' : 'off';
        update['price']             = price_obj;
        update['staff']             = staff_list;
        update['notify']            = $scope.notifyValue;
        update['notifyDays']        = $scope.notifyDays;
        update['notifyMSG']         = $scope.notifyMSG;
        var data =  JSON.stringify(update);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/service/updateServiceCategory',
            data  : {payload:data}
        }).then(function(response){
           if(response.data.status == 'success'){
                $scope.user.roles = [];
                var obj = {id:$scope.selectedId,name:$scope.selected}
                $scope.getServiceCategory(obj);
                angular.element('#myModal1').modal('hide');
           }
           
        }); 
        //console.log(update);

    }

});

phpro.controller('employeeCtrl', function($scope,$http) {

    $scope.gender = '';
    var is_new = 1;
    $scope.emp_category = [{id:0,category:'Select Category'}];

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
        is_new = 0;
        $scope.staff_name = val.name;
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
            $scope.emp_category.unshift({id:0,category:'Select Category'});
            $scope.emp_gender = response.data.staff.gender;
            $scope.title = {id:0,category:'Select Category'};
            $scope.deleteStaffBtn = true;

            $scope.emp_services.forEach(function(e){
                if(e.checked == 'true'){
                    $scope.user.emp_services.push(e);
                }
            });
        });
    }

    $scope.test = function(test){
        console.log(test);
        $scope.emp_jobtitle = test.category;
    }

    $scope.user = {
        emp_services: []
    };
      
    $scope.toggleUserRole = function(role){
        if($scope.user.emp_services.indexOf(role) == -1){
            if(role.checked == true){
                $scope.user.emp_services.push(role);
            }else{
                $scope.user.emp_services.splice($scope.user.emp_services.indexOf(role),1);
            }
        } 
        else{
            if(role.checked==false){
                $scope.user.emp_services.splice($scope.user.emp_services.indexOf(role),1);
            }
        }
        console.log($scope.user.emp_services);
    };

    var checkedList = [];
    $scope.checkAll = function(){
        $scope.emp_services.forEach(function(e){
            checkedList.push({category_id:e.category_id,category_name:e.category_name,checked:'true'});
            $scope.user.emp_services.push(e);
        });
        $scope.emp_services = checkedList;
    }; 

    var unCheckedList = [];
    $scope.uncheckAll = function(){
        $scope.emp_services.forEach(function(e){
            unCheckedList.push({category_id:e.category_id,category_name:e.category_name,checked:'false'});
            $scope.user.emp_services = [];
        });
        $scope.emp_services = unCheckedList;
    };

    $scope.setGender = function(gen){
        $scope.gender = gen.gender;
    }

    $scope.savestaff = function(){
        var arremp = {};
        arremp['access_token'] =  access_token;
        arremp['staff_id']     =  $scope.id;
        arremp['category']     =  $scope.user.emp_services;
        arremp['name']         = $scope.emp_name;
        arremp['email']        = $scope.emp_email;
        arremp['mobile']       =   $scope.emp_mobile;
        arremp['title']        =  $scope.emp_jobtitle;
        arremp['category_name'] =  $scope.emp_jobtitle;
        arremp['gender']        =   $scope.gender;
        var data =  JSON.stringify(arremp);
        if(is_new == 0){
            $http({
                method  : 'POST',
                url     : 'http://'+base_url+'/set_staff_details',
                data  : {payload:data}
            }).then(function(response){
                if(response.data.status == 'ok' || response.data.status == 'success'){
                    $scope.createStaff();
                    $scope.getList();
                }
            });

        }else{
            $http({
                method  : 'POST',
                url     : 'http://'+base_url+'/add_new_staff',
                data  : {payload:data}
            }).then(function(response){
                if(response.data.status == 'success'){
                    $scope.createStaff();
                    $scope.getList();
                }
            });
        }
       
    }

    $scope.deleteStaff = function(){
        var del = {};
        del['access_token'] =  access_token;
        del['staff_id']     =  $scope.id;
        var data =  JSON.stringify(del);
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
                method  : 'POST',
                url     : 'http://'+base_url+'/delete_staff',
                data  : {payload:data}
            }).then(function(response){
                if(response.data.status == 'success'){
                    swal("Deleted", "Employee has been deleted!", "success");   
                    $scope.createStaff();
                    $scope.getList();
                }
            });
        });
    }

    $scope.createStaff = function(){
        $scope.deleteStaffBtn = false;
        is_new = 1;
        $scope.staff_name = '';
        $scope.emp_name = '';
        $scope.emp_mobile = '';
        $scope.emp_jobtitle = '';
        $scope.emp_email = '';
        var accFormInfo = {};
        var url = 'http://'+base_url+'/get_salon_categories';
        accFormInfo['access_token']  = access_token;
        var data =  JSON.stringify(accFormInfo);
        $http({
            method  : 'POST',
            url     : url,
            data    : {payload:data}
        }).then(function(response){
            if(response.data.status == 'success'){
                $scope.emp_services = response.data.staff.services;
                $scope.emp_category = response.data.staff.categories;
                $scope.title = {id:0,category:'Select Category'};
                console.log(response);     
            }                                                  
        }); 
    }

    $scope.getList = function(){
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
    }
   

});

phpro.controller('inventoryCtrl', function($scope,$http) {
    $scope.hsn_code = [29141100,33041000,33041090,33042000,33043000,33049040,33049110,33049120,33049190,33049930,33049990,33051090,
        33052000,33059050,33059090,33074100];
    $scope.hsn_no = 29141100;
    //console.log($scope.hsn_no);     


    $scope.selectAction = function() {
        console.log($scope.hsn_no);
    };

    $scope.accFormInfo = {};

    var url = 'http://'+base_url+'/inventory/getInventory';
    $scope.accFormInfo['access_token']  = access_token;
    var data =  JSON.stringify($scope.accFormInfo);
    $http({
        method  : 'POST',
        url     : url,
        data    : {payload:data}
    }).then(function(response){
        if(response.data.status == 'success'){

          
            $scope.array12 = response.data.data;  
            console.log( $scope.array12);     
        }                                                  
    });   

    var new_arr = {};
    $scope.createproduct = function(){
        new_arr['access_token']       = access_token;
        new_arr['category']           = $scope.inv_category;
        new_arr['item_name']          = $scope.inv_brand;
        new_arr['sub_category']       = $scope.inv_subcategory;
        new_arr['barcode']            = "dsdsa";
        new_arr['selling_price']      = $scope.inv_mrp;
        new_arr['refill']             = $scope.inv_qty;
        new_arr['hsn_number']         =$scope.hsn_no;
        var data                      = JSON.stringify(new_arr);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/inventory/addInventory',
            data  : {payload:data}
        }).then(function(response){
            console.log(response);
            // angular.element('#modal').modal('hide');
             $scope.inv_category = '';
             $scope.inv_brand='';
             $scope.inv_subcategory='';
             $scope.inv_mrp='';
             $scope.hsn_no='';
             $scope.inv_qty='';

        }); 
    }    

    $scope.close = function(){
        angular.element('#modal').modal('hide');
    }

    var new_arr1 = {};
    $scope.removeItem1 = function(row){
        console.log(row);
        $scope.inventoryid = row.id;
        $scope.inventorytype = row.type;
          new_arr1['access_token']     = access_token;
        new_arr1['category']         = row.type;
        new_arr1['id']        = row.id;
        var data                    = JSON.stringify(new_arr1);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/inventory/deleteInventory',
            data  : {payload:data}
        }).then(function(response){
            console.log(response);
            // angular.element('#modal').modal('hide');
                    // $scope.info = removeByAttr($scope.info,'index',index);
             
            var index = -1;     
            var comArr = eval( $scope.array12 );
            for( var i = 0; i < comArr.length; i++ ) {
                if( comArr[i].id === row.id ) {
                    index = i;
                    break;
                }
            }
            if( index === -1 ){
                alert( "Something gone wrong" );
            }
            $scope.array12.splice( index, 1 ); 

        }); 


    }

    $scope.selectAction1 = function() {
        console.log($scope.inv_hsn1);
    };

    $scope.addtomodal = function(row){
        console.log(row);
        $scope.inv_id1 = row.id;
        $scope.inv_brand1 = row.item_name;
        $scope.inv_mrp1 = row.mrp;
        $scope.inv_qty1 = row.type;
        $scope.inv_hsn1 = row.hsn_number;

    }
    
    var arr0 = {};

    $scope.saveproduct = function(){

        arr0['access_token']     = access_token;
        arr0['id']               = $scope.inv_id1;
        arr0['price']            =  $scope.inv_mrp1;
        arr0['reminder']         = $scope.inv_qty1;
        arr0['hsn_number']       = inv_hsn1;
       
        var data                =  JSON.stringify(arr0);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/inventory/updateInventory',
            data  : {payload:data}
        }).then(function(response){
            console.log(response);
            angular.element('#editModal').modal('hide');
        }); 
    }

});