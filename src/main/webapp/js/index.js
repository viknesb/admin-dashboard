var app = angular.module("adminMonitorApp",["controllers"]);

app.config(['$httpProvider','$routeProvider' ,function($httpProvider, $routeProvider) {
	$httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
	$routeProvider.
	when('/', {controller:'CredentialCtrl', templateUrl:'credentials.html'}).
	when('/experiments/:expId', {controller:'ExperimentCtrl', templateUrl:'experimentDetail.html'}).
	when('/experiments', {controller:'ExperimentCtrl', templateUrl:'experiments.html'}).
	when('/projects', {controller:'ProjectCtrl', templateUrl:'projects.html'}).
	when('/workflows', {controller:'WorkflowCtrl', templateUrl:'workflows.html'}).
	when('/credentials', {controller:'CredentialCtrl', templateUrl:'credentials.html'}).
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
					'<li><a href="#/" data-toggle="tab">Credentials</a></li>' +
					'<li><a href="#/experiments" data-toggle="tab">Experiments</a></li>' +
					'<li><a href="#/projects" data-toggle="tab">Projects</a></li>' +
					'<li><a href="#/workflows" data-toggle="tab">Workflows</a></li>' +
					//'<li class="pull-right"><a href="#/credentials" data-toggle="tab">Credentials</a></li>' +
					'</ul>' +
					'<div ng-view></div>' +
					'<div class="tab-content" ng-transclude></div>' +
				'</div>' +
			'</div>',
		replace : true
	};
});


// Controllers
angular.module("controllers",["user","services"]).
	controller("HomeCtrl", ["$scope",function($scope) {
		
	}]).
	controller("CredentialCtrl", ["$scope","User",function($scope,User) {
		$scope.save = function() {
			User.setCredentials($scope.username,$scope.password);
			$scope.crdSetFlag = true;
		};
		$scope.clear = function() {
			$scope.username = "";
			$scope.password = "";
			User.setCredentials("","");
			$scope.crdSetFlag = false;
		};
	}]).
	controller("ExperimentCtrl", ["$scope","$location","$routeParams","Experiment",function($scope,$location,$routeParams,Experiment) {
		
		if($location.path()=="/experiments") {
			Experiment.getAll().then(function(experiments) {
				$scope.experiments = experiments;
			}); 
		}
		else if($location.path().indexOf("/experiments/")==0) {
			var expId = $routeParams.expId;
			if(angular.isString(expId) && expId!="") {
				Experiment.getById(expId).then(function(experiment) {
					$scope.experiment = experiment;
				});
			}
		}
	}]).
	controller("ProjectCtrl", ["$scope","Project",function($scope,Project) {
		Project.getAll().then(function(projects) {
			$scope.projects = projects;
		});
	}]).
	controller("WorkflowCtrl", ["$scope","Workflow",function($scope,Workflow) {
		Workflow.getAll().then(function(workflows) {
			$scope.workflows = workflows;
		});
	}]);

// Services
angular.module("services",["user"]).
	factory("Project",["$http","User", function($http, User) {
		return {
			getAll : function() {
				$http.defaults.headers.common.Authorization = User.getAuthHeader();
				return $http({method:"GET", url:"http://localhost:8080/airavata-registry/api/projectregistry/get/projects",
					cache : false}).
				then(function(response) {
					var results = response.data.workspaceProjects;
					var projects = [];
					for (var item in results) {
						var project = {};
						project.gatewayName = results[item].gateway.gatewayName;
						project.projectName = results[item].projectName;
						project.username = results[item].airavataUser.userName;
						projects.push(project);
					}
					return projects;
				}, function(error) {
					console.log("Error occured while fetching projects !");
				});
			}
		};
	}]).
	factory("Experiment",["$http","User", function($http, User) {
		return {
			getAll : function() {
				$http.defaults.headers.common.Authorization = User.getAuthHeader();
				return $http({method:"GET", url:"http://localhost:8080/airavata-registry/api/experimentregistry/get/experiments/all",
					cache : false}).
				then(function(response) {
					var results = response.data.experiments;
					var experiments = [];
					for (var item in results) {
						var experiment = {};
						experiment.id = results[item].experimentId;
						experiment.gatewayName = results[item].gateway.gatewayName;
						experiment.projectName = results[item].project.projectName;
						experiment.submittedDate = new Date(results[item].submittedDate).toLocaleString();
						experiment.username = results[item].user.userName;
						experiments.push(experiment);
					}
					return experiments;
				}, function(error) {
					console.log("Error occured while fetching experiments !");
				});
			},
			getById : function(expId) {
				$http.defaults.headers.common.Authorization = User.getAuthHeader();
				return $http({method:"GET", url:"http://localhost:8080/airavata-registry/api/provenanceregistry/get/experiment?experimentId="+expId,
					cache : false}).
				then(function(response) {
					return response.data;
				}, function(error) {
					console.log("Error occured while fetching experiment with id "+expId);
				});
			}
		};
	}]).
	factory("Workflow",["$http","User", function($http, User) {
		return {
			getAll : function() {
				$http.defaults.headers.common.Authorization = User.getAuthHeader();
				return $http({method:"GET", url:"http://localhost:8080/airavata-registry/api/userwfregistry/get/workflows",
					cache : false}).
				then(function(response) {
					var results = response.data.workflowList;
					var workflows = [];
					for (var item in results) {
						var workflow = {};
						workflow.graph = results[item].workflowGraph;
						workflow.name = results[item].workflowName;
						workflows.push(workflow);
					}
					return workflows;
				}, function(error) {
					console.log("Error occured while fetching workflows !");
				});
			}
		};
	}]);

// Utils
angular.module("user",["encoder"]).
factory("User",["Base64", function(Base64) {
	var _username = "";
	var _password = "";
	return {
		getAuthHeader : function() {
			var token = _username + ':' + _password;
			return "Basic " + Base64.encode(token);
		},
		setCredentials : function(username,password) {
			_username = username;
			_password = password;
			return;
		},
		getUsername : function() {
			return _username;
		}
	};
}]);

angular.module("encoder",[]).
	factory('Base64', function() {
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
