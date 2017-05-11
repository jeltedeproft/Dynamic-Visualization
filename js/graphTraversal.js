//we're stepping inside a function call
function NextNode(){
	var Nodes = nodes;
	var graph = VisualGraph;
	var renderer = render;
	var currentNodeIndex = selectedNodeID;
	var currentNode = selectedNode;
	var graphnode = selectedGraphNode;
	var lastnumber = Object.keys(nodes).length - 1;
	var edges = currentNode.edges;

	if ((currentNode.position != lastnumber) && (graphnode != null)){
		for (var i = 0; i < edges.length; i++) {
			var nextNode = findNodeByIndex(parseInt(edges[i].node2name));
			nextNode.visibility = true;

			selectedNodeID = nextNode.position;
			selectedNode = nextNode;
		}

		/*initialize visualization*/
		VisualGraph = visualize(Nodes,render);

		selectedGraphNode = VisualGraph.node(nextNode.position.toString());
	}
}

function StepBack(){
	var Nodes = nodes;
	var graph = VisualGraph;
	var renderer = render;
	var currentNodeIndex = selectedNodeID;
	var currentNode = selectedNode;
	var graphnode = selectedGraphNode;
	var incEdges = currentNode.incomingedges;

	if ((currentNode.position != 0) && (graphnode != null)){
		currentNode.visibility = false;
		for (var i = 0; i < incEdges.length; i++) {
			var previousNode = findNodeByIndex(parseInt(incEdges[i]));

			selectedNodeID = previousNode.position;
			selectedNode = previousNode;
		}

		/*initialize visualization*/
		VisualGraph = visualize(Nodes,render);

		selectedGraphNode = VisualGraph.node(previousNode.position.toString());
	}
}

function StepOver(){
	var Nodes = nodes;
	var graph = VisualGraph;
	var renderer = render;
	var currentNodeIndex = parseInt(selectedNodeID);
	var currentNode = selectedNode;
	var graphnode = selectedGraphNode;
	var currentNesting = currentNode.control.nesting;
	var edges = currentNode.edges;
	var visitednodes = [currentNode.position];

	if (edges != null) {
		for (var i = 0; i < edges.length; i++) {
			var child = edges[i].node2name;
			visitednodes.push(child);
			currentNode = findNodeByIndex(parseInt(child));
			currentNode.visibility = true;
			currentNodeIndex = child;

			//found a call node, a loop or a node at the far end?
			if ((!CheckDoubles(child,visitednodes)) || (edges == null)){
				//do nothing, this branch is cleared
			}else{
				if (currentNode.control.controltype != "call") {
					checkBranchForCallNode(child,visitednodes);
				} else{
					checkBranchForReturnNode(child,visitednodes,currentNode.control.nesting);
				};
			}
		}
	}
	VisualGraph = visualize(Nodes,render);
}

function checkBranchForCallNode(nodename,visitedNodes){
	var Nodes = nodes;
	var graph = VisualGraph;
	var currentNodeIndex = parseInt(nodename);
	var currentNode = findNodeByIndex(currentNodeIndex);
	var currentNesting = currentNode.control.nesting;
	var edges = currentNode.edges;
	var visitednodes = visitedNodes;

	if (edges != null) {
		for (var i = 0; i < edges.length; i++) {
			var child = edges[i].node2name;
			visitednodes.push(child);
			currentNode = findNodeByIndex(parseInt(child));
			currentNode.visibility = true;
			currentNodeIndex = child;

			//found a call node, a loop or a node at the far end?
			if ((!CheckDoubles(child,visitednodes)) || (edges == null)){
				//do nothing, this branch is cleared
			}else{
				if (currentNode.control.controltype != "call") {
					checkBranchForCallNode(child,visitednodes);
				} else{
					checkBranchForReturnNode(child,visitednodes,currentNode.control.nesting);
				};
			}
		}
	}
}

