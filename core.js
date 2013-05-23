  Parse.initialize("QsJUmLOkFPtUiduOu0A1rm0Uy11fzkaJ1MMlTYiM",
					 "aBRAKSiEGM8VHXNrtwPHY9qKz1lD02711r3Pj3Kx");
	google.maps.event.addDomListener(window, 'load', mapInitialize);
	
	
	// Images upload ---------------------------------------------------------------------------------
	
	var imgurl = '';
	$(function() {
		var file;
		
		// Set an event listener on the Choose File field.
		$('#fileselect').bind("change", function(e) {
		  var files = e.target.files || e.dataTransfer.files;
		  // Our file var now holds the selected file
		  file = files[0];
	});
	
	
	// This function is called when the user clicks on Upload to Parse.
	// It will create the REST API request to upload this image to Parse.
	$('#uploadbutton').click(function() {
	  var serverUrl = 'https://api.parse.com/1/files/' + file.name;
	  
	  $.ajax({
		type: "POST",
		beforeSend: function(request) {
		  request.setRequestHeader("X-Parse-Application-Id", 'QsJUmLOkFPtUiduOu0A1rm0Uy11fzkaJ1MMlTYiM');
		  request.setRequestHeader("X-Parse-REST-API-Key", 'nNHQo25As2jKBFCCsIyY4Rfl19FYiZ6APZGFZiiQ');
		  request.setRequestHeader("Content-Type", file.type);
		},
		url: serverUrl,
		data: file,
		processData: false,
		contentType: false,
		success: function(data) {
		  imgurl = data.url;
		  document.getElementById("img").innerHTML = "<img src='" + data.url + "' style='max-width:80px; max-height:80px;' id='imgurl'>";
		},
		error: function(data) {
		  var obj = jQuery.parseJSON(data);
		  alert(obj.error);
		}
	  });
	});
	
  });

	// Google map ------------------------------------------------------------------------------------
	
	var map;
	var myLocation = new Parse.GeoPoint({latitude: 44.49528086931113, longitude: 11.341838836669922}); // a default value
	var myCenter = new google.maps.LatLng(44.49528086931113,11.341838836669922); // a default value
	var marker_placed = false;
	var marker;
	
	// Map initialization
	function mapInitialize() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(showPosition);
			updateChallengesList(); // When the map is initialized, download the list of challenges
		} else {
			alert("Geolocation is not supported by this browser.");
		}
	}
	
	// Gets your current position through internet connection info or GPS
	function showPosition(position) {
		myLocation = new Parse.GeoPoint({latitude: position.coords.latitude, longitude: position.coords.longitude});
		myCenter = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		
		var mapProp = {
			center:myCenter,
			zoom:13,
			mapTypeId:google.maps.MapTypeId.ROADMAP,
			panControl:true,
			zoomControl:true,
			mapTypeControl:true,
			scaleControl:true,
			streetViewControl:true,
			overviewMapControl:true,
			rotateControl:true
		};
		map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
		
		google.maps.event.addListener(map, 'click', function(event) {
			placeMarker(event.latLng);
		});
		
	}
	
	// Places the bouncing marker on map "click" event
	function placeMarker(location) {
	  if(!marker_placed && isLogged) {
		  marker_placed = true;
		  marker = new google.maps.Marker({
			draggable: true,
			position: location,
			map: map,
			icon:'img/markerred.png',
			animation:google.maps.Animation.BOUNCE
		  });
		  marker.setVisible(true);
		  
		  // Shows current LAT and LNG of the marker on the webpage
		  document.getElementById("latbox").innerHTML = marker.getPosition().lat().toFixed(5);
		  document.getElementById("lngbox").innerHTML = marker.getPosition().lng().toFixed(5);
		  map.panTo(marker.getPosition());
		  
		  google.maps.event.addListener(marker, 'dragend', function (event) {
				document.getElementById("latbox").innerHTML = this.getPosition().lat().toFixed(5);
				document.getElementById("lngbox").innerHTML = this.getPosition().lng().toFixed(5);
				map.panTo(this.getPosition());
		  		marker.setAnimation(google.maps.Animation.BOUNCE);
			});
	  }
	}
	
	// Places the specific markers corresponding to the shown challenges.
	function placeStoredMarker(location, color, message) {
	  var marker = new google.maps.Marker({
		position: location,
		map: map,
		icon:color
	  });
	  
	  var infowindow = new google.maps.InfoWindow(
		{ content: message,
		  size: new google.maps.Size(50,50)
		});
	  google.maps.event.addListener(marker, 'click', function() {
		infowindow.open(map,marker);
	  });
	}
	
	// Calls the initialization of the map
	google.maps.event.addDomListener(window, 'load', mapInitialize);
	
  // Users -------------------------------------------------------------------------------------------
  
  // Boolean that keeps track of the user status
  var isLogged = false;
  
  // Check the user status and show the appropriate form on the webpage
  function checkCurrentUser() {
	var currentUser = Parse.User.current();
	if (currentUser) {
		// if it's logged, show "log-out"
		showLogOut();
		document.getElementById('currentusername').innerHTML = "Hi, " + currentUser.get("username") + ".";
	} else {
		// if it isn't, show "log-in" (or "sign-in")
		showSignIn();
	}
  }
  
  // Show the "sign-up" form on the webpage
  function showSignUp() {
	isLogged = false; // and keep track of the status
	$(".signup").show();
	$(".signin").hide();
	$(".logout").hide();
	$(".newch").hide(500);
	$(".home-add").hide(500);
  }
  
  // Show the "log-in" (or "sign-in") form on the webpage
  function showSignIn() {
	isLogged = false; // and keep track of the status
	$(".signin").show();
	$(".signup").hide();
	$(".logout").hide();
	$(".newch").hide(500);
	$(".home-add").hide(500);
  }
  
  // Show the "log-out" form on the webpage
  function showLogOut() {
	isLogged = true; // and keep track of the status
	$(".newch").show(500);
	$(".home-add").show(500);
	$(".logout").show();
	$(".signin").hide();
	$(".signup").hide();
  }
  
  // Retrives data from the form on the webpage and signs-up a new user
  function signUp() {
	var user = new Parse.User();
	user.set("username", document.getElementById('newuser').value);
	user.set("password", document.getElementById('newpwd').value);
	user.set("email", document.getElementById('newemail').value);
	 
	user.signUp(null, {
	  success: function(user) {
		document.getElementById('currentusername').innerHTML = "Welcome, " + user.get("username") + ".";
		showLogOut(); // and shows the "log-out" form
	  },
	  error: function(user, error) {
		alert("Error: " + error.code + " " + error.message);
	  }
	});
  }
  
  // Retrives data from the form on the webpage and logs-in the user
  function logIn() {
	var user = new Parse.User();
	Parse.User.logIn(document.getElementById('user').value, document.getElementById('pwd').value, {
	  success: function(user) {
		document.getElementById('currentusername').innerHTML = "Hi, " + user.get("username") + ".";
		showLogOut(); // and shows the "log-out" form
	  },
	  error: function(user, error) {
		alert("Error: " + error.code + " " + error.message);
	  }
	});
  }
  
  // logs-out the user
  function logOut() {
	Parse.User.logOut();
	showSignIn(); // and shows the "log-in" (or "sign-in") form
  }
  
  
  // Challenges --------------------------------------------------------------------------------------
  
  var stored_challenges = new Array(); // stores the challenges every time that are downloaded from the server
  var detailsShown = -1; // number of the challenge whose details are shown -- when it's -1, details section is hidden
  
  // Retrieves data from the form on the webpage and calls the specific Cloud Function to post a new challenge
  function postChallenge() {
	
	var mediaArray = new Array(); // stores the url of the uploaded media.
	mediaArray.push(document.getElementById('imgurl').src); // In this moment is only 1 media, but in the future could be as well more than 1.
	
	Parse.Cloud.run('postChallenge', {	name: document.getElementById('chTitle').value,
										description: document.getElementById('chDesc').value,
										category: document.getElementById('chCat').value,
										tags: document.getElementById('chTags').value,
										lat: parseFloat(document.getElementById('latbox').textContent),
										lng: parseFloat(document.getElementById('lngbox').textContent),
										media: mediaArray
									 } , {
	  success: function(object) {
		detailsShown = -1;
		$("#details").hide();
		updateChallengesList();
		document.getElementById('newch').reset();
		marker.setVisible(false);
		marker_placed = false;
	  },
	  error: function(model, error) {
		alert("Error: " + error.code + " " + error.message);
	  }
	});
  }
  
  // Downloads an updated list of challenges from the database, and shows them on the webpage
  function updateChallengesList() {
	
	Parse.Cloud.run('getChallenges', {	type: 'local',
										maxobjects: 10,
										within: 100000,
										detailLevel: 'high'
									 } , {
	  success: function(results) {
		var i;
		document.getElementById('list').innerHTML = "";
		
		// Show all the challenges, one by one, creating its HTML elements.
		for(i=0; i<results.length; i++) {
			var currentChallenge = results[i];
			stored_challenges[i] = results[i];
			
			document.getElementById('list').innerHTML += "<figure><a href='javascript:showDetails(" +
			i + ")' class='thumb'><img src='" +
			currentChallenge.get("imgurl") + "' /></a><figcaption><strong>" +
			currentChallenge.get("name") + "</strong><span>" +
			currentChallenge.get("description") + " (" +
			currentChallenge.get("category") + ")</span></figcaption></figure>";
			
			var markercolor = 'img/markerred.png';
			if(currentChallenge.get("category") == "Event") {
				markercolor = 'img/markerblue.png';
			} else if(currentChallenge.get("category") == "Church") {
				markercolor = 'img/markerchurch.png';
			} else if(currentChallenge.get("status") == "solved") {
				markercolor = 'img/markergreen.png';
			} else if(currentChallenge.get("status") == "pending") {
				markercolor = 'img/markeryellow.png';
			}
			placeStoredMarker(new google.maps.LatLng(currentChallenge.get("lat"),currentChallenge.get("lng")), markercolor, "<a href='javascript:showDetails(" +	i + ")' class='thumb'>" + currentChallenge.get("name") + "</a>");
			
			if(detailsShown>=0) {
				showDetails(detailsShown);
			}
		}
	  },
	  error: function(error) {
		alert("Error: " + error.code + " " + error.message);
	  }
	});
	
  }
  
  // Shows the details box and fills it in with the details of to the challenge in position "i"
  // on the stored_challenges array, creating the HTML elements to display it.
  function showDetails(i) {
	
	// Shows the box
	$("#details").show();
	
	// Creates the HTML elements for the body of the challenge
	document.getElementById('details').innerHTML = "<table><tr><td style='min-width:200px'><img src='" +
			stored_challenges[i].get("imgurl") + "' style='max-height:400px; max-width:400px' /></td><td style='padding-left:20px; width:700px;'><div style='text-align:right'> <a href='javascript:takePart(" + i + ")' class='theme-link-button'>Take Part</a></div><h2>" +
			stored_challenges[i].get("name") + "</h2>" +
			stored_challenges[i].get("category") + "<p>" +
			stored_challenges[i].get("description") + "</p></td></tr></table><br><br><h3>Replies:</h3><br><br>";
			
	// Creates the HTML elements to show the replies
	if(stored_challenges[i].get("replies")) {
		var j;
		for(j=parseInt(stored_challenges[i].get("replies").length)-1; j>=0; j--) {
			var str1 = JSON.stringify(stored_challenges[i].get("replies")[j].get("text"), null, 4);
			var str2 = JSON.stringify(stored_challenges[i].get("replies")[j].get("author").get("username"), null, 4);
			
			document.getElementById('details').innerHTML += "<div style='color:#111; background-color:#BABABA; display:block; min-width:500px; max-width:500px;'>" + str1.substring(1, str1.length - 1) + "</div><div style='display:block; min-width:500px; max-width:500px; text-align:right;'>" + str2.substring(1, str2.length - 1) + "</div><br>";
		}
	}

	// Adds the form to post replies to the challenge
	// (in the future this should display only if the user is a participant of the challenge)
	document.getElementById('details').innerHTML += "<br><div style='color:#111; display:block; min-width:500px; max-width:500px;' id='chReplyForm' class='chReplyForm'><form id='newchre' class='newchre' action='#'><label for='reply'>Post a new reply:</label><br><textarea name='chReply' id='chReply' rows='0' cols='0' style='min-width:480'></textarea><div style='width:100%; text-align:right;'><input type='button' name='chPost' id='chPost' class='chPost' onClick='postChallengeReply(" + i + ")' value='Post'></div></form><br><br><br>";
	
	// Keeps track of which challenge are shown the details
	detailsShown = i;
	
  }
  
  // The user sends a request to become participant of the "i" challenge
  function takePart(i) {
	
	var tmpChallenge = new Parse.Object("Challenge");
	tmpChallenge = stored_challenges[i];
	
	Parse.Cloud.run('takePart', {	challengeId: tmpChallenge.id
									 		} , {
	  success: function(object) {
		
	  },
	  error: function(model, error) {
		alert("Error: " + error.code + " " + error.message);
	  }
	});
  }
  
  // *** unconnected function *** 
  // Posts a comment to the challenge in position "i" on the stored_challenges array
  function postChallengeComment(i) {
	
	var tmpChallenge = new Parse.Object("Challenge");
	tmpChallenge = stored_challenges[i];
	
	Parse.Cloud.run('postChallengeComment', {	challengeId: tmpChallenge.id,
												text: "comment comment"
									 		} , {
	  success: function(object) {
		
	  },
	  error: function(model, error) {
		alert("Error: " + error.code + " " + error.message);
	  }
	});
  }
  
  // Team --------------------------------------------------------------------------------------------
  
  // *** unconnected function *** 
  function getTeam() {
	Parse.Cloud.run('getTeam', {	"teamId": "MzBjzmFli2"
								} , {
		success: function(object) {
			alert("ok");
		},
		error: function(model, error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
  }
  
  // *** unconnected function *** 
  function replyTeamPost() {
	Parse.Cloud.run('replyTeamPost', {	"postId": "tJscg4GOpQ",
	  									"text": document.getElementById('chTitle').value
									} , {
		success: function(object) {
			alert("ok");
		},
		error: function(model, error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
  }
  
  // *** unconnected function *** 
  function newTeamPost() {
	Parse.Cloud.run('newTeamPost', {	"teamId": "MzBjzmFli2",
	  									"text": document.getElementById('chTitle').value
									} , {
		success: function(object) {
			alert("ok");
		},
		error: function(model, error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
  }

  // *** unconnected function *** 
  function setTeamLeader(i) {
	var tmpChallenge = new Parse.Object("Challenge");
	tmpChallenge = stored_challenges[i];
	
	Parse.Cloud.run('setTeamLeader', {	"userId": "78C1rncbUS"
									 } , {
		success: function(object) {
			alert("ok");
		},
		error: function(model, error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
  }
  
  // *** unconnected function *** 
  function addTeam() {
	  var user = new Parse.User();
	  user.id = "pVzSLiCpqu";
	  
	  var user1 = new Parse.User();
	  user1.id = "78C1rncbUS";
	  
	  var chrorg = new Parse.Object("ChrOrg");
	  chrorg.set("name", document.getElementById('chTitle').value);
	  chrorg.set("user", user);
	  chrorg.save();
	  
	  var team = new Parse.Object("Team");
	  team.set("chrorg", chrorg);
	  team.set("leader", user1);
	  team.save();
  }
  
  // *** unconnected function *** 
  function postChallengeReply(i) {
	
	var tmpChallenge = new Parse.Object("Challenge");
	tmpChallenge = stored_challenges[i];
	
	Parse.Cloud.run('postChallengeReply', {	challengeId: tmpChallenge.id,
											text: document.getElementById('chReply').value
									 } , {
	  success: function(object) {
		//alert("sent");
		updateChallengesList();
	  },
	  error: function(model, error) {
		alert("Error: " + error.code + " " + error.message);
	  }
	});
  }
  
  // *** unconnected function *** 
  function addTeam() {
	
	Parse.Cloud.run('addTeam', null , {
	  success: function(object) {
	  },
	  error: function(model, error) {
		alert("Error: " + error.code + " " + error.message);
	  }
	});
  }
  
  // *** unconnected function *** 
  function removeTeam() {
	
	Parse.Cloud.run('removeTeam', { teamId: "VTFCD2iDzm" }, {
	  success: function(object) {
	  },
	  error: function(model, error) {
		alert("Error: " + error.code + " " + error.message);
	  }
	});
  }
  
  // Actions -----------------------------------------------------------------------------------------
  
  // *** unconnected function *** 
  function commentAction() {
	Parse.Cloud.run('commentAction', {	"actionId": "ztmSt1tk3y",
	  									"text": document.getElementById('chTitle').value
									 } , {
		success: function(object) {
			alert("ok");
		},
		error: function(model, error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
  }
  
  // Journal -----------------------------------------------------------------------------------------
  
  // *** unconnected function *** 
  function postJournalEntry() {
	
	Parse.Cloud.run('postJournalEntry', { title: document.getElementById('chTitle').value,
										  text: document.getElementById('chDesc').value
										}, {
	  success: function(object) {
	  },
	  error: function(model, error) {
		alert("Error: " + error.code + " " + error.message);
	  }
	});
  }
  
  // *** unconnected function *** 
  function getJournalEntries() {
	
	Parse.Cloud.run('getJournalEntries', {	maxEntries: document.getElementById('chTitle').value,
											detailLevel: document.getElementById('chTags').value
										}, {
	  success: function(object) {
	  },
	  error: function(model, error) {
		alert("Error: " + error.code + " " + error.message);
	  }
	});
  }
  
  // Media -------------------------------------------------------------------------------------------
  
  // *** unconnected function *** 
  function getMedia() {
	
	Parse.Cloud.run('getMedia', { mediaId: "rd7PFb7cKz"
								}, {
	  success: function(object) {
		alert(object.id + " " + object.get("url"));
	  },
	  error: function(model, error) {
		alert("Error: " + error.code + " " + error.message);
	  }
	});
  }
  
  // *** unconnected function *** 
  function postMediaComment() {
	
	Parse.Cloud.run('postMediaComment', {	mediaId: "rd7PFb7cKz",
											text: "comment comment"
									 	} , {
	  success: function(object) {
		alert(object.id);
	  },
	  error: function(model, error) {
		alert("Error: " + error.code + " " + error.message);
	  }
	});
  }
  
  // Mail --------------------------------------------------------------------------------------------
  
  // *** unconnected function *** 
  function mailTeamLeader() {
	
	Parse.Cloud.run('mailTeamLeader', {	text: "message between the chrorg and the team leader"
									  } , {
	  success: function(object) {
		alert(object.id);
	  },
	  error: function(model, error) {
		alert("Error: " + error.code + " " + error.message);
	  }
	});
  }
  
