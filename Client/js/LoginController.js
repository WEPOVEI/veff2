angular.module('ChatClient').controller('LoginController',['$scope', '$location', '$rootScope', '$routeParams', 'socket', function ($scope, $location, $rootScope, $routeParams, socket) {
	
	$scope.errorMessage = '';
	$scope.nickname = '';
	$scope.activeusers = [];

	$scope.login = function() {			
		if ($scope.nickname === '') {
			$scope.errorMessage = 'Please choose a nick-name before continuing!';
		} else {
			socket.emit('adduser', $scope.nickname, function (available) {
				if (available) {
					$location.path('/rooms/' + $scope.nickname);
				} else {
					$scope.errorMessage = 'This nick-name is already taken!';
				}
			});			
		}
	};

	$("#nickname").keyup(function(event){
	    if(event.keyCode == 13){
	        $("#login").click();
	    }
	});

	socket.emit('users');
	socket.on('userlist', function (listofusers){
		$scope.activeusers = listofusers;
	});
}]);