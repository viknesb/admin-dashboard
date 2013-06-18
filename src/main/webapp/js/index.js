var app = angular.module("adminMonitorApp",["encoder"]);

app.config(['$httpProvider','$routeProvider' ,function($httpProvider, $routeProvider) {
	$httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
	$routeProvider.
	when('/', {controller:HomeCtrl, templateUrl:'home.html'}).
	when('/edit/:projectId', {controller:EditCtrl, templateUrl:'detail.html'}).
	when('/experiments', {controller:ExpCtrl, templateUrl:'experiments.html'}).
	when('/workflows', {controller:CreateCtrl, templateUrl:'detail.html'}).
	otherwise({redirectTo:'/'});
}]);

app.directive("adminboard", function() {
	return {
		restrict : "E",
		transclude : true,
		scope : {},
		controller : function($scope,$element) {
			
		},
		template : 
			'<div>' +
				'<button class="btn" href="#dashboard" role="button" data-toggle="modal">Debug</button>' +
				'<div id="dashboard" class="dashboard-overlay hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
					'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
					'<h4 >Airavata Dashboard</h4>' +
					'<ul class="nav nav-tabs">' +
					'<li><a href="#/" data-toggle="tab">Home</a></li>' +
					'<li><a href="#/experiments" data-toggle="tab">Experiments</a></li>' +
					'<li><a href="#/projects" data-toggle="tab">Projects</a></li>' +
					'<li><a href="#/provenance" data-toggle="tab">Provenance</a></li>' +
					'<li><a href="#/workflows" data-toggle="tab">Workflows</a></li>' +
					'</ul>' +
					'<div ng-view></div>' +
					'<div class="tab-content" ng-transclude></div>' +
				'</div>' +
			'</div>',
		replace : true
	};
});

function HomeCtrl($scope, $http, Base64) {


}

function EditCtrl($scope) {
	
}

function ExpCtrl($scope, $http, Base64) {
	
	$http.defaults.headers.common.Authorization = make_base_auth("admin","admin", Base64);
	$http({method:"GET", url:"http://localhost:8080/airavata-registry/api/experimentregistry/get/experiments/all",
		cache : false}).
	success(function(data,status) {
		var getExperiments = function(data) {
			var experiments = [];
			for (var item in data.experiments) {
				var experiment = {};
				experiment.id = data.experiments[item].experimentId;
				experiment.gatewayName = data.experiments[item].gateway.gatewayName;
				experiment.projectName = data.experiments[item].project.projectName;
				experiment.submittedDate = new Date(data.experiments[item].submittedDate).toLocaleString();
				experiment.username = data.experiments[item].user.userName;
				experiments.push(experiment);
			}
			return experiments;
		};
		$scope.experiments = getExperiments(data);
	}).
	error(function(data,status) {
		console.log("Error fetching experiments data !");
	});
}

function CreateCtrl($scope) {
	
}

function make_base_auth(user, password, Base64) {
	var token = user + ':' + password;
	return "Basic " + Base64.encode(token);
}

angular.module("encoder",[]).factory('Base64', function() {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
        'QRSTUVWXYZabcdef' +
        'ghijklmnopqrstuv' +
        'wxyz0123456789+/' +
        '=';
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
 
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
 
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
 
                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);
 
            return output;
        },
 
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));
 
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
 
                output = output + String.fromCharCode(chr1);
 
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
 
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
 
            } while (i < input.length);
 
            return output;
        }
    };
});
