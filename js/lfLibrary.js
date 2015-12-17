;(function(window, document, undefined) {

function Main(){
	var $routeObj;
	var $repeateObj;
	this.$dataObj;
	this.$scope;
	this.$rootElement = [];
	var that = this;

	//TODO Move this dummy initialization to controller
	this.$scope = {model1:'Kiran'};
	this.$scope.user = [{
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

	this.$initRoute = function(){
		$routeObj = new LfRoute();
		$routeObj.$setRoute();
		$routeObj.$doRoute();
	}

	this.$initDataBind = function(){
		$dataObj = new LfBind(that.$rootElement);
		$dataObj.$init();
		$dataObj.$bootstrap();
	}

	this.$invokeDoRoute = function(){
		$routeObj.$doRoute();
	}

}


var $main = new Main();
$main.$initRoute();
$main.$initDataBind();



//data binding section
function LfBind(re){
	var $watchModels = [];  //models and binds to watchModels for
	var $watchBinds = [];
	var $rootElement = re; 
	var that = this;

	this.$init = function(){
		$watchModels = $rootElement.querySelectorAll('[lf-model]'); 
		$watchBinds = $rootElement.querySelectorAll('[lf-bind]'); 

		for(var i = 0, len = $watchModels.length; i < len; i++){
			
			$watchModels[i].count = i;
			$watchModels[i].addEventListener('keyup', function(evt)
			{ 
				var index = evt.target.count;
				$main.$scope[$watchModels[index].getAttribute('lf-model')] = $watchModels[index].value;
			});
		}
	}
	

	//updates the model and binds form scope object intially
	this.$bootstrap = function(){
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
		var $views = ['[lf-model='+$tag+']','[lf-bind='+$tag+']'];
		for(var i=0;i<$views.length;i++){ 
			var binders = $rootElement.querySelectorAll($views[i]);
	    	for(var j = 0, len = binders.length; j < len; j++){
				binders[j].value = $main.$scope[$tag];
				binders[j].innerHTML = $main.$scope[$tag];
	    	}
	    }    	
	}



} //end of LfBind



//observe changes in $scope object, if any change is detected it updates respective models and bind
Object.observe($main.$scope, function(changes){
    changes.forEach(function(change) {
    	// console.log(change.type, ' : ',change.name,' : ', change.oldValue);
    	$dataObj.$updateView(change.name);

   	 }); //end of change.foreach
}); //end of object.observe





//routing section

function LfRoute(){
		this.$href; //get current url
	    this.$actualRoute = {}; //holds route and templateUrl of matched route
	    this.$urlAfterHash;
		this.$userDefinedRoutes;
		this.$xhr;

	    var that = this;

	    this.$setRoute = function(){ 
	    	//get all link and when click event is detected call $routeservice method
			var $links = $main.$rootElement.querySelectorAll('a');
			for(var i = 0, len = $links.length; i < len; i++){
				$links[i].addEventListener('click',function(evt){
					// $routeObj  = new LFRoute() ||= {}; 
					setTimeout($main.$invokeDoRoute, 0);
				});
			}
	    }

		this.$doRoute = function(){ 
			that.$href = document.URL;
			that.$userDefinedRoutes = $routeProvider(); //$routeProvider() returns user defined routes, lies in user's controller
			var $urlAfterHash;
			var $actualRoute;
			var $parsedUrl = that.$parseUrl(that.$href);
			var	$currentDir = $parsedUrl[0].substr(0,$parsedUrl[0].lastIndexOf('/')); //current directory

			if(($parsedUrl[1] != null && $parsedUrl[1] != '')){ 
				$urlAfterHash = $parsedUrl[1]; 
				$actualRoute = that.$parseUrlAfterHash($urlAfterHash,that.$userDefinedRoutes);
				var $container = document.querySelector('[lf-view]');
				
				if($actualRoute != null){
					var $path =  $currentDir + $actualRoute.templateUrl.trim();
					that.$loadView($container, $path);
				}
				else{ 
					var $redirectPath = that.$getOtherwisePath(that.$userDefinedRoutes);
					if($redirectPath != null ){
						window.location.href = $parsedUrl[0] + '#' + $redirectPath;
						$actualRoute = that.$parseUrlAfterHash($redirectPath,that.$userDefinedRoutes);
						var $path =  $currentDir + $actualRoute.templateUrl.trim();
						that.$loadView($container, $path);
					}		
				}	
			}
		}
	
		//returns matched route's path and templateUrl
		this.$parseUrlAfterHash = function($urlAfterHash,$userDefinedRoutes){
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
							console.log("Assign " + $urlAfterHash[j] + " to " +  $tempJson[j] );
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


		this.$parseUrl = function($href){
			return $href.split('#');
		}


		//returns redirectTO url of otherwise property in user defined route
		this.$getOtherwisePath = function($userDefinedRoutes){
			for(var i in $userDefinedRoutes){ 
				if($userDefinedRoutes[i].otherwise == '')
					return $userDefinedRoutes[i].redirectTo;
			}
		}

		
		this.$loadView = function($container,$path){ 
			that.$xhr = that.$getXhr();
		    that.$xhr.onreadystatechange = function () {
		        if (that.$xhr.readyState === 4 && that.$xhr.status == 200) {  
		           $container.innerHTML = that.$xhr.responseText;
		        }
		   	}
		   that. $xhr.open('GET', $path, true);
		    that.$xhr.send(null);
		}


		this.$getXhr = function(){
			if(!that.$xhr){ 
				if (window.XMLHttpRequest) 
		        	that.$xhr = new XMLHttpRequest(); 
			    else if (window.ActiveXObject) 
			        that.$xhr = new ActiveXObject("Msxml2.XMLHTTP");
			    else 
			        throw new Error("Ajax is not supported by your browser");
			}
			return that.$xhr;
		}
	} //end of class LFRoute


//lf-repeate
$repeatService = function(){
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