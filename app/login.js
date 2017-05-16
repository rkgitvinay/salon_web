// create the module and name it phpro
// also include ngRoute for all our routing needs
var phpro = angular.module('login', ['ngRoute']);

// var access_token = localStorage.getItem("access_token");
if(localStorage.getItem("access_token") == null){
    // window.location = 'login.html';
}else{
    window.location = 'index.html';
    var access_token = localStorage.getItem("access_token");  
}

var local_url = 'zalonstyle.in:8080';
//var local_url = 'localhost:3000';

phpro.factory('Session', function($http) {
    var Session = {
        saveSession: function(sessData){
            console.log(sessData);
            localStorage.setItem("name", sessData.name);
            localStorage.setItem("access_token", sessData.access_token);
        },
        updateSession: function() { 
                  
        },
        clearSession: function(){

        },
        getSession: function(){

        }
    };
    return Session; 
});

phpro.controller('loginCtrl', function($scope,$http,$window,Session){

     $scope.login = function (formData){        
        var url = 'http://'+local_url+'/admin/login';
        var data =  JSON.stringify(formData);
        $http({
            method  : 'POST',
            url     : url,
            data    : {payload:data}
        }).then(function(response){
            if(response.data.status=='success'){
                Session.saveSession(response.data.user);
                window.location.href= "index.html";    
            }
            // console.log(response);                                                
        });

    }
});


