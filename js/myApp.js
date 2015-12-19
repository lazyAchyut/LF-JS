
function MyController($scope){
	$scope.user = [{
		name : 'Achyut Pokhrel',
		address : 'Dang',
		link : 'http://localhost/myfiles/prototype/#/user/0',
		img : 'images/1.png'
	},
	{
		name : 'Kiran Kharel',
		address : 'Jhapa',
		link : 'http://localhost/myfiles/prototype/#/user/1',
		img : 'images/2.png'
	},
	{
		name : 'Gaurab KC',
		address : 'Kathmandu',
		link : 'http://localhost/myfiles/prototype/#/user/2',
		img : 'images/3.png'
	}
	]; 
}


//this is user defined routing
function $routeProvider(){
	return [{
			when : '/login',
			templateUrl : '/partial/login.html'
		},
		{
			when : '/logout',
			templateUrl : '/partial/logout.html'
		},
		{
			when : '/user/:id',
			templateUrl : '/partial/user.html'
		},
		{
			otherwise : '', 
			redirectTo : '/logout'
		}
	];
}

