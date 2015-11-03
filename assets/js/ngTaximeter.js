var ngTaximeter = angular.module('ngTaximeter',[])
	.controller('TaxiAppController', ['$scope',function($scope){
		$scope.routeInit = false;
		$scope.routeInitiator = function(){
			$scope.routeInit = true;
		}
	}]);