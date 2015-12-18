;(function(window, document, undefined) {
'use strict'
function Main(){
	var $routeObj;
	var $dataObj;
	var $scope = {};
	this.$rootElement = [];
	var that = this;

	//TODO Move this dummy initialization to controller
	$scope = {model1:'Kiran'};
	$scope.user = [{
		name : 'Achyut Pokhrel',
		address : 'Dang'
	},
	{
		name : 'Kiran Kharel',
		address : 'Jhapa'
	},
	{
		name : 'Gaurab KC',
		address : 'Kathmandu'
	}
	]; 


	this.$rootElement = document.querySelector('[lf-app]')

	this.$initializeRoute = function(){
		$routeObj = new LfRoute();
		$routeObj.$addListener();
		$routeObj.$doRoute();
	}

	this.$initializeDataBind = function(){
		$dataObj = new LfBind();
		$dataObj.$registerWatcher();
		$dataObj.$addListener();
		$dataObj.$initializeFirstView();
	}

	this.$invokeUpdateView = function(tag){
		$dataObj.$updateView(tag);
	}

	this.$updateScope = function(key,value){
		$scope[key] = value;
	}

	this.getScope = function(){
		return $scope;
	}

} //end of Main Class


var $main = new Main();
$main.$initializeRoute();
$main.$initializeDataBind();



//data binding section
function LfBind(){
	var $watchModels = [];  //models to watch for
	var $watchBinds = [];   //binds to watch for
	var that = this;

	this.$registerWatcher = function(){
		$watchModels = $main.$rootElement.querySelectorAll('[lf-model]'); 
		$watchBinds = $main.$rootElement.querySelectorAll('[lf-bind]'); 
	}

	this.$addListener = function(){
		for(var i = 0, len = $watchModels.length; i < len; i++){
			$watchModels[i].count = i;
			$watchModels[i].addEventListener('keyup', function(evt)
			{ 
				var index = evt.target.count;
				var key = $watchModels[index].getAttribute('lf-model');
				var value = $watchModels[index].value;
				$main.$updateScope(key,value);
			});
		}
	}
	
	//updates the model and binds with data if initially present in scope object
	this.$initializeFirstView = function(){
		for(var i = 0, len = $watchModels.length; i < len; i++){
			var $tag = $watchModels[i].getAttribute('lf-model'); 	
			if($main.getScope().hasOwnProperty($tag))
				that.$updateView($tag);
		}

		for(var i = 0, len = $watchBinds.length; i < len; i++){
			var $tag = $watchBinds[i].getAttribute('lf-bind'); 	
			if($main.getScope().hasOwnProperty($tag))
				that.$updateView($tag);
		}
	}	

	//search and update all bind and models of changed variable
	this.$updateView = function($tag){
	   	for(var j = 0, len = $watchModels.length; j < len; j++){
			if($tag === $watchModels[j].getAttribute('lf-model')){
				$watchModels[j].value = $main.getScope()[$tag];
				$watchModels[j].innerHTML = $main.getScope()[$tag];
			}
    	} 

    	for(var j = 0, len = $watchBinds.length; j < len; j++){
			if($tag === $watchBinds[j].getAttribute('lf-bind')){
				$watchBinds[j].value = $main.getScope()[$tag];
				$watchBinds[j].innerHTML = $main.getScope()[$tag];
			}
    	}   	
	}
} //end of LfBind



//observe changes in $scope object, if any change is detected it updates respective models and bind
Object.observe($main.getScope(), function(changes){
    changes.forEach(function(change) {
    	// console.log(change.type, ' : ',change.name,' : ', change.oldValue);
    	$main.$invokeUpdateView(change.name);

   	 }); //end of change.foreach
}); //end of object.observe


//routing section
function LfRoute(){
		var $userDefinedRoutes = {};
		var $allLinks = [];
		var $xhr;
		var that = this;

		$userDefinedRoutes = $routeProvider(); //$routeProvider() returns user defined routes, lies in user's controller
		$allLinks = $main.$rootElement.querySelectorAll('a');

	    this.$addListener = function(){ 
	    	//get all link and when click event is detected call $doRoute method	
			for(var i = 0, len = $allLinks.length; i < len; i++){
				$allLinks[i].addEventListener('click',function(evt){
					setTimeout(that.$doRoute, 0);
				});
			}
	    }

		this.$doRoute = function(){ 
			var $matchedRoute = []; //holds route and templateUrl of matched route
	    	var $urlAfterHash = '';
			var $currentUrl;
			var $parsedUrl = [];
			var	$currentDir;

			$currentUrl = document.URL
			$parsedUrl = that.$parseStr($currentUrl,'#');
			$currentDir = $parsedUrl[0].substr(0,$parsedUrl[0].lastIndexOf('/')); //current directory	

			if(($parsedUrl[1] != null && $parsedUrl[1] != '')){ 
				$urlAfterHash = $parsedUrl[1];
				$matchedRoute = that.$mapUrlAfterHash($urlAfterHash);
				var $container = document.querySelector('[lf-view]');
				
				if($matchedRoute != null){
					var $path =  $currentDir + $matchedRoute.templateUrl.trim();
					that.$loadView($container, $path);
				}
				else{ 
					var $redirectPath = that.$getOtherwisePath($userDefinedRoutes);
					if($redirectPath != null ){
						window.location.href = $parsedUrl[0] + '#' + $redirectPath;  //logout
						$matchedRoute = that.$mapUrlAfterHash($redirectPath); 
						var $path =  $currentDir + $matchedRoute.templateUrl.trim();
						that.$loadView($container, $path);
					}		
				}	
			}
		}

		this.$parseStr = function(s,delimiter){ 
			return s.split(delimiter);
		}

		//returns matched route's path and templateUrl
		this.$mapUrlAfterHash = function($path){ 
			var tempParsedPath = [];
			tempParsedPath = that.$parseStr($path , '/'); 
			for(var i = 0; i< $userDefinedRoutes.length-1;i++){  //dont check otherwise part in $userDefinedRoutes
				var $tempJson = that.$parseStr($userDefinedRoutes[i].when , '/');
				var flag = true;
				if(tempParsedPath.length === $tempJson.length)
				{
					for(var j=0; j<tempParsedPath.length;j++)
					{
						if(tempParsedPath[j] === $tempJson[j])
							continue;
						else if($tempJson[j].substr(0,1)===':')
							console.log("Assign " + tempParsedPath[j] + " to " +  $tempJson[j] );
						else{
							flag = false;
							break;
						}
					}
					if(flag === true)
						return $userDefinedRoutes[i];
				}
			}
		}

		//returns redirectTO url of otherwise property in user defined route
		this.$getOtherwisePath = function(){
			for(var i in $userDefinedRoutes){ 
				if($userDefinedRoutes[i].otherwise == '')
					return $userDefinedRoutes[i].redirectTo;
			}
		}

		
		this.$loadView = function($container,$path){ 
			$xhr = that.$getXhr();
		    $xhr.onreadystatechange = function () {
		        if ($xhr.readyState === 4 && $xhr.status == 200) {  
		           $container.innerHTML = $xhr.responseText;
		        }
		   	}
		   $xhr.open('GET', $path, true);
		   $xhr.send(null);
		}

		this.$getXhr = function(){
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
	} //end of class LFRoute


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
	// var tid = setInterval( function () {
	//     if ( document.readyState !== 'complete' ) return;
	//     clearInterval( tid );         
	// 	if(typeof $routeProvider === "function"){
	// 		$routeObj = new LfRoute(document) //invoke it only if it is defined by user
	// 		$routeObj.$doRoute();
	// 	}
	// 	else
	// 	console.log("$routeProvider is not defined, Do nothing.");

	// 	$bootstrap();
	// 	$repeatService();
	// }, 100 );	



})(window, document);