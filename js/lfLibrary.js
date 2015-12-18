;(function(window, document, undefined) {
'use strict';

function Main(){
	var $routeObj;
	var $dataObj;
	var $repeatObj;
	var $scope = {};
	this.$rootElement = [];
	var that = this;

	//TODO Move this dummy initialization to controller
	$scope = {model1:'Kiran'};
	$scope.user = [{
		name : 'Achyut Pokhrel',
		address : 'Dang',
		link : 'http://localhost/myfiles/prototype/#/user/1'
	},
	{
		name : 'Kiran Kharel',
		address : 'Jhapa',
		link : 'http://localhost/myfiles/prototype/#/user/2'
	},
	{
		name : 'Gaurab KC',
		address : 'Kathmandu',
		link : 'http://localhost/myfiles/prototype/#/user/3'
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

	this.$initializeRepeat = function(){
		$repeatObj = new LfRepeat();
		$repeatObj.$doRepeat();
		//after lf-repeate, new links may be added
		$routeObj.$addListener();
	}

	//invoke updateview method inside LfData class from Object.Observe section 
	this.$invokeUpdateView = function(tag){
		$dataObj.$updateView(tag);
	}

	this.$updateScope = function(key,value){
		$scope[key] = value;
	}

	this.$getScope = function(){
		return $scope;
	}

} //end of Main Class


//create instance of Main class
var $main = new Main();
if(typeof $routeProvider === "function")	//invoke only if routing is defined by user in myapp.js
	$main.$initializeRoute();
$main.$initializeDataBind();
$main.$initializeRepeat();



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
			if($main.$getScope().hasOwnProperty($tag))
				that.$updateView($tag);
		}

		for(var i = 0, len = $watchBinds.length; i < len; i++){
			var $tag = $watchBinds[i].getAttribute('lf-bind'); 	
			if($main.$getScope().hasOwnProperty($tag))
				that.$updateView($tag);
		}
	}	

	//search and update all bind and models of changed variable
	this.$updateView = function($tag){
	   	for(var j = 0, len = $watchModels.length; j < len; j++){
			if($tag === $watchModels[j].getAttribute('lf-model')){
				$watchModels[j].value = $main.$getScope()[$tag];
				$watchModels[j].innerHTML = $main.$getScope()[$tag];
			}
    	} 

    	for(var j = 0, len = $watchBinds.length; j < len; j++){
			if($tag === $watchBinds[j].getAttribute('lf-bind')){
				$watchBinds[j].value = $main.$getScope()[$tag];
				$watchBinds[j].innerHTML = $main.$getScope()[$tag];
			}
    	}   	
	}
} //end of LfBind



//observe changes in $scope object, if any change is detected it updates respective models and bind
Object.observe($main.$getScope(), function(changes){
    changes.forEach(function(change) {
    	// console.log(change.type, ' : ',change.name,' : ', change.oldValue);
    	$main.$invokeUpdateView(change.name);
   	 }); //end of change.foreach
}); //end of object.observe


//routing section
function LfRoute(){
		const $USER_DEFINED_ROUTES = $routeProvider(); //$routeProvider() returns user defined routes, lies in user's controller
		var $allLinks;
		var $xhr; //XMLHttpRequest object
		var that = this;

		//get all link and when click event is detected call $doRoute method	
	    this.$addListener = function(){ 
	    	//after rendering first view, lf-repeate might rendor some dynamic links later so, it needs to be rechecked again and again	
	    	$allLinks = $main.$rootElement.querySelectorAll('a');
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
					var $redirectPath = that.$getOtherwisePath($USER_DEFINED_ROUTES);
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
			var $tempParsedPath = [];
			$tempParsedPath = that.$parseStr($path , '/'); 
			for(var i = 0; i< $USER_DEFINED_ROUTES.length-1;i++){  //dont check otherwise part in $USER_DEFINED_ROUTES
				var $tempJson = that.$parseStr($USER_DEFINED_ROUTES[i].when , '/');
				var flag = true;
				if($tempParsedPath.length === $tempJson.length)
				{
					for(var j=0; j<$tempParsedPath.length;j++)
					{
						if($tempParsedPath[j] === $tempJson[j])
							continue;
						else if($tempJson[j].substr(0,1)===':')
							console.log("Assign " + $tempParsedPath[j] + " to " +  $tempJson[j] );
						else{
							flag = false;
							break;
						}
					}
					if(flag === true)
						return $USER_DEFINED_ROUTES[i];
				}
			}
		}

		//returns redirectTO url of otherwise property in user defined route
		this.$getOtherwisePath = function(){
			for(var i in $USER_DEFINED_ROUTES){ 
				if($USER_DEFINED_ROUTES[i].otherwise == '')
					return $USER_DEFINED_ROUTES[i].redirectTo;
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
function LfRepeat(){
	const $ALL_REPEATS = $main.$rootElement.querySelectorAll('[lf-repeat]');
	var $currentRepeat; 
	var $collectionName; //scope property
	var $bindAttr; //nested scope property
	var that = this;

	this.$doRepeat = function(){
		for(var i = 0; i<$ALL_REPEATS.length;i++){
			$currentRepeat = $ALL_REPEATS[i];
			$collectionName = ($currentRepeat.getAttribute('lf-repeat')).trim();
			
			if($main.$getScope().hasOwnProperty($collectionName)){
				var $innerBinds = $currentRepeat.querySelectorAll('[lf-bind]');
				that.$removeElements($currentRepeat,$innerBinds);
				for(var j=0;j<$main.$getScope()[$collectionName].length;j++){
					for(var noOfBinds=0;noOfBinds<$innerBinds.length;noOfBinds++){
						$bindAttr = ($innerBinds[noOfBinds].getAttribute('lf-bind')).trim();
						if($main.$getScope()[$collectionName][j].hasOwnProperty($bindAttr))
							that.$renderRepeat($innerBinds[noOfBinds],j);
					}
				}
			}
		}
	}

	this.$removeElements = function(parent,child){
		for(var i=0;i<child.length;i++)
			parent.removeChild(child[i]);
	}

	this.$renderRepeat = function(element,index){
		element = element.cloneNode();
		element.removeAttribute('lf-bind');
		element.innerHTML = $main.$getScope()[$collectionName][index][$bindAttr];
		$currentRepeat.appendChild(element);
		$currentRepeat.innerHTML = $currentRepeat.innerHTML.replace('{{'+$bindAttr+'}}',$main.$getScope()[$collectionName][index][$bindAttr]);
	}
	
} //end of class LfRepeat




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