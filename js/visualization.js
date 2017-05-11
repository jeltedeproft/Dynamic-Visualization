/*this function starts the visualization process*/
function visualize(nodes,render){
	var g = VisualGraph;

	//transition with duration 1000ms
	g.graph().transition = function transition(selection) { 
	    return selection.transition().duration(1000);
	};

	// Cleanup old graph but save the relative position
	var gs = d3.select("svg").selectAll("g")

	gs.selectAll("*").remove();
	d3.behavior.zoom().on("zoom", null)

	// we create additional nodes if necesary
	for (var node of nodes){
		var key = node.position.toString();
		var controltype = node.control.controltype;
		var storage = node.storage;
		var visible = node.visibility;
		var neighbours = node.edges;

		//is it visible in the frist place?
		if (visible) {
			//if so, is it already visualized?
			if (VisualGraph.node(key) == null) {
				if(controltype == "ev"){
					var value = node.control.expression;
					var formattedlabel = controltype + " : " + value + "\n" + key;
					addNode(node,g,key,formattedlabel,storage,"fill: #afa");
				}else if (controltype == "kont"){
					var value = node.control.expression;
					var formattedlabel = controltype + " : " + value + "\n" + key;
					addNode(node,g,key,formattedlabel,storage,"fill: #faa");
				}else if (controltype == "call"){
					var value = node.control.expression + "(" + node.control.environment.toString() + ")";
					var formattedlabel = controltype + " : " + value + "\n" + key;
					addNode(node,g,key,formattedlabel,storage,"fill: #aaf");
				}else if (controltype == "return"){
					var value = node.control.expression + " --> " + node.control.environment;
					var formattedlabel = controltype + " : " + value + "\n" + key;
					addNode(node,g,key,formattedlabel,storage,"fill: #aff");
				}
			};
		};
	}

	//remove nodes that are visible, but shouldn't be
	for(var node of nodes){
		if ((node.visibility == false) && ((typeof g.node(node.position)) != 'undefined')) {
			removeNode(node,g);
		};
	}

	// Set up an SVG group so that we can translate the final graph.
	var svg = d3.select("svg")
	inner = svg.append("g");

	//reinitialize translate and scale variables if we havent zoomed yet
	if(!synchronize){
		scale = 1;
		translate = [0,0];
	}

	//in this block we make sure to transfer the translation from the previous graph
	translatetemp = translate.map(function (num,idx){
		return num + translatetemp[idx];
	});
	scaletemp = scale * scaletemp;;
	inner.attr("transform", "translate(" + translatetemp + ")" +
	                            "scale(" + scaletemp + ")");

	synchronize = false;
	//Set up zoom support
	var zoom = d3.behavior.zoom().on("zoom", function() {
		var newtranslate = translatetemp.map(function (num,idx){
			return num + d3.event.translate[idx];
		});
		var newscale = scaletemp * d3.event.scale;

	    inner.attr("transform", "translate(" + newtranslate + ")" +
	                                "scale(" + newscale + ")");
	    scale = d3.event.scale;
	   	translate = d3.event.translate;
	   	synchronize = true;
	  });
	svg.call(zoom);

	// Run the renderer. This is what draws the final graph.
	render(inner, g);

	//color the selected node and swap the selected node with the one from the previous graph
	g.nodes().forEach(function(v) {
		//clear any previous colors
		g.node(v).elem.style.color = "#000";
		g.node(v).elem.style.fill = "";
		if (selectedNodeID == v){
			g.node(v).elem.style.fill = "#22c";
		};
	});

	aspect = svg.attr("width") / svg.attr("height");
	parent = document.getElementById("righthalve");

	//resize the graph when we resize the window
	window.addEventListener('resize', function(event) {
	    var targetWidth = parent.clientWidth;
	    svg.attr("width", targetWidth);
	    svg.attr("height", Math.round(targetWidth / aspect));
	});

	//we add a listener to every node, if its clicked, we display the environment(store)
	svg.selectAll("g.node").on("click", function(id) {
		//clear out environment
		document.getElementById("environment").innerHTML = "";

		//clear effects from previously selected node if there is one
		if (selectedGraphNode != null) {
			selectedGraphNode.elem.style.color = "#000";
			selectedGraphNode.elem.style.fill = "";
		};


		var _node = g.node(id);
		_node.elem.style.fill = "#22c";

		//define this node as the currently selected node 
		selectedNodeID =  id;
		selectedNode = _node.actualnode;
		selectedGraphNode = _node;

		if (selectedNode != null) {
			if (selectedNode.control.controltype == "ev") {
				var environmentpanel = d3.select('environment');
				var storage = _node.store;
				var environment = selectedNode.control.environment;
				var propertystring = " ";

				for(var envElement in environment){
					for(var prop in storage){
						if (environment[envElement] == prop) {
							propertystring = propertystring + "<br>" + envElement + " = " + storage[prop];
							document.getElementById("environment").innerHTML = propertystring;
						};
					}
				}
			};
		};
	});

	return g;
}

