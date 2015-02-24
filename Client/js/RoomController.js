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
	$scope.selfkickbanopdeop = '';
	$scope.oppedmessage = '';
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
		$location.path('/rooms/' + $scope.currentUser);
	};


	$scope.kickUser = function(user){
		/* current user won't kick himself */
		if(user !== $scope.currentUser){
			var kick = confirm("Are you sure you want to kick " + user + "?");
		}

		else{
			/*warning message if current user tries to kick himself */
			$scope.selfkickbanopdeop = "Unfortunately you can not kick your self out of the chat. Just leave the room if you wish to leave.";
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
		if(user !== $scope.currentUser){
			var ban = confirm("Do you want to ban " + user + " from the chat?");
		}
		else{
			$scope.selfkickbanopdeop = "Unfortunately you can not ban your self. If you really want to be banned i suggest you op another user and then get him to ban you!";
		}
		
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

		if(user !== $scope.currentUser){
			var opuser = confirm("do you want to op " + user + "?");
		}
		else{
			$scope.selfkickbanopdeop = "Are you trying to op yourself? That's not going to happen."
		}
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
			$scope.oppedmessage = "Congratulations! You are now officially an operator of this room. But remember, with great power comes great responsibility!";
		}

	});

	$scope.deopUser = function (user){
		if(user !== $scope.currentUser){
			var deopuser = confirm("you are about to deop " + user  +". Are you sure you want to proceed? " + user + " will lose all op privileges.");
		}
		else{
			$scope.selfkickbanopdeop = "Trying to deop yourself? i suggest you just leave the chat and re-enter";
		}
		if(deopuser === true){
			deopObj = {
				user : user,
				room: $scope.currentRoom
			};
			socket.emit('deop', deopObj, function (deopped){
				if(!deopped){
					alert("Error occured, only ops can deop or maybe that user was never an op!");
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
