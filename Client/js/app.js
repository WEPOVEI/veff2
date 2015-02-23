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
});

ChatClient.controller('RoomsController', function ($scope, $location, $rootScope, $routeParams, socket) {
	// TODO: Query chat server for active rooms
	$scope.rooms =  [];
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

	$scope.disconnect = function(){
		alert("Vhinnir!");
	};

	//New Room button clicked, user wants to create a new rooom 
	$scope.newRoom = function(){
		$scope.hidden = !$scope.hidden; //show/hide
	};
	$scope.submitRoom = function(){
		if($scope.roomname !== undefined){
			var newRoomObj = {
				room: $scope.roomname
				//pass : $scope.pass
			};
			socket.emit('joinroom', newRoomObj, function (success, reason){
				if (!success){
					$scope.errorMessage = reason;
				}
			});
			$('#newRoom').val('');
		}	
	};

	$("#newRoom").keyup(function(event){
	    if(event.keyCode == 13){
	        $("#submitRoom").click();
	    }
	});

	socket.on('updateRooms', function (room){
		if(room !== undefined){
			$scope.rooms.push(room);
		}
	});

	if($routeParams.user === $rootScope.sparkad){
		$scope.kickedmessage = false;
		$rootScope.sparkad = undefined;
	}
	/*show warning for banned user*/
	if($routeParams.user === $rootScope.bannad){
		$scope.bannedmessage = false;
		$rootScope.bannad = undefined;
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
	$scope.selfkick = true;
	$scope.oppedmessage = true;
  	$scope.deoppedmessage = '';

	socket.on('updateusers', function (roomName, users, ops) {
		// TODO: Check if the roomName equals the current room !
		if(roomName === $scope.currentRoom){
			$scope.currentUsers = users;
		}
	});
	socket.on('updatechat', function (room, messages) {
		$scope.commentHistory = messages;
	});

    var obj = { room : $scope.currentRoom };
	socket.emit('joinroom', obj, function (success, reason) {
		if (!success)
		{
			$scope.errorMessage = reason;
			$rootScope.bannad = $scope.currentUser;
			$location.path('/rooms/' + $scope.currentUser);
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

	$("#comment").keyup(function(event){
	    if(event.keyCode == 13){
	        $("#addComment").click();
	    }
	});

	$scope.returnLobby = function(){
		socket.emit('partroom', $scope.currentRoom);
		$location.path('/rooms/' + $scope.nickname);
	};


	//$scope.model = { selected : ""};

	$scope.kickUser = function(user){
		/* current user won't kick himself */
		if(user !== $scope.currentUser){
			var kick = confirm("Are you sure you want to kick " + user + "?");
		}

		else{
			/*warning message if current user tries to kick himself */
			$scope.selfkick = false;
		}

		if(kick === true){

			kickObj={
				user: user,
				room: $scope.currentRoom
			};

			/*op cannot kick himself*/
			if(user != $scope.currentUser){

				socket.emit('kick', kickObj, function (kicked){
					if(!kicked){
					 	alert("Kick error occurred. Are you sure you are op"); //TODO: point to op if he want's someone kicked out	 
					}

				});
			}
		}
	};
	//user that has been kicked by op should be redirected to lobby
	socket.on('kicked', function (room, kickeduser, operator){
		//redirect kicked user back to lobby
		if(kickeduser === $scope.currentUser){
			$rootScope.sparkad = kickeduser;
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

	$scope.opUser = function (user){

		var opuser = confirm("do you want to op " + user + "?");
		if(opuser === true){
			opObj = {
				user: user,
				room: $scope.currentRoom
			};
			socket.emit('op', opObj, function (opped){
				if(!opped){
					alert("Error occured, only ops can op another users");
				}
			});
		}
	};
	socket.on('opped', function (room, oppeduser, operator){
		if(oppeduser === $scope.currentUser){
			$scope.oppedmessage = false;
		}

	});

	$scope.deopUser = function (user){
		var deopuser = confirm("you are about to deop " + user  +". Are you sure you want to proceed?" + user + " will lose all op privileges.");
		if(deopuser === true){
			deopObj = {
				user : user,
				room: $scope.currentRoom
			};
			socket.emit('deop', deopObj, function (deopped){
				if(!deopped){
					alert("Error occured, only ops can deop");
				}
			});
		}
	};
	socket.on('deopped', function (room, deoppeduser, operator){
		if(deoppeduser === $scope.currentUser){
			$scope.deoppedmessage = "Unfortunately you've just been deopped by " + operator + ". If that seems unfair to you I suggest that you take it up with him. Why not send him a private message";
		}
	});


	$scope.sendPM = function(){
		if($scope.pm === '') {
			$scope.errorPM = 'Please write a comment!';
		}else if($scope.pmTo == ''){
			$scope.errorPM = 'Please select a user';
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
		if(username !== undefined && message !== undefined){
			var pm = {
				nick : username,
				message : message
			};
			$scope.pmHistory.push(pm);
		}
	});

	$("#pm").keyup(function(event){
	    if(event.keyCode == 13){
	        $("#sendPM").click();
	    }
	});

	$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
		// Sets the scrollbars at the bottom 
    	$(".chatlist").scrollTop($(".chatlist")[0].scrollHeight);
    	$(".pmlist").scrollTop($(".pmlist")[0].scrollHeight);
	});
});
