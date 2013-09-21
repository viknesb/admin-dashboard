'use strict';

describe('adminMonitorApp', function() {
  describe('controllers', function() {
    beforeEach(module('controllers'));
	describe('DateDialogController', function(){
      it('should be defined',
	    inject(function($rootScope, $controller) {
          var scope = $rootScope.$new(), dialog = {};
          var ctrl = $controller("DateDialogController", {$scope : scope, dialog : dialog});
          expect(ctrl).toBeDefined();
      }));
    });
	
	describe('LoginCtrl', function(){
      it('should be defined',
	    inject(function($rootScope, $controller) {
          var scope = $rootScope.$new(), user = {}, server = {};
          var ctrl = $controller("LoginCtrl", {$scope : scope, user : user, server : server});
          expect(ctrl).toBeDefined();
      }));
    });
	
	describe('ExperimentCtrl', function(){
      it('should be defined',
	    inject(function($rootScope, $controller, $location, $routeParams) {
          var scope = $rootScope.$new();
          var ctrl = $controller("ExperimentCtrl", {$scope : scope, $location : $location, $routeParams : $routeParams, Experiment : {}, Workflow : {}, User : {}});
          expect(ctrl).toBeDefined();
      }));
    });
	
	describe('ProjectCtrl', function(){
      it('should be defined',
	    inject(function($rootScope, $controller, $httpBackend) {
          var scope = $rootScope.$new();
		  $httpBackend.when('GET', 'api/projectregistry/get/projects').respond({});
          var ctrl = $controller("ProjectCtrl", {$scope : scope, project : {}});
          expect(ctrl).toBeDefined();
      }));
    });
	
	describe('WorkflowCtrl', function(){
      it('should be defined',
	    inject(function($rootScope, $controller, $location, $routeParams) {
          var scope = $rootScope.$new();
          var ctrl = $controller("WorkflowCtrl", {$scope : scope, $location : $location, $routeParams : $routeParams, Experiment : {}, Workflow : {}, User : {}});
          expect(ctrl).toBeDefined();
      }));
    });
	
  });
  
  describe('services', function() {
    var project,experiment,workflow;
    beforeEach( function() {
	  module('services');
	  inject(function(Project,Experiment,Workflow) {
	    project = Project;
		experiment = Experiment;
		workflow = Workflow;
	  });
	});
	
	describe('Project Service', function() {
	  it('should have an getAll function', function () { 
        expect(angular.isFunction(project.getAll)).toBe(true);
      });
	});
	
	describe('Experiment Service', function() {
	  it('should have an getAll function', function () { 
        expect(angular.isFunction(experiment.getAll)).toBe(true);
      });
	  it('should have an getByUser function', function () { 
        expect(angular.isFunction(experiment.getByUser)).toBe(true);
      });
	  it('should have an getById function', function () { 
        expect(angular.isFunction(experiment.getById)).toBe(true);
      });
	  it('should have an search function', function () { 
        expect(angular.isFunction(experiment.search)).toBe(true);
      });
	});
	
	describe('Workflow Service', function() {
	  it('should have an getAll function', function () { 
        expect(angular.isFunction(workflow.getAll)).toBe(true);
      });
	  it('should have an getWorkflowExecutionErrors function', function () { 
        expect(angular.isFunction(workflow.getWorkflowExecutionErrors)).toBe(true);
      });
	  it('should have an getNodeExecutionErrors function', function () { 
        expect(angular.isFunction(workflow.getNodeExecutionErrors)).toBe(true);
      });
	});
  });
  
  describe('config', function() {
    var user,server;
    beforeEach( function() {
	  module('config');
	  inject(function(User,Server) {
	    user = User;
		server = Server;
	  });
	});
	
	describe('User Service', function() {
	  it('should have an getAuthHeader function', function () { 
        expect(angular.isFunction(user.getAuthHeader)).toBe(true);
      });
	  it('should have an clearCredentials function', function () { 
        expect(angular.isFunction(user.clearCredentials)).toBe(true);
      });
	  it('should have an getUsername function', function () { 
        expect(angular.isFunction(user.getUsername)).toBe(true);
      });
	  it('should have an login function', function () { 
        expect(angular.isFunction(user.login)).toBe(true);
      });
	  it('should have an getAll function', function () { 
        expect(angular.isFunction(user.getAll)).toBe(true);
      });
	});
	
	describe('Server Service', function() {
	  it('should have an setEndpoint function', function () { 
        expect(angular.isFunction(server.setEndpoint)).toBe(true);
      });
	  it('should have an clearEndpoint function', function () { 
        expect(angular.isFunction(server.clearEndpoint)).toBe(true);
      });
	  it('should have an getEndpoint function', function () { 
        expect(angular.isFunction(server.getEndpoint)).toBe(true);
      });
	});
  });
});