var phpro = angular.module('account', ['ngRoute']);


phpro.config(function($routeProvider) {

$routeProvider

        .when('/', {
                templateUrl : 'templates/accounting/home.html',
                controller  : 'HomeCtrl'
        })


        .when('/info', {
            templateUrl : 'templates/accounting/info.html',
            controller  : 'InfoCtrl'
        })

        
        .when('/other', {
                templateUrl : 'templates/accounting/other.html',
                controller  : 'OtherCtrl'
        });
});
var access_token = localStorage.getItem("access_token");
//var base_url = '52.33.37.151:8080';
var base_url = 'localhost:3000';


phpro.controller('HomeCtrl', function($scope,$http,$window,$rootScope){  
    var selected_id;

    var url = 'http://'+base_url+'/accounting/getPaymentMethods?access_token='+access_token;
    $http({
        method  : 'GET',
        url     : url           
    }).then(function(response){
        if(response.data.result.length > 0){
            $rootScope.accounts = response.data.result; 
            $scope.selected = response.data.result[0].id;
            selected_id     = response.data.result[0].id;
            $scope.acc_name = response.data.result[0].account_name;
            $scope.category = response.data.category; 
            $scope.category.unshift({id:0,category_name:'Select Category'});                         
            $scope.cat_id   = $scope.category[0].category_name;
            $scope.payment_log = response.data.payment_log;
        }
    });   
    
        
    $scope.accFormInfo = {};   
    $scope.saveData = function (){        
        var url = 'http://'+base_url+'/accounting/setPaymentMethod';   
        $scope.accFormInfo['access_token']  = access_token;
        var data =  JSON.stringify($scope.accFormInfo);
        $http({
            method  : 'POST',
            url     : url,
            data    : {payload:data}
        }).then(function(response){
            if(response.data.status == 'success'){
                $scope.accounts.unshift(response.data.result[0]);                 
                $scope.accFormInfo = {};
                $scope.selected = response.data.result[0].id;  
                $scope.acc_name = response.data.result[0].account_name;             
            }                                                  
        });               
    }

    $scope.getAccountStats =  function(select){        
        $scope.selected = select.id;   
        $scope.acc_name = select.name;
        $http({
            method  : 'GET',
            url     : 'http://'+base_url+'/accounting/getStatsByCategory',
            params  :{access_token:access_token,payment_type_id:select.id,account_name:select.name}          
        }).then(function(response){ 
            $scope.payment_log  = response.data.result;                       
        });   
    }

    $scope.allDate = function(){        
        $http({
            method  : 'GET',
            url     : 'http://'+base_url+'/accounting/getStatsByCategory',
            params  :{access_token:access_token,payment_type_id:$scope.selected,account_name:$scope.acc_name}          
        }).then(function(response){ 
            $scope.payment_log  = response.data.result;                       
        });
    }

    $scope.getAccountStatsByDate = function(date){        
        $http({
            method  : 'GET',
            url     : 'http://'+base_url+'/accounting/getAccountStatsByDate',
            params  :{access_token:access_token,payment_type_id:$scope.selected,date:date}          
        }).then(function(response){ 
            $scope.payment_log  = response.data.result;                        
        }); 
    }


    $scope.getSubCategory = function(cat){        
        if(cat== 'Vendor' || cat == 'Staff'){
            $scope.subCat = true;
            var url = 'http://'+base_url+'/accounting/getSubCategory';
            $http({
                method  : 'GET',
                url     : url ,
                params  :{access_token:access_token,category:cat}          
            }).then(function(response){               
                if(response.data.result.length > 0){                    
                    $scope.subCategory = response.data.result; 
                    if(cat=='Vendor')
                        $scope.testOpt = 'select Vendor';          
                    else
                        $scope.testOpt = 'select Staff';          
                }
            });
        }else{
            $scope.subCat = false;
        }
    }

    $scope.payForm = {};
    $scope.addTransaction = function(){        
        if($scope.payment_id == undefined){
            var payment_type_id = $scope.selected;
        }else{
            var payment_type_id  = $scope.payment_id;
        }
        if($window.type==3){
            $scope.payForm['type_from'] = $scope.payment_id_from;
            $scope.payForm['type_to']   = $scope.payment_id_to;
        }
        $scope.payForm['type'] = $window.type; //1=> pay, 2=>receive, 3=> transfer  
        $scope.payForm['cat_id']  = $scope.cat_id;
        $scope.payForm['subCat_id']  = $scope.subCat_id;        
        $scope.payForm['access_token']  = access_token;
        $scope.payForm['payment_type_id'] = payment_type_id;
        var url = 'http://'+base_url+'/accounting/addTransaction';   
        var data =  JSON.stringify($scope.payForm);
        $http({
            method  : 'POST',
            url     : url,
            data    : {payload:data}
        }).then(function(response){
            if(response.data.status == 'success' && payment_type_id == $scope.selected){
                $scope.payment_log.unshift(response.data.result[0]);
                $scope.accounts = response.data.account;  
                $scope.payForm = {}; 
            }             
        }); 
    }
    $scope.dateForm = {};

    $scope.checkEdit = 0;
    $scope.deleteActionBtn = function(){
        if($scope.checkEdit == 0){
            $scope.deleteAcc = true;
            $scope.checkEdit = 1;
        }else{
            $scope.deleteAcc = false;
            $scope.checkEdit = 0;
        }
    }

    $scope.deletAccount = function(acc){
        //if(window.confirm("are you sure ?")){
            $http({
                method  : 'GET',
                url     : 'http://'+base_url+'/accounting/deletAccount',
                params  :{access_token:access_token,payment_type_id:acc.id}          
            }).then(function(response){ 
                if(response.data.status == 'success'){            
                    if(response.data.result.length > 0){
                        $scope.accounts = response.data.result; 
                        $scope.selected = response.data.result[0].id;
                        selected_id     = response.data.result[0].id;
                        $scope.acc_name = response.data.result[0].account_name;
                        $scope.category = response.data.category; 
                        $scope.category.unshift({id:0,category_name:'Select Category'});                         
                        $scope.cat_id   = $scope.category[0].category_name;
                        $scope.payment_log = response.data.payment_log;
                    }
                }else{
                   window.alert(response.data.message); 
                }         
            }); 
        //}
    }


});

