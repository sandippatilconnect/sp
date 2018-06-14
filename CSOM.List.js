"use strict";
var CSOM = window.CSOM || {};

CSOM.List = function () {
    
    //private members
    var list,     		 
    	listItems,      
		query,			
		pageSize = 100,	// Batch size
		clientContext,
		items = [],
		rdDef,

        
    readAllItems = function (listName) {
    
        rdDef = $.Deferred();
        
        clientContext = SP.ClientContext.get_current();
	    list = clientContext.get_web().get_lists().getByTitle(listName);
	    
	    query = new SP.CamlQuery();
	    query.set_viewXml("<View>" + 
	                              "<ViewFields>" + 
	                                     "<FieldRef Name='ID'/>" +
	                                "</ViewFields>" + 
	                             "<RowLimit>" + pageSize + "</RowLimit>"+
	                   		"</View>");
	                   	
	    listItems = list.getItems(query);
	    clientContext.load(listItems);
	    clientContext.executeQueryAsync(readNextItems, fail);
	    
	    return rdDef.promise(); //Return promise object
    },
    
    readNextItems = function () {
    	var listEnumerator = listItems.getEnumerator();
	    while (listEnumerator.moveNext()) {
	    	items.push(listEnumerator.get_current().get_item("ID"));
	    }
	    
	    var position = listItems.get_listItemCollectionPosition();
	    
	    if (position != null) { // Prepare next batch call
	        query.set_listItemCollectionPosition(position);
	        listItems = list.getItems(query);
	        clientContext.load(listItems);
	        clientContext.executeQueryAsync(readNextItems, fail); // Call function recursively
	    }
	    else{
	    	rdDef.resolve(items); //Return items
	    }
	},

	fail = function (sender, args) {
	    console.log("Read all items request failed \n");
	    rdDef.reject(sender, args); //Return reject
	},
	
	deleteAllItems = function (listName, items) {
    
    	this.delDef = $.Deferred();
	    
	    this.clientContext = SP.ClientContext.get_current();
	    this.list = clientContext.get_web().get_lists().getByTitle(listName);
	        
	    for(var i = 0; i < items.length; i++){
	       
	        this.listItem = list.getItemById(items[i]);
		   	this.listItem.deleteObject();
		   	
	        if ((i != 0 && (i % pageSize == 0)) || (i == items.length - 1)) { // Call execute only for batch and remaining items in batch
	        	console.log(i);
	         	clientContext.executeQueryAsync(
					Function.createDelegate(this,
		                function () {
		                	console.log("Batch delete successful \n");
		                	this.delDef.resolve();
		            	}
		            ),
		            Function.createDelegate(this,
		                function (sender, args) {
		                	console.log("Delete all items request failed \n");
		                	this.delDef.reject(sender, args); 
		            	}
		            )
		        );
		    }
	    }
	    
	    return this.delDef.promise();
	}

    //public interface
    return {
        ReadAllItems: readAllItems,
        DeleteAllItems: deleteAllItems
    }

}();
