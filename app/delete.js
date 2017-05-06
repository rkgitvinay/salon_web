// create the module and name it phpro
// also include ngRoute for all our routing needs
var phpro = angular.module('delete', ['ngRoute']);

// configure our routes
phpro.config(function($routeProvider) {

$routeProvider
        // route for the index page
        .when('/', {
                templateUrl : 'templates/delete/del.html',
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

var access_token = localStorage.getItem("access_token");
var base_url = '52.33.37.151:8080';
// var base_url = 'localhost:3000';

phpro.controller('mainCtrl', function($scope,$http) {
    var url = 'http://'+base_url+'/accounting/getInfoStats?access_token='+access_token;
    $http({
        method  : 'GET',
        url     : url,
    }).then(function(response){
        if(response.data.category.length > 0){
            $scope.payment_log = response.data.log;
        }

    });   

    $scope.getBillInfo = function(invoice){
        var url = 'http://'+base_url+'/accounting/getBillInfo';
        $http({
            method  : 'GET',
            url     : url ,
            params  :{access_token:access_token,invoice:invoice}          
        }).then(function(response){               
            $scope.items = response.data.items;
            $scope.result = response.data.result;          
        });
    }

    $scope.deleteInvoice = function(data){
        var url = 'http://'+base_url+'/accounting/deleteInvoice';
        swal({
          title: "Are you sure?",
          text: "You will not be able to recover this imaginary file!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          closeOnConfirm: false
        },
        function(){
                $http({
                    method  : 'GET',
                    url     : url ,
                    params  :{access_token:access_token,invoice:data.invoice,total:data.total,payment_type_id:data.payment_type_id}          
                }).then(function(response){               
                    if(response.data.status == 'success'){
                        swal("Deleted!", "Your bill has been deleted.", "success");
                    }else if(response.data.status == 'pending'){
                        sweetAlert("Error", "First, Close your all pending bills", "error");
                    }
                });


          //swal("Deleted!", "Your imaginary file has been deleted.", "success");
        });
    }
});

