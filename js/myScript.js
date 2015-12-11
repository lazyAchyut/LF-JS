var scope = {}; //global object to store all variable
var rootElement; // html scope where scope works
var watch; //list of models to watch for

//select the rootElement
rootElement = document.querySelector('[lf-app]');

//select all models to watch after
watch = rootElement.querySelectorAll('[lf-model]'); 
for(var i = 0, len = watch.length; i < len; i++){
	//initially set value of all models to scope
	scope[watch[i].getAttribute('lf-model')] = watch[i].value; 

	//holding index of model that invok event listener
	watch[i].count = i;

	watch[i].addEventListener("keyup", function(evt)
	{ 
		var index = evt.target.count;
		//update the value of that model whose value is changed
		scope[watch[index].getAttribute('lf-model')] = watch[index].value;
	});
}

//when value of scope object changes, update all binding and models related to that scope variable
Object.observe(scope, function(changes){
    changes.forEach(function(change) {
    	// console.log(change.type, ' : ',change.name,' : ', change.oldValue);
    	
    	//search and update all bind of changed variable
    	var binders = rootElement.querySelectorAll('[lf-bind='+change.name+']');
    	for(var i = 0, len = binders.length; i < len; i++){
			binders[i].value = scope[change.name];
			binders[i].innerHTML = scope[change.name];
    	}    	
    	
    	//search and update all models of changed variable
    	var models = rootElement.querySelectorAll('[lf-model='+change.name+']');
    	for(var i = 0, len = models.length; i < len; i++){
			models[i].value = scope[change.name];
			models[i].innerHTML = scope[change.name];
    	}
    }); //end of change.foreach
}); //end of object.observe



// dummy method to set college3 model value
function setter(){
	var name = prompt("Enter college name");
	scope['college3'] = name;
}

//dummy method to get value of college3 model
function getter(){
	console.log(scope['college3']);
}







