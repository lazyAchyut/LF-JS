;(function(window, document, undefined) {

//data binding section
	var $scope = {}; //scope object to hold all values
	var $rootElement;  //hold the scope of lf-app
	var $watch;  //models and binds to watch for
	var $xhr; //xmlhttrrequest object

	$rootElement = document.querySelector('[lf-app]');

	$watch = $rootElement.querySelectorAll('[lf-model]'); 
	for(var i = 0, len = $watch.length; i < len; i++){
		$scope[$watch[i].getAttribute('lf-model')] = $watch[i].value; 
		$watch[i].count = i;
		$watch[i].addEventListener('keyup', function(evt)
		{ 
			var index = evt.target.count;
			$scope[$watch[index].getAttribute('lf-model')] = $watch[index].value;
		});
	}

	//observe changes in $scope object, if any change is detected it updates respective models and bind
	Object.observe($scope, function(changes){
    changes.forEach(function(change) {
    	// console.log(change.type, ' : ',change.name,' : ', change.oldValue);
    	
    	//search and update all bind of changed variable
    	var binders = $rootElement.querySelectorAll('[lf-bind='+change.name+']');
    	for(var i = 0, len = binders.length; i < len; i++){
			binders[i].value = $scope[change.name];
			binders[i].innerHTML = $scope[change.name];
    	}    	
    	
    	//search and update all models of changed variable
    	var models = $rootElement.querySelectorAll('[lf-model='+change.name+']');
    	for(var i = 0, len = models.length; i < len; i++){
			models[i].value = $scope[change.name];
			models[i].innerHTML = $scope[change.name];
    	}
   	 }); //end of change.foreach
	}); //end of object.observe


//routing section
	//get all link and when click event is detected call $routeservice method
	$links = $rootElement.querySelectorAll('a');
	for(var i = 0, len = $links.length; i < len; i++){
		$links[i].addEventListener('click',function(evt){
			setTimeout($routeService, 0);
		});
	}

	var $routeService = function(){
		var $href = document.URL; //get current url
		var $userDefinedRoutes = $routeProvider(); //$routeProvider() returns user defined routes, lies in user's controller
		
		var $parsedUrl = $parseUrl($href);
	    var	$currentDir = $parsedUrl[0].substr(0,$parsedUrl[0].lastIndexOf('/')); //current directory
	    var $urlAfterHash;
	    var $actualRoute = {}; //holds route and templateUrl of matched route

		if(($parsedUrl[1] != null && $parsedUrl[1] != '')){ 
			$urlAfterHash = $parsedUrl[1]; 
			$actualRoute = $parseUrlAfterHash($urlAfterHash,$userDefinedRoutes);
			var $container = document.querySelector('[lf-view]');
			
			if($actualRoute != null){
				var $path =  $currentDir + $actualRoute.templateUrl.trim();
				$loadView($container, $path);
			}
			else{ 
				var $redirectPath = $getOtherwisePath($userDefinedRoutes);
				if($redirectPath != null ){
					window.location.href = $parsedUrl[0] + '#' + $redirectPath;
					$actualRoute = $parseUrlAfterHash($redirectPath,$userDefinedRoutes);
					var $path =  $currentDir + $actualRoute.templateUrl.trim();
					$loadView($container, $path);
				}		
			}	
		}
	}

	var $parseUrl = function($href){
		return $href.split('#');
	}

	//returns matched route's path and templateUrl
	var $parseUrlAfterHash = function($urlAfterHash,$userDefinedRoutes){
		$urlAfterHash = $urlAfterHash.split('/');
		for(var i = 0; i< $userDefinedRoutes.length-1;i++){  //dont check otherwise part in $userDefinedRoutes
			var $tempJson = $userDefinedRoutes[i].when.split('/');
			var flag = true;
			if($urlAfterHash.length === $tempJson.length)
			{
				for(var j=0; j<$urlAfterHash.length;j++)
				{
					if($urlAfterHash[j] === $tempJson[j])
						continue;
					else if($tempJson[j].substr(0,1)===':')
						console.log("Assign " +$urlAfterHash[j] + " to " +  $tempJson[j] );
					else{
						flag = false;
						break;
					}
				}
				if(flag == true)
					return $userDefinedRoutes[i];
			}
		}
	}

	//returns redirectTO url of otherwise property in user defined route
	var $getOtherwisePath = function($userDefinedRoutes){
		for(var i in $userDefinedRoutes){ 
			if($userDefinedRoutes[i].otherwise == '')
				return $userDefinedRoutes[i].redirectTo;
		}
	}

	
	var $loadView = function($container,$path){ 
		$xhr = $getXhr();
		var temp;
	    $xhr.onreadystatechange = function () {
	        if ($xhr.readyState === 4 && $xhr.status == 200) {  
	           $container.innerHTML = $xhr.responseText;
	        }
	   	}
	    $xhr.open('GET', $path, true);
	    $xhr.send(null);
	}


	var $getXhr = function(){
		if(!$xhr){ 
			if (window.XMLHttpRequest) 
	        	$xhr = new XMLHttpRequest(); 
		    else if (window.ActiveXObject) 
		        $xhr = new ActiveXObject("Msxml2.XMLHTTP");
		    else 
		        throw new Error("Ajax is not supported by your browser");
		}
		return $xhr;
	}

	//to make sure that all files are loaded properly
	var tid = setInterval( function () {
	    if ( document.readyState !== 'complete' ) return;
	    clearInterval( tid );         
		if(typeof $routeProvider === "function"){
			$routeService(); //invoke it only if it is defined by user
		}
		else
		console.log("$routeProvider is not defined, Do nothing.");
	}, 100 );	

})(window, document);