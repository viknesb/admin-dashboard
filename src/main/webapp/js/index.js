var app = angular.module("adminMonitorApp",[]);

app.config(function($routeProvider) {
	$routeProvider.
	when('/', {controller:HomeCtrl, templateUrl:'home.html'}).
	when('/edit/:projectId', {controller:EditCtrl, templateUrl:'detail.html'}).
	when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
	otherwise({redirectTo:'/'});
});

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
					'<div ng-view></div>' +
					'<div class="tab-content" ng-transclude></div>' +
				'</div>' +
			'</div>',
		replace : true
	};
});

function HomeCtrl($scope) {
	
}

function EditCtrl($scope) {
	
}

function CreateCtrl($scope) {
	
}

/*$(document).ready(function() {
	
	// Custom Google Search
	(function() {
	    var cx = '001303010279189643848:_pem515tnrk';
	    var gcse = document.createElement('script');
	    gcse.type = 'text/javascript';
	    gcse.async = true;
	    gcse.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') +
	        '//www.google.com/cse/cse.js?cx=' + cx;
	    var s = document.getElementsByTagName('script')[0];
	    s.parentNode.insertBefore(gcse, s);
	})();
});*/