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