function removeNode(node,graph){

	//when we remove a node, we have to connect its parent to its child (if it exists).
	//and also create a new type of edge because we are hiding a part of the graph now

	var pos = node.position;
	var graphnode = graph.node(pos);
	var incomingEdges = graph.inEdges(pos);
	var outgoingEdges = graph.outEdges(pos);


	//is node already removed?
	if (typeof(graphnode) == 'undefined') {
		return;
	};

	//we check if the node we remove is at the start, end or middle
	//start
	if (pos == 0) {
		alert("can't remove root node");
	} else{
		//end
		if (outgoingEdges == null) {
			for (var i = 0; i < incomingEdges.length; i++) {
				graph.removeEdge(incomingEdges[i].v,pos);
			};
			graph.removeNode(pos);
			//middle
		} else{
			//remove edges
			for (var j = 0; j < incomingEdges.length; j++) {
				graph.removeEdge(incomingEdges[j].v,pos);
			};
			for (var k = 0; k < outgoingEdges.length; k++) {
				graph.removeEdge(pos,outgoingEdges[k].w);
			};

			//relink edges
			for (var l = 0; l < incomingEdges.length; l++) {
				for (var m = 0; m < outgoingEdges.length; m++) {
					if ((incomingEdges[l].v == pos) || (outgoingEdges[m].w == pos)) {
						//edge to self do nothing
					} else{
						graph.setEdge(
							incomingEdges[l].v,
							outgoingEdges[m].w,
							{label: "Nodes in between"}
						);
					};
				};
			};
			//remove node itself
			graph.removeNode(pos);
		}
	}
}

function addNode(node,graph,key,formattedlabel,storage,nodestyle){

	//when we add a node, we have multiple possible scenarios .

	//so first we check if the node we add is at the start, end or middle
	var pos = node.position;
	var incomingEdges = node.incomingedges;
	var outgoingEdges = node.edges;

	var visibleParents = findVisibleParents(node);
	var visibleChildren = findVisibleChildren(node);

	//start
	if (graph.node(pos) == null) {
		if (pos == 0) {
			alert("adding the root node, this shouldn't happen");
		} else{
			//end
			if (outgoingEdges == null) {
				//visualize the node
				graph.setNode(key,{ label: formattedlabel, store: storage, actualnode : node, style: nodestyle });
				graph.node(key).rx = graph.node(key).ry = 5;
				for (var i = 0; i < visibleParents.length; i++) {
					//check if link is a direct link or indirect
					if (nodePartOfIncomingEdges(visibleParents[i],incomingEdges)) {
						graph.setEdge(visibleParents[i].position.toString(),key,{});
					} else{
						graph.setEdge(visibleParents[i].position.toString(),key,{label: "Nodes in between"});
					};	
				};
				//middle
			} else{
				//remove edges between parents and children
				for (var j = 0; j < visibleParents.length; j++) {
					for (var k = 0; k < visibleChildren.length; k++) {
						graph.removeEdge(visibleParents[j].position,visibleChildren[k].position);
					};
				};
				//add node
				graph.setNode(key,{ label: formattedlabel, store: storage, actualnode : node, style: nodestyle });
				graph.node(key).rx = graph.node(key).ry = 5;

				//relink edges
				for (var l = 0; l < visibleParents.length; l++) {
					//check if link is a direct link or indirect
					if (nodePartOfIncomingEdges(visibleParents[l],incomingEdges)) {
						graph.setEdge(visibleParents[l].position.toString(),key,{});
					} else{
						graph.setEdge(visibleParents[l].position.toString(),key,{label: "Nodes in between"});
					};
				}
				for (var m = 0; m < visibleChildren.length; m++) {
					//check if link is a direct link or indirect
					if (partOf(visibleChildren[m],outgoingEdges)) {
						graph.setEdge(key,visibleChildren[m].position.toString(),{});
					} else{
						graph.setEdge(key,visibleChildren[m].position.toString(),{label: "Nodes in between"});
					};
				};
			}
			//check for edge to self
			for (var n = 0; n < node.incomingedges.length; n++) {
				if (node.position == node.incomingedges[n]) {
					graph.setEdge(key,key,{});
				};
			};
		}
	} else{
		//do nothing if the node already exists
	};
}

