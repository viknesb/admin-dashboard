var app = angular.module("adminMonitorApp",["controllers"]);

app.config(['$httpProvider','$routeProvider' ,function($httpProvider, $routeProvider) {
	$httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
	$routeProvider.
	when('/', {controller:'LoginCtrl', templateUrl:'credentials.html'}).
	when('/experiments/id/:expId', {controller:'ExperimentCtrl', templateUrl:'experimentDetail.html'}).
	when('/experiments/errors/:expId', {controller:'ExperimentCtrl', templateUrl:'experimentErrorDetail.html'}).
	when('/experiments/errors/:expId/workflow/:workflowId', {controller:'WorkflowCtrl', templateUrl:'workflowErrorDetail.html'}).
	when('/experiments/user/:username', {controller:'ExperimentCtrl', templateUrl:'experiments.html'}).
	when('/experiments/all', {controller:'ExperimentCtrl', templateUrl:'experiments.html'}).
	when('/experiments', {controller:'ExperimentCtrl', templateUrl:'users.html'}).
	when('/projects', {controller:'ProjectCtrl', templateUrl:'projects.html'}).
	when('/workflows', {controller:'WorkflowCtrl', templateUrl:'workflows.html'}).
	//when('/credentials', {controller:'LoginCtrl', templateUrl:'credentials.html'}).
	otherwise({redirectTo:'/'});
}]);

