"use strict";
var CSOM = window.CSOM || {};

(function () {

	$(document).ready(function () {  
	    //Don't exectute any js script until sp.js file has loaded          
		ExecuteOrDelayUntilScriptLoaded(startApp, "sp.js"); 
	})
	
	var listName = "Customer";
	
	function startApp() {   
		CSOM.List.ReadAllItems(listName).done(function(items) {  
			//console.log(items);
			return CSOM.List.DeleteAllItems(listName, items);
		}).fail(function(sender, args) {
			console.log("\nError: " + args.get_message() + "\nStackTrace: " + args.get_stackTrace());
		});      
	}

}());