phpro.controller('InfoCtrl', function($scope,$http,$window,$rootScope) {
    console.log($rootScope.accounts);
    //$scope.accounts = $rootScope.accounts;
    var seclectCategory ;
    var selectId;

    $scope.transaction_type = 'Billing'
    var url = 'http://'+base_url+'/accounting/getInfoStats?access_token='+access_token;
    $http({
        method  : 'GET',
        url     : url,

    }).then(function(response){
        if(response.data.category.length > 0){
            seclectCategory = response.data.category[0].category_name;
            selectId = response.data.category[0].id;

            $scope.category = response.data.category; 
            $scope.vendors   = response.data.vendors;
            $scope.staffs    = response.data.staff;           
            $scope.payment_log = response.data.log;
        }

    }); 

     $scope.getSubCategory = function(cat){        
        if(cat== 'Vendor' || cat == 'Staff'){
            $scope.subCat = true;
            var url = 'http://'+base_url+'/accounting/getSubCategory';
            $http({
                method  : 'GET',
                url     : url ,
                params  :{access_token:access_token,category:cat}          
            }).then(function(response){               
                if(response.data.result.length > 0){                    
                    $scope.subCategory = response.data.result; 
                    if(cat=='Vendor')
                        $scope.testOpt = 'select Vendor';          
                    else
                        $scope.testOpt = 'select Staff';          
                }
            });
        }else{
            $scope.subCat = false;
        }
    }

     $scope.addTransaction = function(){        
        if($scope.payment_id == undefined){
            var payment_type_id = $scope.selected;
        }else{
            var payment_type_id  = $scope.payment_id;
        }
        if($window.type==3){
            $scope.payForm['type_from'] = $scope.payment_id_from;
            $scope.payForm['type_to']   = $scope.payment_id_to;
        }
        $scope.payForm['type'] = $window.type; //1=> pay, 2=>receive, 3=> transfer  
        $scope.payForm['cat_id']  = $scope.cat_id;
        $scope.payForm['subCat_id']  = $scope.subCat_id;        
        $scope.payForm['access_token']  = access_token;
        $scope.payForm['payment_type_id'] = payment_type_id;
        var url = 'http://'+base_url+'/accounting/addTransaction';   
        var data =  JSON.stringify($scope.payForm);
        $http({
            method  : 'POST',
            url     : url,
            data    : {payload:data}
        }).then(function(response){
            if(response.data.status == 'success' && payment_type_id == $scope.selected){
                // $scope.payment_log.unshift(response.data.result[0]);
                // $scope.accounts = response.data.account;  
                $scope.payForm = {}; 
            }             
        }); 
    }

    $scope.showInactive =  function(){
        //console.log('test');
        //item.toggle = !item.toggle;
        vendor.is_active = !vendor.is_active;
    }

    function getSum(result){
        var pay = 0;
        var get = 0;
        for(i=0; i<result.length; i++) {
           pay = pay + result[i].substraction;
           get = get + result[i].addition; 
        };
        var stats = {receive:get,pay:pay,balance:pay-get};
        return stats;
    }

    $scope.getCategoryStats = function(cat){
        seclectCategory = cat.category;
        selectId = cat.id;
        $scope.transaction_type = cat.name;
        $scope.sublist = 'zalon';
        var url = 'http://'+base_url+'/accounting/getTransactionList';
        $http({
            method  : 'GET',
            url     : url ,
            params  :{access_token:access_token,id:cat.id,category:cat.category}          
        }).then(function(response){               
            if(response.data.result.length > 0){                    
               $scope.payment_log = response.data.result; 
               $scope.stats = getSum(response.data.result);
            }else{
                $scope.payment_log = {}; 
            }            
        });
    } 

    $scope.allDate = function(){
        var url = 'http://'+base_url+'/accounting/getTransactionList';
        $http({
            method  : 'GET',
            url     : url ,
            params  :{access_token:access_token,id:selectId,category:seclectCategory}          
        }).then(function(response){               
            if(response.data.result.length > 0){                    
               $scope.payment_log = response.data.result; 
               $scope.stats = getSum(response.data.result);
            }else{
                $scope.payment_log = {}; 
            }            
        });
    }

    $scope.getCategoryStatsByDate = function(date){
        var url = 'http://'+base_url+'/accounting/getTransactionListByDate';
        $http({
            method  : 'GET',
            url     : url ,
            params  :{access_token:access_token,id:selectId,category:seclectCategory,date:date}          
        }).then(function(response){               
            if(response.data.result.length > 0){                    
               $scope.payment_log = response.data.result; 
               $scope.stats = getSum(response.data.result);
            }
             //console.log(response);
        });
    } 
});