app.directive("adminboard", function() {
	return {
		restrict : "E",
		transclude : true,
		scope : {},
		controller : function($scope,$element,$location) {
			$scope.showSearch = function() {
				$scope.showSearchPane = true;
			};
			$scope.hideSearch = function() {
				$scope.showSearchPane = false;
			};
			$scope.search = function (searchFor,searchBy,searchText){
				var searchUrl = "";
				if(searchFor==undefined || searchFor=="" || searchBy==undefined || searchBy=="" || searchText==undefined || searchText=="")
					return;
				switch(searchFor) {
				case "Experiment" :
					searchUrl += "/experiments";
					break;
				case "Project" :
					searchUrl += "/projects";
					break;
				case "Workflow" :
					searchUrl += "/workflows";
					break;
				}
				switch(searchBy) {
				case "User" :
					searchUrl += "/user";
					break;
				case "Id" :
					searchUrl += "/id";
					break;
				}
				searchUrl += "/"+searchText;
				console.log(searchUrl);
				$location.path(searchUrl);
			};
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
					'<li class="pull-right"><a ng-click="showSearch()" data-toggle="tab">Search</a></li>' +
					'</ul>' +
					'<div class="row-fluid">' +
					'<div ng-class="{span10:showSearchPane, span12:!showSearchPane}"><div ng-view></div></div>' +
					'<div ng-include src="\'search.html\'" ng-show="showSearchPane" class="span2 well">' +
					'</div>' +
					'<div class="tab-content" ng-transclude></div>' +
				'</div>' +
			'</div>',
		replace : true
	};
});


// Controllers
angular.module("controllers",["config","services"]).
	controller("LoginCtrl", ["$scope","User","Server",function($scope,User,Server) {
		$scope.save = function() {
			Server.setEndpoint($scope.url);
			User.login($scope.username,$scope.password).then(function(success) {
				if(success) {
					$scope.crdSetFlag = true;
				}
			});
		};
		$scope.clear = function() {
			$scope.username = "";
			$scope.password = "";
			$scope.url = "";
			User.clearCredentials();
			Server.clearEndpoint();
			$scope.crdSetFlag = false;
		};
	}]).
	controller("ExperimentCtrl", ["$scope","$location","$routeParams","Experiment","Workflow","User",function($scope,$location,$routeParams,Experiment,Workflow,User) {
		if($location.path()=="/experiments") {
			User.getAll().then(function(users) {
				console.log(users);
				$scope.users = users;
			});
		}
		else if($location.path()=="/experiments/all") {
			Experiment.getAll().then(function(experiments) {
				$scope.experiments = experiments;
			});
		}
		else if($location.path().indexOf("/experiments/user/")==0) {
			var username = $routeParams.username;
			Experiment.getByUser(username).then(function(experiments) {
				$scope.experiments = experiments;
			});
		}
		else if($location.path().indexOf("/experiments/id/")==0) {
			var expId = $routeParams.expId;
			Experiment.getById(expId).then(function(experiment) {
				$scope.experiment = experiment;
			});
		}
		else if($location.path().indexOf("/experiments/errors/")==0) {
			var expId = $routeParams.expId;
			Experiment.getById(expId).then(function(experiment) {
				$scope.experiment = experiment;
				var expId = experiment.experimentId;
				var workflowId = experiment.workflowInstanceDataList[0].workflowInstance.workflowExecutionId;
				$scope.workflowErrors = [];
				Workflow.getWorkflowExecutionErrors(expId, workflowId).then(function(workflowErrors) {
					for(item in workflowErrors) {
						var error = workflowErrors[item];
						if(error!={}) { 
							$scope.workflowErrors.push(error);
						}
					}
				});
				var nodesList = experiment.workflowInstanceDataList[0].nodeDataList;
				$scope.nodeErrors = [];
				for(i in nodesList) {
					Workflow.getNodeExecutionErrors(expId, workflowId,nodesList[i].nodeId).then(function(nodeErrors) {
						for(item in nodeErrors) {
							var error = nodeErrors[item];
							if(error!={}) {
								error.type = nodesList[i].type;
								$scope.nodeErrors.push(error);
							}
						}
					});
				}
			});
		}
	}]).
	controller("ProjectCtrl", ["$scope","Project",function($scope,Project) {
		Project.getAll().then(function(projects) {
			$scope.projects = projects;
		});
	}]).
	controller("WorkflowCtrl", ["$scope","$location","$routeParams","Experiment","Workflow",function($scope,$location,$routeParams,Experiment,Workflow) {
		if($location.path()=="/workflows") {
			Workflow.getAll().then(function(workflows) {
				$scope.workflows = workflows;
			});
		}
		else if($location.path().indexOf("/experiments/errors/")==0) {
			var expId = $routeParams.expId;
			var workflowId = $routeParams.workflowId;
			Experiment.getById(expId).then(function(experiment) {
				var expId = experiment.experimentId;
				var workflowList = experiment.workflowInstanceDataList;
				$scope.workflowErrors = [];
				$scope.nodeErrors = [];
				for(i in workflowList) {
					// Get only the particular workflow error details.
					if(workflowId==workflowList[i].workflowInstance.workflowExecutionId) {
						$scope.workflow = workflowList[i];
						Workflow.getWorkflowExecutionErrors(expId, workflowId).then(function(workflowErrors) {
							for(item in workflowErrors) {
								var error = workflowErrors[item];
								if(error!={}) { 
									$scope.workflowErrors.push(error);
								}
							}
						});
						var nodesList = workflowList[i].nodeDataList;
						for(i in nodesList) {
							Workflow.getNodeExecutionErrors(expId, workflowId,nodesList[i].nodeId).then(function(nodeErrors) {
								for(item in nodeErrors) {
									var error = nodeErrors[item];
									if(error!={}) {
										error.type = nodesList[i].type;
										$scope.nodeErrors.push(error);
									}
								}
							});
						}
					}
				}
			});
		}
	}]);

// Services
angular.module("services",["config"]).
	factory("Project",["$http","User","Server", function($http, User, Server) {
		return {
			getAll : function() {
				return $http({method:"GET", url:Server.getEndpoint()+"api/projectregistry/get/projects",
					cache : true, withCredentials : true}).
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
	factory("Experiment",["$http","User","Server", function($http, User, Server) {
		return {
			getAll : function() {
				return $http({method:"GET", url:Server.getEndpoint()+"api/experimentregistry/get/experiments/all",
					cache : true, withCredentials : true}).
				then(function(response) {
					console.log(response);
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
			getByUser : function(username) {
				return $http({method:"GET", url:Server.getEndpoint()+"api/provenanceregistry/get/experiment/user?username="+username,
					cache : true, withCredentials : true}).
				then(function(response) {
					console.log(response);
					var results = response.data.experimentDataList;
					var experiments = [];
					for (var item in results) {
						var experiment = {};
						experiment.id = results[item].experimentId;
						experiment.template = results[item].workflowInstanceDataList[0].workflowInstance.templateName;
						experiment.executionStatus = results[item].workflowInstanceDataList[0].workflowInstanceStatus.executionStatus;
						experiment.updatedDate = new Date(results[item].workflowInstanceDataList[0].workflowInstanceStatus.statusUpdateTime).toLocaleString();
						experiment.username = results[item].user;
						experiments.push(experiment);
					}
					return experiments;
				}, function(error) {
					console.log("Error occured while fetching experiments !");
				});
			},
			getById : function(expId) {
				return $http({method:"GET", url:Server.getEndpoint()+"api/provenanceregistry/get/experiment?experimentId="+expId,
					cache : false, withCredentials : true}).
				then(function(response) {
					return response.data;
				}, function(error) {
					console.log("Error occured while fetching experiment with id "+expId);
				});
			}
		};
	}]).
	factory("Workflow",["$http","User","Server", function($http, User, Server) {
		return {
			getAll : function() {
				return $http({method:"GET", url:Server.getEndpoint()+"api/userwfregistry/get/workflows",
					cache : true, withCredentials : true}).
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
			},
			getWorkflowExecutionErrors : function(expId,workflowId) {
				return $http({method:"GET", url:Server.getEndpoint()+"api/provenanceregistry/workflow/errors?experimentId="+expId+"&workflowInstanceId="+workflowId,
					cache : false, withCredentials : true}).
				then(function(response) {
					return response.data.workflowExecutionErrorList;
				}, function(error) {
					console.log("Error occured while fetching execution errors for workflow with id "+workflowId);
				});
			},
			getNodeExecutionErrors : function(expId,workflowId,nodeId) {
				return $http({method:"GET", url:Server.getEndpoint()+"api/provenanceregistry/node/errors?experimentId="+expId+"&workflowInstanceId="+workflowId+"&nodeId="+nodeId,
					cache : false, withCredentials : true}).
				then(function(response) {
					return response.data.nodeExecutionErrorList;
				}, function(error) {
					console.log("Error occured while fetching execution errors for workflow id "+workflowId+" with node id "+nodeId);
				});
			}
		};
	}]);

// Utils
angular.module("config",["encoder"]).
factory("User",["$http","Base64","Server", function($http,Base64,Server) {
	var _username = "admin";
	return {
		getAuthHeader : function(username,password) {
			var token = username + ':' + password;
			return "Basic " + Base64.encode(token);
		},
		clearCredentials : function() {
			_username = "";
			return;
		},
		getUsername : function() {
			return _username;
		},
		login : function(username,password) {
			_username = username;
			$http.defaults.headers.common.Authorization = this.getAuthHeader(username,password);
			return $http({method:"GET", url:Server.getEndpoint()+"api/congfigregistry/get/eventingservice/uri",
				cache : false}).
			then(function(response) {
				return true;
			}, function(error) {
				console.error("Error logging in with username "+_username+" and the password you provided");
				return false;
			});
		},
		getAll : function() {
			return $http({method:"GET", url:Server.getEndpoint()+"api/userregistry/get/user/all",
				cache : false, withCredentials : true}).
			then(function(response) {
				console.log(response);
				return response.data.userList;
			}, function(error) {
				console.log("Error occured while fetching list of users");
			});
		}
	};
}]).
factory("Server",[function() {
	var _url = "http://localhost:8080/airavata-registry/";
	function endsWith(str, suffix) {
	    return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}
	return {
		setEndpoint : function(url) {
			if(!endsWith(url,"/"))
				url += "/";
			_url = url;
			return;
		},
		clearEndpoint : function() {
			_url = "";
			return;
		},
		getEndpoint : function() {
			return _url;
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