/*this function starts the visualization process*/
function initializeVisualization(nodes,render){
	var g = new dagreD3.graphlib.Graph().setGraph({});

	g.graph().transition = function transition(selection) { //transition with duration 1000ms
	    return selection.transition().duration(1000);
	};

	// first we draw the full graph
	for (var node of nodes){
		var key = node.position.toString();
		var controltype = node.control.controltype;
		var storage = node.storage;
		var visible = node.visibility;
		var neighbours = node.edges;

		if(controltype == "ev"){
			var value = node.control.expression;
			var formattedlabel = controltype + " : " + value + "\n" + key;
			g.setNode(key,{ label: formattedlabel, store: storage, actualnode : node, style: "fill: #afa" });
		}else if (controltype == "kont"){
			var value = node.control.expression;
			var formattedlabel = controltype + " : " + value + "\n" + key;
			g.setNode(key,{ label: formattedlabel, store: storage, actualnode : node, style: "fill: #faa" });
		}else if (controltype == "call"){
			var value = node.control.expression + "(" + node.control.environment.toString() + ")";
			var formattedlabel = controltype + " : " + value + "\n" + key;
			g.setNode(key,{ label: formattedlabel, store: storage, actualnode : node, style: "fill: #aaf" });
		}else if (controltype == "return"){
			var value = node.control.expression + " --> " + node.control.environment;
			var formattedlabel = controltype + " : " + value + "\n" + key;
			g.setNode(key,{ label: formattedlabel, store: storage, actualnode : node, style: "fill: #aff" });
		}
	}

	//connect nodes
	for (var node of nodes){
		if (node.edges != null){
			for (var i = 0; i < node.edges.length; i++){
				g.setEdge(node.position,node.edges[i].node2name,{});
			}
		};
	}

	// rounded corners
	g.nodes().forEach(function(v) {
	  var node = g.node(v);
	  node.rx = node.ry = 5;
	});

	//remove nodes that are not visible at the moment
	for(var node of nodes){
		if (node.visibility == false) {
			removeNode(node,g);
		};
	}

	// Set up an SVG group so that we can translate the final graph.
	var svg = d3.select("svg"), inner = svg.append("g");
	
	// Set up zoom support
	zoom = d3.behavior.zoom().on("zoom", function() {
		var previoustranslate = translate;
		var previousscale = scale;
	    inner.attr("transform", "translate(" + previoustranslate + ")" +
	                                "scale(" + previousscale + ")");
	    scale = d3.event.scale;
	   	translate = d3.event.translate;
	  });
	svg.call(zoom);

	// Run the renderer. This is what draws the final graph.
	render(inner, g);

	aspect = svg.attr("width") / svg.attr("height");
	parent = document.getElementById("righthalve");


	//we add a listener to every node, if its clicked, we display the environment(store)
	svg.selectAll("g.node").on("click", function(id) {
		//clear out environment
		document.getElementById("environment").innerHTML = "";

		//clear effects from previously selected node if there is one
		if (selectedGraphNode != null) {
			selectedGraphNode.elem.style.color = "#000";
			selectedGraphNode.elem.style.fill = "";
		};


		var _node = g.node(id);
		_node.elem.style.fill = "#22c";

		//define this node as the currently selected node 
		selectedNodeID =  id;
		selectedNode = _node.actualnode;
		selectedGraphNode = _node;

		if (selectedNode != null) {
			if (selectedNode.control.controltype == "ev") {
				var environmentpanel = d3.select('environment');
				var storage = _node.store;
				var environment = selectedNode.control.environment;
				var propertystring = " ";

				for(var envElement in environment){
					for(var prop in storage){
						if (environment[envElement] == prop) {
							propertystring = propertystring + "<br>" + envElement + " = " + storage[prop];
							document.getElementById("environment").innerHTML = propertystring;
						};
					}
				}
			};
		};
	});
	return g;
}

function RemoveVisualizations(){
	var gs = d3.select("svg").selectAll("g")
	gs.selectAll("*").remove();
	d3.behavior.zoom().on("zoom", null)
}

