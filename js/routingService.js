var $routeService = function(){
	var href = window.location.href;
	// var href = 'file:///F:/leapfrog%20training/my%20project/scope%20variable/scopeVariable.html/#/login';
	var url = href.split('#');

	$userRoute = url[1];
	if($userRoute!=null){
		//check exception
		$routeJson = $routeProvider(url[1]);
		for(var x in $routeJson){
			if($userRoute == $routeJson[x].when){
				var loc = 'file:///F:/leapfrog%20training/my%20project/scope%20variable' +  $routeJson[x].templateUrl;
				document.querySelector('[lf-view]').innerHTML = '<object type="text/html" data='+ loc.trim() +'></object>';
			}
		}

	}

}


if(typeof $routeProvider === "function"){
	$routeService();
}
else
	console.log("$routeProvider not defined, Do nothing.");


