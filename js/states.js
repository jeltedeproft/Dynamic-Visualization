/* This function extracts the nodes
		
	node object components:
	---label
	---control
	---store
	---kstore
	---kont
	---time
	---position
	---connected edges  ==> this is an array of all connected edges [[1,"i'm edge 1"],[2,"i'm edge 2"]]

	assumption : edges and nodes array are equal in size
*/

function disassembleStates(executionTraceObject) {
	var allNodes = executionTraceObject.nodes;
	var allEdges = executionTraceObject.edges;
	var nrNodes = Object.keys(allNodes).length;
	var nrEdges = Object.keys(allEdges).length;

	var States = [];
	var arrivingedges = [];

	functionnumber = 0; //this number keeps track of how deep the function nesting is

	//initialize array of incoming edges, we need this because we are possibly pushing multiple elements
	for (var k = 0; k < nrEdges; k++) { 
		arrivingedges[k] = [];
	}	

	/*loop trough all nodes and create the state objects */
	for (var i = 0; i < nrNodes; i++) { 
		var node = allNodes[i];

		//actually create the objects representing the nodes
	    States[i] = new state(
	    	node.label,
	    	node.control,
	    	node.store,
	    	node.kstore,
	    	node.kont,
	    	node.time,
	    	i,
	    	null, //filled in later
	    	[], //filled in later 
	    	false,
	    	functionnumber
	    )
	    var lastfunctionnumber = States[i].control.nesting
	    if(typeof(lastfunctionnumber) == 'number'){
	    	functionnumber = lastfunctionnumber; 
	    }
	}

	/*loop trough all edges and add the edges to the states */
	for (var j = 0; j < nrEdges; j++) { 
		var edges = allEdges[j];
		var edgeobjects = createEdgeObjects(j,edges);

		//add the edges to the start and end nodes
		if(edgeobjects != null){
			for (var edgeobject of edgeobjects ){
				var start = edgeobject.node1name;
				var end = edgeobject.node2name;
				
				States[end].incomingedges.push(start);
				States[start].edges = edgeobjects;		 
			}
		} 	
	}
	return States;
}

function createEdgeObjects(nodeA,arrayOfEdges){
	var nredges = Object.keys(arrayOfEdges).length;
	var edgeobjects = [];
	for (var i = 0; i < nredges; i++) {
		edgeobjects[i] = new edge(nodeA,arrayOfEdges[i]);
	}
	return edgeobjects;
}

function state(label,control,store,kstore,kont,time,position,edgeobjects,incomingEdges,visibility,functionnumber){
	this.label = label;

	if(control.type == "ev"){
		this.control = new Control(
			control.type,
			control.exp,
			control.env);
	}else if(control.type == "kont"){
		this.control = new Control(
			control.type,
			control.value);
	}else if(control.type == "call"){
		functionnumber = functionnumber + 1;
		this.control = new Control(
			control.type,
			control.fexp,
			control.args,
			functionnumber);
	}else if(control.type == "return"){
		this.control = new Control(
			control.type,
			control.fexp,
			control.value,
			functionnumber);
		functionnumber = functionnumber - 1;
	}

	this.storage = store;
	this.kstore = kstore;
	this.kont = kont;
	this.timestamp = time;
	this.position = position;
	this.edges = edgeobjects;
	this.incomingedges = incomingEdges;
	this.visibility = visibility;
	return this;
}



function Control(type,arg1,arg2,fnesting){
	this.controltype = type;
	if(type == "ev"){
		this.expression = arg1;
		this.environment = arg2;
		return this;
	}
	else if(type == "kont"){
		this.expression = arg1;
		return this;
	}
	else if(type == "call"){
		this.expression = arg1;
		this.environment = arg2;
		this.nesting = fnesting;
		return this;
	}
	else if(type == "return"){
		this.expression = arg1;
		this.environment = arg2;
		this.nesting = fnesting;
		return this;
	}
}

function edge(nodeA,nodeBarray){
	this.node1name = nodeA
	this.node2name = nodeBarray[0];
	return this;
}