phpro.controller('OtherCtrl', function($scope,$http,$window) {   

    var data = [];
    var url = 'http://'+base_url+'/accounting/getPurchaseOrder?access_token='+access_token;
    $http({
        method  : 'GET',
        url     : url,
    }).then(function(response){
        if(response.data.supplier.length > 0){
            $scope.supplier = response.data.supplier[0].name;
            $scope.supplier_id = response.data.supplier[0].id;
            $scope.list = response.data;
            $scope.inventory_list = response.data.list;
        }
    }); 

    $scope.getSupplierOrder = function(supplier){
        $scope.supplier_id = supplier.id
        data = [];
        $scope.supplier = supplier.name;
        var url = 'http://'+base_url+'/accounting/getSupplierOrder';
        $http({
            method  : 'GET',
            url     : url,
            params  : {access_token:access_token,supplier_id:supplier.id}   
        }).then(function(response){            
           $scope.list.order = response.data.order;
        });
    }
   
    $scope.addMoreBtn =  function(list){
        $scope.list.order.unshift({id:list.id,inventory:list.name,type:'dynamic',inventory_type:list.type});
    }  


    $scope.sub_total = 0;  

    $scope.setData = function(item){              
        $scope.sub_total = $scope.sub_total + item.data.total; 
        data.push({order_id:item.order_id,type:item.type,item:item.data}); 
        console.log(data);
    }

    
    $scope.deleteData = function(item){
        //console.log(item);

        $scope.sub_total = $scope.sub_total - item.data.total;         
        
        for(var i=0; i<data.length; i++){
            if(data[i].order_id == item.order_id && data[i].type == item.type){
                data.splice(i, 1);  //removes 1 element at position i 
                break;
            }
        } 
        console.log(data);
    }
    $scope.grand_total = function(){
        return $scope.sub_total + $scope.vat + $scope.cartrage + $scope.other;
    }    

    $scope.setOrderData = function(order){
        var info = [];        
        info.push(data);       
        var url = 'http://'+base_url+'/accounting/setOrderData';
        $http({
            method  : 'GET',
            url     : url,
            params  : {access_token:access_token,order:order,data:info,supplier_id:$scope.supplier_id}   
        }).then(function(response){            
            if(response.data.status == 'success'){
                $scope.list.order = [];
                data = [];
                $scope.sub_total = null;
                $scope.invoice = null,
                $scope.description = null,
                $scope.vat = null;
                $scope.cartrage = null;
                $scope.other = null;
            }
        });
    }

    $scope.deleteOrder = function(list,type,index,order_id){ 
        if(window.confirm("are you sure ?")){
            if(type != 'dynamic'){
                var url = 'http://'+base_url+'/accounting/deleteOrder';
                $http({
                    method  : 'GET',
                    url     : url,
                    params  : {access_token:access_token,order_id:order_id}   
                }).then(function(response){ 
                    if(response.data.status == 'success'){
                        list.splice(index, 1);    
                    }
                });
            }else{
               for(var i=0; i< $scope.list.order.length; i++){
                    if($scope.list.order[i].id == order_id && $scope.list.order[i].type == type){
                        $scope.list.order.splice(i, 1);  //removes 1 element at position i 
                        break;
                    }
                }  
            }
        }       
    }

    $scope.total =  function(){
        var total = parseInt($scope.sub_total || 0) + parseInt($scope.vat || 0) +
                    parseInt($scope.cartrage || 0) + parseInt($scope.other || 0);
        return total || 0;
    }
});