;(function(window, document, undefined) {
'use strict';

function Main(){
	var $routeObj = null;
	var $dataObj = null;
	var $repeatObj = null;
	this.$scope = {};
	this.$rootElement = [];
	this.$routeParam = [];
	var that = this;

	this.$rootElement = document.querySelector('[lf-app]');

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
		$repeatObj.$initRepeat();
		$repeatObj.$doRepeat();
		$repeatObj.$doDetail();
		//after lf-repeate, new links may be added
		if($routeObj != null)
			$routeObj.$addListener();
	}

	//invoke updateview method inside LfData class from Object.Observe section 
	this.$invokeUpdateView = function(tag){
		$dataObj.$updateView(tag);
	}

	this.$updateSerivces = function(){
		// TODO required services to be invoked
	}

	this.$bootstrap = function(){
		// TODO initially call all the services form here
	}
} //end of Main Class


///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
var $main = new Main();

var Injector = {
    
    dependencies: {},
    
    process: function(target) {
        var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
        var FN_ARG_SPLIT = /,/;
        var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
        var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        var text = target.toString();
        var args = text.match(FN_ARGS)[1].split(',');
        
        target.apply(target, this.getDependencies(args));
    },
    
    getDependencies: function(arr) {
        var self = this;
        return arr.map(function(value) {
            
            return self.dependencies[value];
        });            
    },
    
    register: function(name, dependency) {
        this.dependencies[name] = dependency;
    }
};

//register all the possible injectors
Injector.register('$scope',  $main.$scope);


//create instance of Main class
if(typeof $routeProvider === "function")	//invoke only if routing is defined by user in myapp.js
	$main.$initializeRoute();

// TODO process the user defined controller
Injector.process(MyController);


setTimeout($main.$initializeRepeat,0);
setTimeout($main.$initializeDataBind,0);





///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

//data binding section
function LfBind(){
	var $watchModels = [];  //models to watch for
	var $watchBinds = [];   //binds to watch for
	var that = this;

	this.$detectUpdatesOnView = function(){
		// TODO gets all models and bind
		//and compare it with previous one (i.e first with length and then from key)
		//if changes is found then add it to $watcher list and invoke $addlistner
	}

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
				$main.$scope[key] = value;
			});
		}
	}
	
	//updates the model and binds with data if initially present in scope object
	this.$initializeFirstView = function(){
		for(var i = 0, len = $watchModels.length; i < len; i++){
			var $tag = $watchModels[i].getAttribute('lf-model'); 	
			if($main.$scope.hasOwnProperty($tag))
				that.$updateView($tag);
		}

		for(var i = 0, len = $watchBinds.length; i < len; i++){
			var $tag = $watchBinds[i].getAttribute('lf-bind'); 	
			if($main.$scope.hasOwnProperty($tag))
				that.$updateView($tag);
		}
	}	

	//search and update all bind and models of changed variable
	this.$updateView = function($tag){
	   	for(var j = 0, len = $watchModels.length; j < len; j++){
			if($tag === $watchModels[j].getAttribute('lf-model')){
				$watchModels[j].value = $main.$scope[$tag];
				$watchModels[j].innerHTML = $main.$scope[$tag];
			}
    	} 

    	for(var j = 0, len = $watchBinds.length; j < len; j++){
			if($tag === $watchBinds[j].getAttribute('lf-bind')){
				$watchBinds[j].value = $main.$scope[$tag];
				$watchBinds[j].innerHTML = $main.$scope[$tag];
			}
    	}   	
	}
} //end of LfBind



//observe changes in $scope object, if any change is detected it updates respective models and bind
Object.observe($main.$scope, function(changes){
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

		this.$detectUpdatesOnView = function(){
		// TODO gets all links from view
		//and compare it with previous one (i.e first with length and then from key)
		//if changes is found then invoke $addlistner
	}

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

		this.$parseStr = function(str,delimiter){ 
			return str.split(delimiter);
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
						else if($tempJson[j].substr(0,1)===':'){
							console.log("Assign " + $tempParsedPath[j] + " to " +  $tempJson[j].substr(1) );
							$main.$routeParam[$tempJson[j].substr(1)] = $tempParsedPath[j];
						}
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
	var $allRepeats;
	var $allDetails;
	var $collectionName; //scope property
	var that = this;

	this.$initRepeat = function(){
		$allRepeats = $main.$rootElement.querySelectorAll('[lf-repeat]');
		$allDetails = $main.$rootElement.querySelectorAll('[lf-detail]');
	}

	this.$detectUpdatesOnView = function(){
		// TODO gets all lf-repeate from view
		//and compare it with previous one (i.e first with length and then from key)
		//if changes is found then add run lf-repeate only for changed element
	}

	this.$doRepeat = function(){
		var $currentRepeat; 
		var $innerBinds;
		var $bindAttr;
		for(var i = 0; i<$allRepeats.length;i++){
			$currentRepeat = $allRepeats[i];
			$collectionName = ($currentRepeat.getAttribute('lf-repeat')).trim();
			
			if($main.$scope.hasOwnProperty($collectionName)){
				$innerBinds = $currentRepeat.querySelectorAll('[lf-bind]');
				that.$removeElements($currentRepeat,$innerBinds);
				for(var j=0;j<$main.$scope[$collectionName].length;j++){
					for(var noOfBinds=0;noOfBinds<$innerBinds.length;noOfBinds++){
						$bindAttr = ($innerBinds[noOfBinds].getAttribute('lf-bind')).trim();
						if($main.$scope[$collectionName][j].hasOwnProperty($bindAttr))
							that.$renderRepeat($currentRepeat , $innerBinds[noOfBinds] , j , $bindAttr);
					}
				}
			}
		}
	}

	this.$doDetail = function(){
		var $currentDetail;
		var $innerBinds;
		var $attributes;
		var $bindAttr;
		var $index;
		for(var i=0;i<$allDetails.length;i++){
			$currentDetail = $allDetails[i];
			$attributes = ($currentDetail.getAttribute('lf-detail')).split('of');
			$collectionName = $attributes[0].trim();
			var $key = $attributes[1].trim();
			$index = $main.$routeParam[$key];

			if($main.$scope.hasOwnProperty($collectionName)){
				$innerBinds = $currentDetail.querySelectorAll('[lf-bind]');
				that.$removeElements($currentDetail,$innerBinds);

				for(var noOfBinds=0;noOfBinds<$innerBinds.length;noOfBinds++){
					$bindAttr = ($innerBinds[noOfBinds].getAttribute('lf-bind')).trim();
					if($main.$scope[$collectionName][$index].hasOwnProperty($bindAttr)){
						console.log($main.$scope[$collectionName][$index]);
						that.$renderRepeat($currentDetail , $innerBinds[noOfBinds] , $index , $bindAttr);
					}
				}
			}

		}
	}

	this.$removeElements = function(parent,child){
		for(var i=0;i<child.length;i++)
			parent.removeChild(child[i]);
	}

	this.$renderRepeat = function(parentNode,childNode,index,key){
		childNode = childNode.cloneNode();
		childNode.removeAttribute('lf-bind');
		childNode.innerHTML = $main.$scope[$collectionName][index][key];
		parentNode.appendChild(childNode);
		parentNode.innerHTML = parentNode.innerHTML.replace('{{'+key+'}}',$main.$scope[$collectionName][index][key]);
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