function checkBranchForReturnNode(nodename,visitedNodes,nesting){
	var Nodes = nodes;
	var graph = VisualGraph;
	var currentNodeIndex = parseInt(nodename);
	var currentNode = findNodeByIndex(currentNodeIndex);
	var currentNesting = currentNode.control.nesting;
	var edges = currentNode.edges;
	var visitednodes = visitedNodes;

	if (edges != null) {
		for (var i = 0; i < edges.length; i++) {
			var child = edges[i].node2name;
			visitednodes.push(child);
			currentNode = findNodeByIndex(parseInt(child));
			currentNode.visibility = false;
			currentNodeIndex = child;

			//found a call node, a loop or a node at the far end?
			if ((!CheckDoubles(child,visitednodes)) || (edges == null)){
				//do nothing, this branch is cleared
			}else{
				if ((currentNode.control.controltype == "return") && (currentNode.control.nesting == nesting)){
					currentNode.visibility = true;
					selectedNodeID = currentNodeIndex;
					selectedNode = currentNode;
				} else{
					checkBranchForReturnNode(child,visitednodes,nesting);
				};
			}
		}
	};
}

function CollapseNodes(){
	var Nodes = nodes;
	var currentNodeIndex = selectedNodeID;
	var currentNode = selectedNode;
	var graphnode = selectedGraphNode;
	var lastnumber = Object.keys(nodes).length - 1;

	if ((currentNodeIndex >= 0) && (graphnode != null)){
		// check if the position = 0 or = max
		for (var node of Nodes){
			var number = node.position;
			if (number > currentNodeIndex){
				node.visibility = false;
			}
		}
	};

	/*visualize*/
	VisualGraph = visualize(Nodes,render);
}

function ShowFullGraph(){
	var Nodes = nodes;

	for (var node of Nodes){
		node.visibility = true;
	}

	/*prepare information for centralizing graph*/
	var gsPre = d3.select("svg").selectAll("g")
	var XPre;
	var YPre;

	for (var i = 0; i < gsPre.length; i++) {
		for (var j = 0; j < gsPre[i].length; j++) {
			var elPre = gsPre[i][j];
			if(elPre.className.baseVal == "output"){
				XPre = elPre.getScreenCTM().e;
				YPre = elPre.getScreenCTM().f;
			}
		}
	}

	/*visualize*/
	VisualGraph = visualize(Nodes,render);

	/*centralize graph*/
	var gs = d3.select("svg").selectAll("g")
	var X;
	var Y;

	for (var i = 0; i < gs.length; i++) {
		for (var j = 0; j < gs[i].length; j++) {
			var el = gs[i][j];
			if(el.className.baseVal == "output"){
				X = el.getScreenCTM().e;
				Y = el.getScreenCTM().f;
			}
		}
	}
	diffX = X - XPre;
	diffY = Y - YPre;
	var previoustranslate = translate;
	var previousscale = scale;

	inner.attr("transform", "translate(" + previoustranslate + ")" +
	                                "scale(" + previousscale + ")");
}

function Reset(){
	var Nodes = nodes;
	var lastnumber = Object.keys(nodes).length - 1;

	// check if the position = 0 or = max
	for (var node of Nodes){
		var number = node.position.toString();
		if (number == 0 || number == lastnumber){
			node.visibility = true;
		}
		else{
			node.visibility = false;
		}
	}
	/*visualize*/
	VisualGraph = visualize(Nodes,render);
}

function showInformation(element){
	var doc = document.getElementById('popup');
	doc.style.display = 'block';

	if (element == "nextnode") {
		doc.innerHTML = "this function allows you to show the next node(s) relative to the currently selected node";
	}else if (element == "stepback"){
		doc.innerHTML = "this function allows you to hide the currently selected node";
	}else if (element == "stepover"){
		doc.innerHTML = "this function allows you to skip towards the next function call" +  
						"and then hide all nodes up until the return node of that function." + 
						"Effectively skipping over the closest by function call";
	}else if (element == "collapsenodes"){
		doc.innerHTML = "this function allows you to collapse all nodes after the currently selected one" +
						"(All nodes with a higher node number).";
	}else if (element == "showfullgraph"){
		doc.innerHTML = "this function allows you to show the complete graph";
	}else if (element == "reset"){
		doc.innerHTML = "this function allows you to reset the graph to its original state." +
						"Only showing the begin and end nodes.";
	};
}

function removePopup(){
	var doc = document.getElementById('popup');
	doc.style.display = 'none';
}