//this is user defined routing
function $routeProvider(){
		return [{
			when : '/login',
			templateUrl : '/partial/login.html'
		},
		{
			when : '/logout',
			templateUrl : '/partial/logout.html'
		}
	];
}