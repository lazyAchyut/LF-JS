function TraineeController($scope){ 
	var req = new XMLHttpRequest();
    // req.open( "GET", "https://raw.githubusercontent.com/lazyAchyut/LF-JS/master/js/trainee.js", true);
    req.open( "GET", "js/trainee.js", true);
 
    req.onreadystatechange = function()
    {	
        if( req.readyState == 4 && req.status == 200 )
        { 
            $scope.trainee = JSON.parse( req.responseText );  
            $scope.trainee.sort(function(a, b) {
			    return (a.roll - b.roll);
			});
        }
    }
    req.send(null);
}


//this is user defined routing
function RouteProvider($route){ 
	$route.$userDefinedRoutes = [
		{
			when : '/error',
			templateUrl : '/partial/error-page.html'
		},
		{
			when : '/user/:roll',
			templateUrl : '/partial/trainee-details.html'
		},
		{
			when : '/data-bind',
			templateUrl : '/partial/data-bind.html'
		},
		{
			otherwise : '', 
			redirectTo : '/error'
		}
	];
}
