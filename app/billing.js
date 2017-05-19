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
// var base_url = 'zalonstyle.in:8080';
var base_url = 'localhost:3000';

phpro.controller('mainCtrl', function($scope,$http,$window) {
    $scope.invoice = 0;
    $scope.invoice_new = 0;
    $scope.custom_price = 0;
    var selectedItem = {};
    var billing_events = [];



    var customer_id = location.search.split('customer_id=')[1];
    if(customer_id != undefined){
        billing = {};
        billing['access_token'] = access_token;
        billing['customer_id']  = customer_id;
        var data =  JSON.stringify(billing);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/calendar/getEventServices',
            data  : {payload:data}
        }).then(function(response){
            $scope.name = response.data.customer[0].name;
            $scope.mobile = response.data.customer[0].mobile;
            $scope.gender = response.data.customer[0].gender;
            $scope.staffList = response.data.stylist;

            if(response.data.package.length >0){
                $scope.package_tab = true;
                $scope.packageList = response.data.package;
            }
            if(response.data.membership.length > 0){
                $scope.membership_tab = true;
                $scope.membershipList = response.data.membership;    
            }

            if(response.data.service.length == 1){
                selectedItem.id = response.data.service[0].service_id;
                selectedItem.type = 'Service';
                selectedItem.name = response.data.service[0].service;
                $scope.service = selectedItem.name;
                $scope.stylist = response.data.service[0].staff_id;
                var staff_id = response.data.service[0].staff_id;
                billing_events.push(response.data.service[0].event_id);
                $scope.getPrice(staff_id);

            }else if(response.data.service.length > 1){
                $scope.apnt_cust = $scope.name+"'s appointments";  
                $scope.appointmentList = true;
                $scope.serviceList = response.data.service;
            }
        });
    }
    
    $scope.addServiceToBill = function(row){
        //console.log(row);
        selectedItem.id = row.service_id;
        selectedItem.type = 'Service';
        selectedItem.name = row.service;
        $scope.service = selectedItem.name;
        $scope.stylist = row.staff_id;
        billing_events.push(row.event_id);
        $scope.getPrice($scope.stylist);
    }
    

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

    var get_hold_list = {};
    var getHoldCustomers = function(){
        get_hold_list['access_token']    = access_token;
        get_hold_list['mobile']          = 0;
        var data =  JSON.stringify(get_hold_list);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/billing/getHoldCustomers',
            data  : {payload:data}
        }).then(function(response){
            console.log(response);
            $scope.holdList = response.data.list;
        });
    }

    get_bill_info();
    getAllOtherItem();
    getHoldCustomers();
    
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
                $scope.price = response.data.list.rate;
                if(response.data.is_member == 'true'){
                    is_member = 'true';
                    $scope.discount = parseInt(response.data.member.discount.replace('%',''));
                    membership_info = response.data.member;
                }else{
                    is_member = 'false';
                }
                if(response.data.is_package == 'true'){
                    $scope.packageInfoBox = true;
                    $scope.package = response.data.package.name;
                    is_package = 'true';
                    package_info = response.data.package;
                }else{
                    is_package = 'false';
                    $scope.packageInfoBox = false;
                }
            }
        });
    }

    $scope.info = [];
    var item_list = {};
    var index = 1;
    $scope.calculateBill = function(){

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

        if($scope.custom_price == 0){
            var custom = 0;
        }else{
            var custom = 1;
        }
        item_list['access_token']   = access_token;
        item_list['stylist']        = $scope.stylist;
        item_list['discounts']      = disc;
        item_list['gender']         = $scope.gender;
        item_list['custom']         = custom;
        item_list['custom_price']   = $scope.custom_price,
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
                //     var disc = response.data.list.discounts. toString();
                //     response.data.list.discounts = disc+'%';
                // }

                $scope.info.push(response.data.list);

                // console.log($scope.info);

                index++;
                $scope.packageInfoBox = false;
                $scope.price = 0;
                $scope.custom_price = 0;
                $scope.service = '';
                //$scope.staffList = [{id:0,category:'select staff'}];
                //$scope.stylist = 0;
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
                $scope.payMethod.unshift({id:999999,payment_method:'Select Pay Method'});
                $scope.pay_id = 999999;
                $scope.sum = response.data.services[0];
                $scope.total = response.data.total;

                if(response.data.prepaid_card == true){
                    $scope.prepaidCardList = response.data.prepaid_cards;
                    $scope.prepaidCardList.unshift({card_id:999999,card_name:'Select Card'});
                    $scope.prepaid_card_id = 999999;
                }
        });
    }

    var hold_list = {};
    $scope.holdBill = function(){
        hold_list['access_token']    = access_token;
        hold_list['customer_name']   = $scope.name;
        hold_list['mobile']          = $scope.mobile;
        hold_list['gender']          = $scope.gender;
        hold_list['orders']            = $scope.info;

        var data =  JSON.stringify(hold_list);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/billing/addOrderToHold',
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
                $scope.membership_tab = false;
                $scope.package_tab = true;
                $scope.price = 0;
                $scope.service = '';
                $scope.staffList = [{id:0,category:'select staff'}];
                $scope.stylist = 0;
                $scope.quantity = 1;
                $scope.discount = 0;
                $scope.custom_price = 0;

                getHoldCustomers();
            }
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
        chek_out['event_id']        = billing_events;

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
                $scope.appointmentList = false;
                $scope.price = 0;
                $scope.service = '';
                $scope.staffList = [{id:0,category:'select staff'}];
                $scope.stylist = 0;
                $scope.quantity = 1;
                $scope.discount = 0;
                $scope.custom_price = 0;
                get_bill_info();
                getHoldCustomers();
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

        swal({
          title: "Are you sure?",
          //text: "You will not be able to recover this imaginary file!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, Cancel it!",
          closeOnConfirm: false
        },
        function(){

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
                    $scope.total = '';
                    $scope.packageInfoBox = false;
                    $scope.membership_tab = false;
                    $scope.prepaidCards = false;
                    $scope.package_tab = true;
                    $scope.price = 0;
                    $scope.service = '';
                    $scope.staffList = [{id:0,category:'select staff'}];
                    $scope.stylist = 0;
                    $scope.quantity = 1;
                    $scope.discount = 0;
                    $scope.payMethod = [{id:0,payment_method:'Select Pay Method'}];
                    $scope.pay_id = 0;
                    swal("Canceled!", "Your bill has been canceled.", "success");
                    get_bill_info();
                    getHoldCustomers();
                } 
            });  
        });
    }

    $scope.selectGender = function(gen){
        $scope.gender = gen;
    }

    var index = 1;
    $scope.getHoldBillByCustomer = function(mobile){
        $scope.info = [];
        var get_list = {};
        get_list['access_token']    = access_token;
        get_list['mobile']          = mobile;
        var data =  JSON.stringify(get_list);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/billing/getHoldCustomers',
            data  : {payload:data}
        }).then(function(response){
            $scope.name = response.data.info.customer_name;
            $scope.mobile= response.data.info.customer_mobile;
            $scope.gender= response.data.info.gender;

            response.data.list.forEach(function(list){
                list.index = index;
                list.is_stylist = list.stylist;
                list.stylist    = list.staff_id;

                if(list.discounts == 0){  
                    list.discounts = 'No Discount';
                }else{
                    var disc = list.discounts.toString();
                    list.discounts = disc+'%';
                }
                $scope.info.push(list);
                index++;
            });

        });
    }

    function search(nameKey, myArray){
        for (var i=0; i < myArray.length; i++) {
            if (myArray[i].id === nameKey) {
                return myArray[i];
            }
        }
    }

    $scope.testChange = function(val){
        var result = search(val, $scope.payMethod);
        if(result.payment_method == 'Prepaid Card'){
            $scope.prepaidCards = true;
        }else{
            $scope.prepaidCards = false;
        }
    }





});
