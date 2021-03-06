var phpro = angular.module('billing', ['ngRoute','ui.bootstrap','angularMoment']);

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

phpro.controller('mainCtrl', function($scope,$http,$window,$modal,moment) {
    $scope.invoice = 0;
    $scope.invoice_new = 0;
    $scope.custom_price = 0;
    var selectedItem = {};
    var billing_events = [];
    $scope.offer = {};

    $scope.discountTypeList = ['Discount','%','Rupee'];
    $scope.discountType = 'Discount';

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
            //$scope.stylist = {id:0,category:'select staff'};

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
                selectedItem.service_id = response.data.service[0].category_id;
                $scope.service = selectedItem.name;
                $scope.stylist = {id:0,category:'select staff'};
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
        ////console.log(row);
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
            $scope.tax = response.data.tax;
            ////console.log(response);
            $scope.payMethod    = response.data.pay_methods;
            $scope.pay_id       = response.data.pay_methods[0].id;
            $scope.date = new Date();
            response.data.promo.unshift({id:0,campaign_name:'Select Offer'});
            response.data.promo.push({id:9999999,campaign_name:'Referral'});
            $scope.promo = response.data.promo;
            $scope.promo_id = {id:0,campaign_name:'Select Offer'};
            $scope.referral = response.data.referral;

            $scope.serviceListAll = response.data.services;
            $scope.productListAll = response.data.products;

            //$scope.searchItemBox = true;
            $scope.itemList = response.data.services;
            $scope.productList = response.data.products;
        }); 
    }

    onDocumentClick = function(event) {
        $scope.searchItemBox = false;
        $scope.searchProductBox = false;
        return;
    }

    $scope.searchItem = function(item){
        search_arr['access_token'] = access_token;
        search_arr['query']  = item.query;
        search_arr['type'] = item.type;
        ////console.log(item);

        if(item.type == 'service'){
            $scope.searchItemBox = true;
            $scope.searchProductBox = false;
        }else{
            $scope.searchItemBox = false;
            $scope.searchProductBox = true;
        }
        //var data =  JSON.stringify(search_arr);
        // $http({
        //     method  : 'POST',
        //     url     : 'http://'+base_url+'/customer/searchServiceProduct',
        //     data  : {payload:data}
        // }).then(function(response){
        //     if(response.data.result.length >0){
        //         $scope.searchItemBox = true;
        //         $scope.itemList = response.data.result;
        //     }else{
        //         $scope.searchItemBox = false;
        //     }
        // }); 
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
            if(response.data.list.length > 0){
                $scope.holdList = response.data.list;
                $scope.holdListBox = true;
            }
            if(response.data.jobCard.length > 0){
                $scope.jobCards = response.data.jobCard;
                $scope.jobCardBox = true;
            }
            
        });
    }

    get_bill_info();
    getAllOtherItem();
    getHoldCustomers();
    
    $scope.packageInfoBox = false;
    $scope.price = 0;
    var search_arr = {};
    var go = true;
    var customer_found = true;
    $scope.searchCustomerByMobile = function(value){
        if(value.str.length == 2 || value.str.length == 3){
            go = true;  
        }
        if(value.str.length > 2 && go == true){ 

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
                    customer_found = true;
                    go = true;
                    $scope.suggestionBox = true;
                    $scope.customerList = response.data.customers;
                }else{
                    go = false;
                    customer_found = false;
                    $scope.suggestionBox = false;
                    var ref = searchReferral(9999999,$scope.promo);
                    if(ref == undefined){
                        $scope.promo.push({id:9999999,campaign_name:'Referral'});    
                    }
                }
            }); 
        }
    }

    function searchReferral(nameKey, myArray){
        for (var i=0; i < myArray.length; i++) {
            if (myArray[i].id === nameKey) {
                return myArray[i];
            }
        }
    }


    $scope.staffList = [{id:0,category:'select staff'}];
    $scope.stylist = {id:0,category:'select staff'};
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
            if(item.type == 'Product'){
                $scope.product = item.name;
            }else{
                $scope.service = item.name;
            }
            if(response.data.categories.length >0){
                $scope.searchProductBox = false;
                $scope.searchItemBox = false;
                $scope.staffList = response.data.categories;
                $scope.stylist = {id:0,category:'select staff'};
            }
        }); 
    }

    $scope.payMethod = [{id:0,payment_method:'Select Pay Method'}];
    $scope.pay_id = 0;

    $scope.quantityList = ['Qty',1,2,3,4,5];
    $scope.quantity = 1;

    $scope.discountList = [0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100];
    $scope.discount = 0;

    var cust_arr = {};
    $scope.gender = 'Gender';
    $scope.pendingAmt = 0;
    $scope.getCustomerDetails = function(customer){
        if(customer.referrer_points == 0){
            $scope.promo = removeByAttr($scope.promo,'id',9999999);
        }
        customer_found = true;
        $scope.referrar_input = false;
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

            $scope.payMethod = response.data.payment_methods;
            $scope.pay_id = $scope.payMethod[0].id;
            if(response.data.prepaid_card == true){
                $scope.prepaidCardList = response.data.prepaid_cards;
                $scope.prepaidCardList.unshift({card_id:999999,card_name:'Select Card'});
                $scope.prepaid_card_id = 999999;
            }
            if(response.data.pending.length > 0){
                $scope.pendingList = response.data.pending;
                $scope.pendingAmt = 0;
                $scope.pendingList.forEach(function(pen){
                    $scope.pendingAmt =  $scope.pendingAmt  + pen.total_due;
                });
                $scope.pendingBox = true;
            }

            $scope.pendingPayMethod = [];
            $scope.payMethod.forEach(function(row){
                if(row.payment_method !== 'Prepaid Card' && row.payment_method !== 'Pending'){
                    $scope.pendingPayMethod.push(row);
                }
            });
            $scope.due_pay_id = $scope.pendingPayMethod[0].id;

            if(response.data.favourites.length > 0){
                $scope.favouritesList = response.data.favourites;
                $scope.favouritesBox  = true;
            }
            
            
        }); 
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
        getPrice['stylist']  = stylist.id;
        getPrice['customer_mobile']  = $scope.mobile;
        getPrice['gender']  = $scope.gender;
        var data =  JSON.stringify(getPrice);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/billing/get_price',
            data  : {payload:data}
        }).then(function(response){
            if(response.data.status == 'success'){
                selectedItem.name = response.data.list.name;
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
    $scope.sum = {};
    $scope.info = [];
    var item_list = {};
    var index = 1;
    $scope.calculateBill = function(){
        var row = $scope.tax;
        if(selectedItem.type == 'Service'){
            var type = 'service';
        }else if(selectedItem.type == 'package'){
            var type = 'package';
        }else if(selectedItem.type == 'membership'){
            var type = 'membership';
        }else if(selectedItem.type == 'card'){
            var type = 'card';
        }else{
            type = 'product';
        }
        if($scope.custom_price == 0){
            var final_price = $scope.price;
        }else{
            var final_price = $scope.custom_price;
        }
        if(is_package == 'true'){
            var pkg_id = package_info.package_id;
            var pkg_name = package_info.package_name;
        }else{
            var pkg_id = 0;
            var pkg_name = '';
        }
        if(is_member == 'true'){
            var mem_id = membership_info.id;
        }else{
            var mem_id = 0;
        }

        if($scope.discountType == 'Rupee'){
            var disc_value = parseInt($scope.discount);
            var disc_percentage = ((disc_value * 100)/final_price).toFixed(2);

        }else if($scope.discountType == '%'){
            var disc_percentage = parseInt($scope.discount);
        }else{
            var disc_percentage = 0;
        }


        var item = {    
            stylist:$scope.stylist.id,
            stylist_name:$scope.stylist.category,
            discounts:disc_percentage,
            price:final_price,
            category:type,
            is_package:is_package.toString(),
            is_member:is_member.toString(),
            quantity:$scope.quantity,
            Service:selectedItem.name,
            id:selectedItem.id,
            service_id:selectedItem.service_id,
            package_id:pkg_id,
            package_name:pkg_name,
            membership_id:mem_id,
            taxable_amount: 0,
            discount_value : 0,
            tax_value : 0,
            net_amount : 0,
            price_without_tax:0
        }

        if(item.category == 'service' || item.category == 'membership' || item.category == 'package' || item.category == 'card'){
            if(row.tax_including == 'true'){
                item.price_without_tax =  (Math.round(item.price/1.18))*item.quantity;
                if(item.discounts != 0){
                    item.discount_value = Math.round((item.price_without_tax*item.discounts/100));                        
                }
                item.taxable_amount = (item.price_without_tax - item.discount_value);
                item.tax_value = Math.round(((item.taxable_amount)*row.service_value/100));
            }else{
                item.price_without_tax = (parseInt(item.price))*item.quantity;
                if(item.discounts != 0){
                    item.discount_value = Math.round((item.price_without_tax*item.discounts/100));                        
                }
                item.taxable_amount = (item.price_without_tax - item.discount_value);
                item.tax_value = Math.round(((item.taxable_amount)*row.service_value/100));
            }
            item.net_amount = (item.taxable_amount + item.tax_value)*item.quantity;

        }else if(item.category == 'product'){
            item.price_without_tax =  (Math.round(item.price/1.28))*item.quantity;
            if(item.discounts != 0){
                item.discount_value = Math.round((item.price_without_tax*item.discounts/100));                        
            }
            item.taxable_amount = (item.price_without_tax - item.discount_value);
            item.tax_value = Math.round(((item.taxable_amount)*row.product_value/100));


            item.net_amount = (item.taxable_amount + item.tax_value)*item.quantity;
        }

        // //console.log(item);
        if(item.stylist == 0){
            swal("Please select staff");
        }else if($scope.gender == 'Gender'){
            swal("Please select gender");
        }else{
            //console.log(item);
            item.index = index;
            $scope.info.push(item);
            index++;

            $scope.packageInfoBox = false;
            $scope.price = 0;
            $scope.custom_price = 0;
            $scope.service = '';
            $scope.quantity = 1;
            $scope.discount = 0;
            $scope.staffList = [{id:0,category:'select staff'}];
            $scope.stylist = {id:0,category:'Select Staff'};
            $scope.discountType = 'Discount';
        }
        



    }

    var service_count = 0;
    $scope.$watchCollection('info', function(array){
        var service = {}; 
        var sub_total = 0;
        var taxable_amount = 0;
        var service_sum = 0;
        var service_disc = 0;
        var other_sum = 0;
        var other_disc = 0;
        var product_sum = 0;
        var product_disc = 0;
        var discount = 0;
        var tax = 0;
        service_count = 0;
        var total = 0;

        if(array.length > 0){
            array.forEach(function(row,i){
                sub_total = sub_total + (row.price_without_tax);
                discount = discount + row.discount_value;
                tax = tax + row.tax_value;
                taxable_amount = taxable_amount + row.taxable_amount;

                if(row.category == 'service'){
                    service_sum = service_sum + (row.taxable_amount);
                    service_disc = service_disc + row.discount_value;
                    service_count++;

                }else if(row.category == 'membership' || row.category == 'package' || row.category == 'card'){
                    other_sum = other_sum + (row.taxable_amount);
                    other_disc = other_disc + row.discount_value;

                }else{
                    product_sum = product_sum + (row.taxable_amount);
                    product_disc = product_disc +  row.discount_value;
                }

                if(row.category == 'membership' || row.category == 'package' || row.category== 'card'){
                    is_prepaid = false;
                }
                if(array.length == i+1){
                     service = {
                        sub_total : sub_total,
                        taxable_amount: taxable_amount,
                        service_sum: service_sum,
                        service_disc:service_disc,
                        product_sum:product_sum,
                        product_disc:product_disc,
                        other_sum:other_sum,
                        other_disc:other_disc,
                        discount:discount,
                        tax:tax,
                        total :taxable_amount + tax
                    }
                   
                    $scope.sum = service;
                    $scope.amt = $scope.sum.total;
                    ////console.log($scope.sum);
                }
            });
        }else{
            $scope.sum.sub_total = '';
            $scope.sum.discount = '';
            $scope.sum.taxable_amount = '';
            $scope.sum.tax = '';
            $scope.sum.total = '';
            $scope.amt = '';
        }
    });


    
    $scope.removeItem = function(index){
        ////console.log(index);
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
                $scope.pay_id = $scope.payMethod[0].id;

                $scope.sum = response.data.services[0];
                $scope.total = response.data.total;
                $scope.amt = $scope.total;

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
        hold_list['orders']          = $scope.info;

        var data =  JSON.stringify(hold_list);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/billing/addOrderToHold',
            data  : {payload:data}
        }).then(function(response){
            if(response.data.status == 'success'){
                get_bill_info();
                refreshScreen();
                getHoldCustomers();
            }
        });
    }

    $scope.addToJobCard = function(){
        hold_list['access_token']    = access_token;
        hold_list['customer_name']   = $scope.name;
        hold_list['mobile']          = $scope.mobile;
        hold_list['gender']          = $scope.gender;
        hold_list['orders']          = $scope.info;

        var data =  JSON.stringify(hold_list);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/billing/addToJobCard',
            data  : {payload:data}
        }).then(function(response){
            if(response.data.status == 'success'){
                //get_bill_info();
                refreshScreen();
                getHoldCustomers();
            }
        });
    }

    var chek_out = {};
    $scope.checkout = function(){
        var prepaidCards = [];
        myArray = $scope.partialLog.filter(function( obj ){
            if(obj.name === 'Prepaid Card'){
                prepaidCards.push(obj);
            }
            return obj.name !== 'Prepaid Card';
        });

        if(myArray.length == 0){ 
            var is_partial      = 0;
            var payment_method  = myArray;
        }else if(myArray.length == 1){
            var is_partial      = 0;
            var payment_method  = myArray;
        }else{
            var is_partial      = 1;
            var payment_method  = myArray;
        }

        if(prepaidCards.length > 0){
            var is_prepaid = 1;
            var prepaid = prepaidCards;
        }else{
            var is_prepaid = 0;
            var prepaid = [];
        }

        chek_out['access_token']    = access_token;
        chek_out['invoice_new']     = $scope.invoice_new;
        chek_out['invoice']         = $scope.invoice;
        chek_out['is_partial']      = is_partial;
        chek_out['mobile']          = $scope.mobile;
        chek_out['customer_name']   = $scope.name;
        chek_out['gender']          = $scope.gender;
        chek_out['payment_method']  = payment_method;
        chek_out['narration']       = '';
        chek_out['event_id']        = billing_events;
        chek_out['info']            = $scope.info;
        chek_out['offer']           = $scope.offer;
        chek_out['invoice_details'] = $scope.sum;
        chek_out['is_prepaid']      = is_prepaid;
        chek_out['prepaid']         = prepaid;

        if(myArray.length > 0 || prepaidCards.length > 0){

                if($scope.gender != 'Gender'){
                    var data =  JSON.stringify(chek_out);
                    $http({
                        method  : 'POST',
                        url     : 'http://'+base_url+'/billing/applyPaymentMethod',
                        data  : {payload:data}
                    }).then(function(response){
                        if(response.data.status == 'success'){
                            var invoice = $scope.invoice;
                            var salon_id = response.data.salon_id;
                            var url = 'http://'+base_url+'/billing/getBill?invoice='+invoice+'&salon_id='+salon_id+'';
                            
                            popupCenter(url,'myPop1',600,600);
                            refreshScreen();
                            get_bill_info();
                            getHoldCustomers();
                        } 
                    });
                }else{
                    alert('Please Select Gender');
                }

        }else{
            alert('Add payment method');
        }
       
    }
    
    function popupCenter(url, title, w, h) {
        var left = (screen.width/2)-(w/2);
        var top = (screen.height/2)-(h/2);
        return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
    } 

    var getBillInfo = function(invoice){
        var url = 'http://'+base_url+'/accounting/getBillInfo';
        $http({
            method  : 'GET',
            url     : url ,
            params  :{access_token:access_token,invoice:invoice}          
        }).then(function(response){               
            $scope.items = response.data.items;
            $scope.result = response.data.result; 
            $scope.paymentMethod = response.data.paymentMethod;         
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
                    refreshScreen();
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
                // list.is_stylist = list.stylist;
                // list.stylist    = list.staff_id;

                // if(list.discounts == 0){  
                //     list.discounts = 'No Discount';
                // }else{
                //     var disc = list.discounts.toString();
                //     list.discounts = disc+'%';
                // }
                $scope.info.push(list);
                index++;
            });

        });
    }

    var index = 1;
    $scope.getJobCardDetail = function(jobCardId){
        
        $scope.info = [];
        var get_list = {};
        get_list['access_token']    = access_token;
        get_list['jobCardId']       = jobCardId;
        var data =  JSON.stringify(get_list);
        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/billing/getJobCardDetail',
            data  : {payload:data}
        }).then(function(response){

            $scope.name = response.data.info.customer_name;
            $scope.mobile= response.data.info.customer_mobile;
            $scope.gender= response.data.info.gender;

            response.data.list.forEach(function(list){
                list.index = index;
                //list.is_stylist = list.stylist;
                // list.stylist    = list.staff_id;

                // if(list.discounts == 0){  
                //     list.discounts = 'No Discount';
                // }else{
                //     var disc = list.discounts.toString();
                //     list.discounts = disc+'%';
                // }
                $scope.info.push(list);
                index++;
            });

            ////console.log($scope.info);

        });
    }

    $scope.printJobCardDetails = function(jobCardId){
        var url = 'http://'+base_url+'/billing/printJobCard?access_token='+access_token+'&jobCardId='+jobCardId;
        popupCenter(url,'myPop1',450,450);
    }

    $scope.comment = '';
    $scope.changeComment = function(val){
        commentValue = val;
        $scope.comment = val;
    }

    $scope.cancelJobCard = function(jobCardId){
        var get_list = {};
        get_list['access_token']    = access_token;
        get_list['jobCardId']       = jobCardId;
        get_list['comment']         = $scope.comment;
        var data =  JSON.stringify(get_list);

        if($scope.comment.length != 0 || $scope.comment != ''){
           $http({
                method  : 'POST',
                url     : 'http://'+base_url+'/billing/cancelJobCard',
                data  : {payload:data}
            }).then(function(response){
                if(response.data.status == 'success'){
                    $scope.comment = '';
                    getHoldCustomers();
                }
            }); 
        }else{
            swal('Please enter the reason');
        }
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
            $scope.amt = '';
        }else{
            $scope.prepaidCards = false;
        }
    }

    $scope.updatePayPending = function(id){
        //console.log(id);
        $scope.due_pay_id = id;
    }


    $scope.settleInvoicePending = function(invoice){
        //console.log({invoice:invoice,pay:$scope.due_pay_id});
        var settle = {};
        settle['access_token']    = access_token;
        settle['invoice']         = invoice;
        settle['pay_id']          = $scope.due_pay_id;
        var data =  JSON.stringify(settle);

        $http({
            method  : 'POST',
            url     : 'http://'+base_url+'/billing/settleInvoicePending',
            data  : {payload:data}
        }).then(function(response){
            if(response.data.status == 'success'){

                $scope.pendingList =  $scope.pendingList.filter(function( obj ){
                    return obj.id !== invoice.id;
                });
                if($scope.pendingList.length == 0){
                    $scope.pendingBox = false;
                }
            }
        }); 
        
    }

    $scope.partialLog = [];
    $scope.addPartialMethod = function(){
        var tax = 0;
        var luxury_tax = 0;
        var row = $scope.tax;
        var result = search($scope.pay_id, $scope.payMethod);

        if(result.payment_method == 'Prepaid Card'){
            $scope.partialLog.push({id:result.id,name:result.payment_method, value: parseInt($scope.amt),prepaid_card_id:$scope.prepaid_card_id});
        }else{
            $scope.payMethod = $scope.payMethod.filter(function( obj ){
                return obj.payment_method !== 'Prepaid Card';
            });
            $scope.pay_id = $scope.payMethod[0].id;

            $scope.partialLog.push({id:result.id,name:result.payment_method, value: parseInt($scope.amt)});
        }
        //console.log($scope.sum);
    }

    $scope.removePartial = function(id){
        //removeByAttr($scope.partialLog,'id',id);
        $scope.partialLog = [];
        updateStats();
    }


    function searchPrepaid(nameKey, myArray){
        for (var i=0; i < myArray.length; i++) {
            if (myArray[i].card_id === nameKey) {
                return myArray[i];
            }
        }
    }

    $scope.getPrepaidCardValue = function(card_id){ 
        var prepaid = searchPrepaid(card_id,$scope.prepaidCardList);
        $scope.cardValue = prepaid.card_value;
        $scope.prepaid_card_id = card_id;
    }

    var fullAmt = 0;
    $scope.$watchCollection('partialLog', function(array){
         var total = 0;
         if (array) {

             angular.forEach(array, function(item,i) {
                ////console.log(item);

                if(item.name != 'Prepaid Card'){
                    total += item.value;   
                }
                if(array.length == i+1){
                    $scope.amt = $scope.sum.total - total;
                    ////console.log(total);
                    fullAmt = total;
                }

             });
         }else{
            $scope.amt = $scope.sum.total;
         }
     });

    var updateStats = function(){
        var service = {}; 
        var sub_total = 0;
        var taxable_amount = 0;
        var service_sum = 0;
        var service_disc = 0;
        var other_sum = 0;
        var other_disc = 0;
        var product_sum = 0;
        var product_disc = 0;
        var discount = 0;
        var tax = 0;

        var total = 0;

        if($scope.info.length > 0){
            $scope.info.forEach(function(row,i){
                sub_total = sub_total + (row.price_without_tax);
                discount = discount + row.discount_value;
                tax = tax + row.tax_value;
                taxable_amount = taxable_amount + row.taxable_amount;

                if(row.category == 'service'){
                    service_sum = service_sum + (row.taxable_amount);
                    service_disc = service_disc + row.discount_value;

                }else if(row.category == 'membership' || row.category == 'package' || row.category == 'card'){
                    other_sum = other_sum + (row.taxable_amount);
                    other_disc = other_disc + row.discount_value;

                }else{
                    product_sum = product_sum + (row.taxable_amount);
                    product_disc = product_disc +  row.discount_value;
                }

                if(row.category == 'membership' || row.category == 'package' || row.category== 'card'){
                    is_prepaid = false;
                }
                if($scope.info.length == i+1){
                     service = {
                        sub_total : sub_total,
                        taxable_amount: taxable_amount,
                        service_sum: service_sum,
                        service_disc:service_disc,
                        product_sum:product_sum,
                        product_disc:product_disc,
                        other_sum:other_sum,
                        other_disc:other_disc,
                        discount:discount,
                        tax:tax,
                        total :taxable_amount + tax
                    }
                   
                    $scope.sum = service;
                    $scope.amt = $scope.sum.total;
                    ////console.log($scope.sum);
                }
            });
        }else{
            $scope.sum.sub_total = '';
            $scope.sum.discount = '';
            $scope.sum.taxable_amount = '';
            $scope.sum.tax = '';
            $scope.sum.total = '';
            $scope.amt = '';
        }

    }


    var refreshScreen = function(){
        $scope.info= [];
        $scope.name = '';
        $scope.mobile = '';
        $scope.gender = '';
        $scope.sum = [];
        $scope.total = '';
        $scope.packageInfoBox = false;
        $scope.membership_tab = false;
        $scope.prepaidCards = false;
        $scope.package_tab = false;
        $scope.price = 0;
        $scope.service = '';
        $scope.staffList = [{id:0,category:'select staff'}];
        $scope.stylist = {id:0,category:'Select Staff'};
        $scope.quantity = 1;
        $scope.discount = 0;
        $scope.payMethod = [{id:0,payment_method:'Select Pay Method'}];
        $scope.partialLog = [];
        $scope.pay_id = 0;
        $scope.custom_price = 0;
    }

    function searchServiceCategory(nameKey, myArray){
        for (var i=0; i < myArray.length; i++) {
            if (myArray[i].service_id === nameKey) {
                return myArray[i];
            }
        }
    }

    function searchServiceById(nameKey, myArray){
        for (var i=0; i < myArray.length; i++) {
            if (myArray[i].id === nameKey) {
                return myArray[i];
            }
        }
    }

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    function validateOfferRules(rules,offer,callback){
        var is_valid = true;
        var error = [];
        if(rules.length > 0){

            rules.forEach(function(rule,i){

                switch(rule.rule_name){
                    case 'Minimum Bill Amount':
                        if(parseInt(rule.first_param) > $scope.sum.total){
                            is_valid = false;
                            error.push({message:'Does not meet applicable bill amount'});
                        }
                        break;
                    case 'Service Category':
                        var service = searchServiceCategory(parseInt(rule.second_param),$scope.info);
                        if(service == undefined){
                            is_valid = false;
                            error.push({message:'Does not meet applicable service category'});
                        }
                        break;
                    case 'Indidual Service':
                        var serviceById = searchServiceById(parseInt(rule.second_param),$scope.info);
                        if(serviceById == undefined){
                            is_valid = false;
                            error.push({message:'Does not meet applicable indidual service'});
                        }
                        break;
                    case 'Day Based':
                        var d = new Date();
                        var dayName = days[d.getDay()];
                        if(dayName != rule.first_param){
                            is_valid = false;
                            error.push({message:'Does not meet applicable day'});
                        }
                        break;
                    case 'Time Based':
                        var start = moment(rule.first_param, ["h:mm A"]).format("HH:mm:ss");
                        var end = moment(rule.second_param, ["h:mm A"]).add(1, 'hours').format("HH:mm:ss");
                        var now = moment().format("HH:mm:ss");
                        if(now >= start && now <= end){
                            is_valid = true;
                        }
                        else{
                            is_valid = false;
                            error.push({message:'Does not meet applicable time'});
                        }
                }   

                if(rules.length == i+1){
                    callback(is_valid,error);
                }

            });
        }
    }

    function applyOfferOnBill(promo,offer){
        $scope.offer = {offer:promo.id,type:'promo'}
        var row = $scope.tax;
        offer.forEach(function(list){

            switch(list.effect_type){
            case 'Service Category':
                $scope.info.forEach(function(item,i){
                    if(item.category == 'service' && item.service_id == parseInt(list.effect_param)){
                        if(promo.offer_type == 'Rupee Discount'){ 
                            var disc_value = parseInt(promo.offer_value);
                            item.discounts = ((disc_value * 100)/item.price).toFixed(2);
                        }else if(promo.offer_type == '% Discount'){
                            item.discounts = parseInt(promo.offer_value);
                        }
                        if(item.discounts != 0){
                            item.discount_value = Math.round((item.price_without_tax*item.discounts/100));  
                            item.taxable_amount = (item.price_without_tax - item.discount_value);
                            item.tax_value = Math.round(((item.taxable_amount)*row.service_value/100));
                            item.net_amount = (item.taxable_amount + item.tax_value)*item.quantity;                      
                        }
                    }
                    if($scope.info.length == i+1){
                        updateStats();
                    }
                });
                break;

            case 'Indidual Service':

                $scope.info.forEach(function(item,i){
                    if(item.category == 'service' && item.id == parseInt(list.effect_param)){
                        if(promo.offer_type == 'Rupee Discount'){ 
                            var disc_value = parseInt(promo.offer_value);
                            item.discounts = ((disc_value * 100)/item.price).toFixed(2);
                        }else if(promo.offer_type == '% Discount'){
                            item.discounts = parseInt(promo.offer_value);
                        }
                        if(item.discounts != 0){
                            item.discount_value = Math.round((item.price_without_tax*item.discounts/100));  
                            item.taxable_amount = (item.price_without_tax - item.discount_value);
                            item.tax_value = Math.round(((item.taxable_amount)*row.service_value/100));
                            item.net_amount = (item.taxable_amount + item.tax_value)*item.quantity;                      
                        }
                    }
                    if($scope.info.length == i+1){
                        updateStats();
                    }
                });
                break;

            case 'Total Bill':
                $scope.info.forEach(function(item,i){
                    if(item.category == 'service'){
                        if(promo.offer_type == 'Rupee Discount'){ 
                            var disc_value = parseInt(promo.offer_value);
                            item.discounts = ((disc_value * 100)/item.price).toFixed(2);

                        }else if(promo.offer_type == '% Discount'){
                            item.discounts = parseInt(promo.offer_value);
                        }
                        if(item.discounts != 0){
                            item.discount_value = Math.round((item.price_without_tax*item.discounts/100));  
                            item.taxable_amount = (item.price_without_tax - item.discount_value);
                            item.tax_value = Math.round(((item.taxable_amount)*row.service_value/100));
                            item.net_amount = (item.taxable_amount + item.tax_value)*item.quantity;                      
                        }
                    }
                    if($scope.info.length == i+1){
                        updateStats();
                    }
                });
                break;
            }
        });
    }

    $scope.applyOffer = function(value){
        console.log(value.promo);
        if(customer_found == false){
            if(value.promo.campaign_name != 'Referral')
                $scope.referrar_input = false;
            else
                $scope.referrar_input = true;
        }else{

            $scope.referrar_input = false;
            if(value.promo.campaign_name != 'Referral'){
                var offer = {};
                offer['access_token']    = access_token;
                offer['campaign_id']          = value.promo.id;
                var data =  JSON.stringify(offer);
                $http({
                    method  : 'POST',
                    url     : 'http://'+base_url+'/campaign/getCampaignRules',
                    data  : {payload:data}
                }).then(function(response){
                    if(response.data.status == 'success'){
                        validateOfferRules(response.data.result,value.promo, function(data,error){
                            if(data == true){
                                applyOfferOnBill(value.promo,response.data.offers);
                            }else{
                                alert(error[0].message);
                            }
                        });
                    }
                });

            }else{
                var offer = {};
                offer['access_token']    = access_token;
                offer['mobile']          = $scope.mobile;
                var data =  JSON.stringify(offer);
                $http({
                    method  : 'POST',
                    url     : 'http://'+base_url+'/campaign/getReferralOffer',
                    data  : {payload:data}
                }).then(function(response){
                    if(response.data.status == 'success'){
                        applyReferralBonus(response.data.offer);
                    }
                });
            }
        }   
    }

    var checkUser = {}
    $scope.validateUser = function(event){
        if (event.which === 13){
            checkUser['access_token']    = access_token;
            checkUser['mobile']          = $scope.referrar_mobile;
            var data =  JSON.stringify(checkUser);
            $http({
                method  : 'POST',
                url     : 'http://'+base_url+'/customer/validateUser',
                data  : {payload:data}
            }).then(function(response){
                if(response.data.status == 'success' && $scope.referral.length > 0){
                    applyReferralOffer($scope.referral[0],$scope.referrar_mobile);
                }
            });
        }
    }

    var applyReferralOffer = function(refer,referrar_mobile){
        var row = $scope.tax;
        $scope.offer = {offer:'referral',type:'refer',param:referrar_mobile,discount_type:refer.referrer_offer,discount_value:refer.referrer_value}
        $scope.info.forEach(function(item,i){
            if(item.category == 'service'){
                if(refer.referred_offer == 'Rupee Discount'){ 
                    var disc_value = parseInt(refer.referred_value)/service_count;
                    item.discounts = ((disc_value * 100)/item.price).toFixed(2);

                }else if(refer.referred_offer == '% Discount'){
                    item.discounts = parseInt(refer.referred_value);
                }
                if(item.discounts != 0){
                    item.discount_value = Math.round((item.price_without_tax*item.discounts/100));  
                    item.taxable_amount = (item.price_without_tax - item.discount_value);
                    item.tax_value = Math.round(((item.taxable_amount)*row.service_value/100));
                    item.net_amount = (item.taxable_amount + item.tax_value)*item.quantity;                      
                }
            }
            if($scope.info.length == i+1){
                updateStats();
                ////console.log($scope.info);
            }
            
        });
    }

    var applyReferralBonus = function(refer){
        var row = $scope.tax;
        $scope.offer = {offer:'referral',type:'redeem',param:$scope.mobile,refer_id:refer.id}
        $scope.info.forEach(function(item,i){
            if(item.category == 'service'){
                if(refer.discount_type == 'Rupee Discount'){ 
                    var disc_value = parseInt(refer.discount_value)/service_count;
                    item.discounts = ((disc_value * 100)/item.price).toFixed(2);

                }else if(refer.discount_type == '% Discount'){
                    item.discounts = parseInt(refer.discount_value);
                }
                if(item.discounts != 0){
                    item.discount_value = Math.round((item.price_without_tax*item.discounts/100));  
                    item.taxable_amount = (item.price_without_tax - item.discount_value);
                    item.tax_value = Math.round(((item.taxable_amount)*row.service_value/100));
                    item.net_amount = (item.taxable_amount + item.tax_value)*item.quantity;                      
                }
            }
            if($scope.info.length == i+1){
                updateStats();
                ////console.log($scope.info);
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

});
