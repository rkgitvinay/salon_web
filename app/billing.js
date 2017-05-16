var phpro = angular.module('billing', ['ngRoute']);

phpro.config(function($routeProvider) {

$routeProvider
       
        .when('/', {
            templateUrl : 'templates/billing/bill.html',
            controller  : 'mainCtrl'
        })
       
        .when('/sales', {
            templateUrl : 'templates/sales.html',
            controller  : 'faqCtrl'
        })

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

phpro.controller('mainCtrl', function($scope,$http,$window) {
    $scope.invoice = 0;
    $scope.invoice_new = 0;

    
    var get_bill_info = function(){
        bill_info = {};
        bill_info['access_token']= access_token;
        var data =  JSON.stringify(bill_info);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/billing/get_bill_info',
            data  : {payload:data}
        }).then(function(response){
            $scope.invoice_new = response.data.invoice_new;
            $scope.invoice =  response.data.invoice_number;
            $scope.date = new Date();
        }); 
    }

    var getAllOtherItem = function(){
       otherItem = {};
       otherItem['access_token'] = access_token; 
        var data =  JSON.stringify(otherItem);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/billing/getPrepaidMembershipPackage',
            data  : {payload:data}
        }).then(function(response){
            $scope.packageToSale      = response.data.package;
            $scope.package = 0;
            $scope.membershipToSale   = response.data.membership;
            $scope.membership = 0;
            $scope.cardToSale         = response.data.card;
            $scope.card = 0;
            // $scope.staffList = response.data.stylist;
            // $scope.stylist = 0;
        });
    }

    get_bill_info();
    getAllOtherItem();

    var selectedItem;
    $scope.packageInfoBox = false;
    $scope.price = 0;
    var search_arr = {};
    $scope.searchCustomerByMobile = function(value){
        if(value.str.length > 2){
            search_arr['access_token'] = access_token;
            search_arr['str']  = value.str;
            search_arr['type'] = value.type;
            var data =  JSON.stringify(search_arr);
            $http({
                method  : 'POST',
                url     : 'http://'+base_url+'/customer/searchCustomerByMobile',
                data  : {payload:data}
            }).then(function(response){
                if(response.data.customers.length > 0){
                    $scope.suggestionBox = true;
                    $scope.customerList = response.data.customers;
                }else{
                    $scope.suggestionBox = false;
                }
            }); 
        }
    }

    $scope.searchItem = function(item){
        search_arr['access_token'] = access_token;
        search_arr['query']  = item.query;
        search_arr['type'] = item.type;
        var data =  JSON.stringify(search_arr);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/customer/searchServiceProduct',
            data  : {payload:data}
        }).then(function(response){
            if(response.data.result.length >0){
                $scope.searchItemBox = true;
                $scope.itemList = response.data.result;
            }else{
                $scope.searchItemBox = false;
            }
        }); 
    }

    $scope.staffList = [{id:0,category:'select staff'}];
    $scope.stylist = 0;
    $scope.getStaffByService = function(item){
        $scope.staffList = [{id:0,category:'Select Staff'}];
        $scope.stylist = 0;
        $scope.quantity = 1;
        $scope.discount = 0;
        $scope.price = 0;
        $scope.packageInfoBox = false;
        selectedItem = item;
        search_arr['access_token'] = access_token;
        search_arr['id']  = item.id;
        search_arr['type'] = item.type;
        var data =  JSON.stringify(search_arr);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/billing/getStaffByService',
            data  : {payload:data}
        }).then(function(response){
            $scope.service = item.name;
            if(response.data.categories.length >0){
                $scope.searchItemBox = false;
                $scope.staffList = response.data.categories;
            }
        }); 
    }

    $scope.payMethod = [{id:0,payment_method:'Select Pay Method'}];
    $scope.pay_id = 0;

    $scope.quantityList = [1,2,3,4,5];
    $scope.quantity = 1;

    $scope.discountList = [0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100];
    $scope.discount = 0;

    var cust_arr = {};
    $scope.gender = 'Gender';
    $scope.getCustomerDetails = function(customer){
        $scope.name = customer.name;
        $scope.mobile = customer.mobile;
        $scope.gender = customer.gender;

        cust_arr['access_token'] = access_token;
        cust_arr['customer_id']  = customer.id;
        $scope.suggestionBox = false;
        var data =  JSON.stringify(cust_arr);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/customer/getCustomerDetails',
            data  : {payload:data}
        }).then(function(response){
            if(response.data.package.length >0){
                $scope.package_tab = true;
                $scope.packageList = response.data.package;
            }
            if(response.data.membership.length > 0){
                $scope.membership_tab = true;
                $scope.membershipList = response.data.membership;    
            }
        }); 
    }

    $scope.checkStuff =  function(){
        console.log('test');
    }


    var getPrice = {};

    var membership_info;
    var package_info;
    var is_member = false;
    var is_package = false;
    $scope.getPrice = function(stylist){
        getPrice['access_token'] = access_token;
        getPrice['id']  = selectedItem.id;
        getPrice['category']  = selectedItem.type;
        getPrice['stylist']  = stylist;
        getPrice['customer_mobile']  = $scope.mobile;
        getPrice['gender']  = $scope.gender;

        var data =  JSON.stringify(getPrice);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/billing/get_price',
            data  : {payload:data}
        }).then(function(response){
            if(response.data.status == 'success'){
                console.log(response.data);
                $scope.price = response.data.list.rate;

                if(response.data.is_member == 'true'){
                    is_member = 'true';
                    $scope.discount = parseInt(response.data.member.discount.replace('%',''));
                    membership_info = response.data.member;
                }
                if(response.data.is_package == 'true'){
                    $scope.packageInfoBox = true;
                    $scope.package = response.data.package.name;
                    is_package = 'true';
                    package_info = response.data.package;
                }else{
                    $scope.packageInfoBox = false;
                }
            }
        });
    }

    $scope.info = [];
    var item_list = {};
    var index = 1;
    $scope.calculateBill = function(){

        // console.log($scope.discount);

        if($scope.discount == 0){
            var disc = 'No Discount';
        }else{
            var disc = $scope.discount.toString();
            disc = disc+'%';
        }
        if(selectedItem.type == 'Service'){
            var type = 'service';
        }else if(selectedItem.type == 'package'){
            var type = 'package';
        }else if(selectedItem.type == 'membership'){
            var type = 'membership';
        }else if(selectedItem.type == 'card'){
            var type = 'card';
        }else{
            type = 'Product';
        }
        item_list['access_token']   = access_token;
        item_list['stylist']        = $scope.stylist;
        item_list['discounts']      = disc;
        item_list['gender']         = $scope.gender;
        item_list['custom']         = 0;
        item_list['custom_price']   = "",
        item_list['category']       = type;
        item_list['is_package']     = is_package.toString();   
        item_list['is_member']      = is_member.toString();
        item_list['quantity']       = $scope.quantity;
        item_list['Service']        = selectedItem.name;
        item_list['id']             = selectedItem.id;
        if(is_package == 'true'){
            item_list['package_id'] = package_info.package_id;
            item_list['package_name']= package_info.package_name;
            item_list['per_unit_st'] = package_info.per_unit_st;   
        }
        if(is_member == 'true'){
            item_list['membership_id'] = membership_info.id;
        }

        var data =  JSON.stringify(item_list);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/billing/calculate_bill',
            data  : {payload:data}
        }).then(function(response){
            if(response.data.status == 'success'){

                response.data.list.index = index;
                response.data.list.is_stylist = response.data.list.stylist;
                response.data.list.stylist = response.data.list.staff_id;

                if(response.data.list.discounts == 0){  
                    response.data.list.discounts = 'No Discount';
                }
                // else{
                //     var disc = response.data.list.discounts.toString();
                //     response.data.list.discounts = disc+'%';
                // }

                $scope.info.push(response.data.list);

                // console.log($scope.info);

                index++;
                $scope.packageInfoBox = false;
                $scope.price = 0;
                $scope.service = '';
                $scope.staffList = [{id:0,category:'select staff'}];
                $scope.stylist = 0;
                $scope.quantity = 1;
                $scope.discount = 0;
            }
        });
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

    $scope.removeItem = function(index){
        console.log(index);
        $scope.info = removeByAttr($scope.info,'index',index);
    }

    var gen_list = {};
    $scope.generateBill = function(){
        gen_list['access_token']    = access_token;
        gen_list['customer_name']   = $scope.name;
        gen_list['mobile']          = $scope.mobile;
        gen_list['gender']          = $scope.gender;
        gen_list['type']            = 'service';
        gen_list['invoice_new']     = $scope.invoice_new;
        gen_list['invoice']         = $scope.invoice;
        gen_list['info']            = $scope.info;

        var data =  JSON.stringify(gen_list);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/billing/generate_bill',
            data  : {payload:data}
        }).then(function(response){
                $scope.payMethod = response.data.payment_methods;
                $scope.payMethod.unshift({id:00,payment_method:'Select Pay Method'});
                $scope.pay_id = 00;
                $scope.sum = response.data.services[0];
                $scope.total = response.data.total;

                // $scope.packageInfoBox = false;
                // $scope.price = 0;
                // $scope.service = '';
                // $scope.staffList = [{id:0,category:'select staff'}];
                // $scope.stylist = 0;
                // $scope.quantity = 1;
                // $scope.discount = 0;
            
        });
    }

    var chek_out = {};
    $scope.checkout = function(){
        chek_out['access_token']    = access_token;
        chek_out['type']            = 'service';
        chek_out['invoice_new']     = $scope.invoice_new;
        chek_out['invoice']         = $scope.invoice;
        chek_out['is_partial']      = 0;
        chek_out['prepaid_card']    = 'false';
        chek_out['array']           = [];
        chek_out['array_new']       = [];
        chek_out['mobile']          = $scope.mobile;
        chek_out['payment_method']  = $scope.pay_id;
        chek_out['narration']       = '';

        var data =  JSON.stringify(chek_out);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/billing/applyPaymentMethod',
            data  : {payload:data}
        }).then(function(response){
            if(response.data.status == 'success'){
                $scope.info= [];

                $scope.name = '';
                $scope.mobile = '';
                $scope.gender = '';
                $scope.sum = [];
                $scope.total = 0;
                $scope.packageInfoBox = false;
                $scope.price = 0;
                $scope.service = '';
                $scope.staffList = [{id:0,category:'select staff'}];
                $scope.stylist = 0;
                $scope.quantity = 1;
                $scope.discount = 0;
                get_bill_info();
            } 
        });
    }

    var cancel = {};
    $scope.cancelOrder = function(){
        cancel['access_token']  = access_token;
        cancel['invoice_new']   = $scope.invoice_new;
        cancel['invoice']       = $scope.invoice;
        cancel['array']         = [];
        cancel['array_new']     = [];
        cancel['type']          = 'service';
        cancel['mobile']        = $scope.mobile;

        var data =  JSON.stringify(cancel);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/billing/cancelOrder',
            data  : {payload:data}
        }).then(function(response){
            if(response.data.status == 'success'){
                
                $scope.info= [];

                $scope.name = '';
                $scope.mobile = '';
                $scope.gender = '';
                $scope.sum = [];
                $scope.total = 0;
                $scope.packageInfoBox = false;
                $scope.price = 0;
                $scope.service = '';
                $scope.staffList = [{id:0,category:'select staff'}];
                $scope.stylist = 0;
                $scope.quantity = 1;
                $scope.discount = 0;
                get_bill_info();
            } 
        });
    }

    $scope.test = function(test){
        console.log(test);
    }

});
