;(function(window, document, undefined) {

//data binding section
	var $scope = {}; //scope object to hold all values
	$scope.model1 = "Default Values";
	$scope.user = [{
		name:'Achyut',
		address : 'Dang',
		link : '#/user/0'
	},
	{
		name : 'Gaurab',
		address : 'Kathmandu',
		link : '#/user/1'
	},
	{
		name : 'Kiran',
		address : 'Jhapa',
		link : '#/user/2'
	}];

	$scope.student = [{
		name:'sd',
		address : 'f'
	},
	{
		name : 's',
		address : 'w'
	},
	{
		name : 'e',
		address : 'g'
	}];

	var $rootElement = [];  //hold the scope of lf-app
	var $watchModels = [];  //models and binds to watchModels for
	var $watchBinds = [];
	var $xhr; //xmlhttrrequest object

	$rootElement = document.querySelector('[lf-app]');

	$watchModels = $rootElement.querySelectorAll('[lf-model]'); 
	$watchBinds = $rootElement.querySelectorAll('[lf-bind]'); 

	for(var i = 0, len = $watchModels.length; i < len; i++){
		// $scope[$watchModels[i].getAttribute('lf-model')] = $watchModels[i].value; 
		$watchModels[i].count = i;
		$watchModels[i].addEventListener('keyup', function(evt)
		{ 
			var index = evt.target.count;
			$scope[$watchModels[index].getAttribute('lf-model')] = $watchModels[index].value;
		});
	}

	//observe changes in $scope object, if any change is detected it updates respective models and bind
	Object.observe($scope, function(changes){
	    changes.forEach(function(change) {
	    	// console.log(change.type, ' : ',change.name,' : ', change.oldValue);
	    	$updateView(change.name);

	   	 }); //end of change.foreach
	}); //end of object.observe

	//updates the model and binds form scope object intially
	var $bootstrap = function(){
		for(var i = 0, len = $watchModels.length; i < len; i++){
			var $tag = $watchModels[i].getAttribute('lf-model'); 	
			if($scope.hasOwnProperty($tag))
				$updateView($tag);
		}

		for(var i = 0, len = $watchBinds.length; i < len; i++){
			var $tag = $watchBinds[i].getAttribute('lf-bind'); 	
			if($scope.hasOwnProperty($tag))
				$updateView($tag);
		}
	}	

	//search and update all bind and models of changed variable
	$updateView = function($tag){
		var $views = ['[lf-model='+$tag+']','[lf-bind='+$tag+']'];
		for(var i=0;i<$views.length;i++){ 
			var binders = $rootElement.querySelectorAll($views[i]);
	    	for(var j = 0, len = binders.length; j < len; j++){
				binders[j].value = $scope[$tag];
				binders[j].innerHTML = $scope[$tag];
	    	}
	    }    	
	}

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

//lf-repeate
var $repeatService = function(){
	var $allRepeats = $rootElement.querySelectorAll('[lf-repeat]');
	for(var i=0;i<$allRepeats.length;i++){ 
		var $repeatAttribute = $allRepeats[i].getAttribute('lf-repeat'); 
		$repeatAttribute = $repeatAttribute.trim(); 
		if($scope.hasOwnProperty($repeatAttribute)){
			var $innerBinds = $allRepeats[i].querySelectorAll('[lf-bind]');
			for(var j=0;j<$scope[$repeatAttribute].length;j++){
				for(var noOfBinds=0;noOfBinds<$innerBinds.length;noOfBinds++){
					var $bindAttr = $innerBinds[noOfBinds].getAttribute('lf-bind');
					$bindAttr = $bindAttr.trim();
					if($scope[$repeatAttribute][j].hasOwnProperty($bindAttr)){
						var temp = document.createElement($innerBinds[noOfBinds].tagName);
						if($innerBinds[noOfBinds].tagName === "a"){
							
						}
						else
							var text = document.createTextNode($scope[$repeatAttribute][j][$bindAttr]);  
						temp.appendChild(text);
						$allRepeats[i].appendChild(temp);

					}
				}
			}
		}
	}
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

		$bootstrap();
		$repeatService();
	}, 100 );	

})(window, document);