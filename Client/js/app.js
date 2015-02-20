var ChatClient = angular.module('ChatClient', ['ngRoute']);

ChatClient.config(
	function ($routeProvider) {
		$routeProvider
			.when('/login', { templateUrl: 'Views/login.html', controller: 'LoginController' })
			.when('/rooms/:user/', { templateUrl: 'Views/rooms.html', controller: 'RoomsController' })
			.when('/room/:user/:room/', { templateUrl: 'Views/room.html', controller: 'RoomController' })
			.otherwise({
	  			redirectTo: '/login'
			});
	}
);

ChatClient.controller('LoginController', function ($scope, $location, $rootScope, $routeParams, socket) {
	
	$scope.errorMessage = '';
	$scope.nickname = '';

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
});

ChatClient.controller('RoomsController', function ($scope, $location, $rootScope, $routeParams, socket) {
	// TODO: Query chat server for active rooms
	$scope.rooms =  [];//['Room 1','Room 2','Room 3','Room 4','Room 5'];
	$scope.currentUser = $routeParams.user;
	$scope.hidden = true;

	socket.emit('rooms');
	socket.on('roomlist', function (roomser) {
		for(var room in roomser){
			if(room != "lobby"){
				$scope.rooms.push(room);
			}				
		}
	});

	//New Room button clicked, user wants to create a new rooom 
	$scope.newRoom = function(){
		console.log("I clicked on das Button");
		$scope.hidden = !$scope.hidden;
	};
	$scope.submitRoom = function(){
			console.log("here");
		$scope.rooms.push($scope.roomname);
		var newRoomObj = {
			room: $scope.roomname
			//pass : $scope.pass
		};
		socket.emit('joinroom', newRoomObj, function (success, reason){
			if (!success){
				$scope.errorMessage = reason;
			}
			else
				console.log("ekkert ves");
		});
	};
});

ChatClient.controller('RoomController', function ($scope, $location, $rootScope, $routeParams, socket) {
	$scope.currentRoom = $routeParams.room;
	$scope.currentUser = $routeParams.user;
	$scope.currentUsers = [];
	$scope.errorMessage = '';
	$scope.comment = '';
	$scope.emptyComment = '';
	$scope.commentHistory = [];

	socket.on('updateusers', function (roomName, users, ops) {
		// TODO: Check if the roomName equals the current room !
		$scope.currentUsers = users;
	});
	socket.on('updatechat', function (room, messages) {
		$scope.commentHistory = messages;
	});

    var obj = { room : $scope.currentRoom };
	socket.emit('joinroom', obj, function (success, reason) {
		if (!success)
		{
			$scope.errorMessage = reason;
		}
	});

	$scope.addComment = function() {
		
		if($scope.comment === '') {
			$scope.emptyComment = 'Please write a comment!';
		}else {
			var objMessage = {
					roomName : $routeParams.room,
					msg : $scope.comment
			};
			socket.emit('sendmsg', objMessage);
		}
	};

	$scope.returnLobby = function(){
		socket.emit('partroom', $scope.currentRoom);
		$location.path('/rooms/' + $scope.nickname);
	};
});