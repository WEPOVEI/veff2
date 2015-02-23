var ChatClient = angular.module('ChatClient', ['ngRoute']);

// Allows us to execute code after ngrepeat
ChatClient.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
});

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
	$scope.kickedmessage = true; 
	$scope.bannedmessage = true;


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
		$scope.hidden = !$scope.hidden; //show/hide
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
	/* show warning for kicked user*/
	if($routeParams.user === $rootScope.sparkad){
		console.log("jallajallajallajalla");
		$scope.kickedmessage = false;
		$rootScope.sparkad = undefined;
	}
	/*show warning for banned user*/
	if($routeParams.user === $rootScope.bannad){
		$scope.bannedmessage = false;
		$scope.bannad = undefined;
	}
});

ChatClient.controller('RoomController', function ($scope, $location, $rootScope, $routeParams, socket) {
	$scope.currentRoom = $routeParams.room;
	$scope.currentUser = $routeParams.user;
	$scope.currentUsers = [];
	$scope.errorMessage = '';
	$scope.comment = '';
	$scope.emptyComment = '';
	$scope.commentHistory = [];
	$scope.hide = true;
	$scope.errorPM = '';
	$scope.pmHistory = [];
/* scope variables for kicked function */
	



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
			$('#comment').val('');
		}
	};

	$scope.returnLobby = function(){
		socket.emit('partroom', $scope.currentRoom);
		$location.path('/rooms/' + $scope.nickname);
	};


	//$scope.model = { selected : ""};

	$scope.kickUser = function(user){
		//$scope.model.selected = user;
		var kick = confirm("Are you sure you want to kick " + user + "?");
		
		if(kick === true){

			kickObj={
				user: user,
				room: $scope.currentRoom
			};

			socket.emit('kick', kickObj, function (kicked){
				if(!kicked){
					 alert("Kick error occurred. Are you sure you are op"); //TODO: point to op if he want's someone kicked out	 
				}

			});
		}
	};
	//user that has been kicked by op should be redirected to lobby
	socket.on('kicked', function (room, kickeduser, operator){
		//console.log("kicked from room: " + room + " " + "userkicked: " + kickeduser + " " + "kicked by " +operator);
		//redirect kicked user back to lobby
		if(kickeduser === $scope.currentUser){
			//console.log("inside kicked" + "current user is "+ kickeduser);
			$rootScope.sparkad = kickeduser;
			console.log($rootScope.sparkad);
			$location.path('/rooms/' + kickeduser);
			
		}
	});

	$scope.banUser = function(user){
		var ban = confirm("Do you want to ban " + user + " from the chat?");
		if(ban === true){

			var banObj = {
				user: user,
				room: $scope.currentRoom
			};

			socket.emit('ban', banObj, function (banned){
				if(!banned){
					alert("Error occured, only ops can ban people");
				}
			});
		}
	};

	socket.on('banned', function (room, banneduser, operator){

		if(banneduser === $scope.currentUser){
			$rootScope.bannad = banneduser;
			$location.path('/rooms/' + banneduser);
		}
	});

	$scope.sendPM = function(){
		console.log("pmTo " + $scope.pmTo);
		console.log("pm " + $scope.pm);	

		if($scope.pm === '') {
			$scope.emptyComment = 'Please write a comment!';
		}else {
			var pmObj = {
				nick : $scope.pmTo,
				message : $scope.pm
			};
			socket.emit('privatemsg', pmObj, function (success){
				if(!success){
					$scope.errorPM = "Cannot send message";
				}
			});
			$('#pm').val('');
		}
	};
	socket.on('recv_privatemsg', function (username, message){
		console.log("recv");
		console.log(username + "fekk message");
		var pm = {
			nick : username,
			message : message
		};
		$scope.pmHistory.push(pm);
	});

	$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
		// Sets the scrollbars at the bottom 
    	$(".chatlist").scrollTop($(".chatlist")[0].scrollHeight);
    	$(".pmlist").scrollTop($(".pmlist")[0].scrollHeight);
	});
});
