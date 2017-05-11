Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function findNodeByName(nodeName){
	for (var node of nodes){
		if(node.position.toString() == nodeName){
			return node;
		}
	}
}

function findNodeByIndex(index){
	for (var node of nodes){
		if(node.position == parseInt(index)){
			return node;
		}
	}
}

function sortNodesByPosition(nodes){
	return nodes.sort(function(a,b){
		return a.position - b.position;
	})
}

function nodePartOfIncomingEdges(node,incomingedges){
	var returnvalue = false;
	for (var i = 0; i < incomingedges.length; i++) {
		if (node.position == incomingedges[i]) {
			returnvalue = true;
		};
	};
	return returnvalue;
}

function partOf(node,outgoingedges){
	var returnvalue = false;
	for (var i = 0; i < outgoingedges.length; i++) {
		if (node.position == outgoingedges[i].node2name) {
			returnvalue = true;
		};
	};
	return returnvalue;
}

function findVisibleParents(realnode) {
	var pos = realnode.position;
	var incomingEdges = realnode.incomingedges;
	var returnnodes = [];

	for (var i = 0; i < incomingEdges.length; i++) {
		var posFather = incomingEdges[i];
	
		if (VisualGraph.node(posFather) != null) {
			returnnodes.push(findNodeByIndex(posFather));
		} else{
			var foundnodes = findVisibleParentsinBranch(realnode,posFather,[pos]);
			for (var k = 0; k < foundnodes.length; k++) {
				if (VisualGraph.node(foundnodes[k].position) != null) {
					returnnodes.push(foundnodes[k]);
				};
			}
		};
	}
	return returnnodes;
}

function findVisibleParentsinBranch(realnode,parentBranchPos,visitednodes){
	var nextnode = findNodeByIndex(parentBranchPos);
	var nextnodeParents = nextnode.incomingedges;
	var returnnodes = [];
	var visitedNodes = visitednodes;

	if(VisualGraph.node(nextnode.position) != null){
		return [nextnode];
	}else{
		for (var j = 0; j < nextnodeParents.length; j++) {
			var posFather = nextnodeParents[j];
			visitedNodes.push(posFather);

			if (CheckDoubles(posFather,visitedNodes)) {
				var foundnodes = findVisibleParentsinBranch(realnode,posFather,visitedNodes);

				for (var k = 0; k < foundnodes.length; k++) {
					if (VisualGraph.node(foundnodes[k].position) != null) {
						returnnodes.push(foundnodes[k]);
					};
				}
			}
		}
		return returnnodes;
	}
}

function findVisibleChildren(realnode) {
	var pos = realnode.position;
	var Edges = realnode.edges;
	var returnnodes = [];

	if(Edges != null){
		for (var i = 0; i < Edges.length; i++) {
			var posChild = Edges[i].node2name;

			if (VisualGraph.node(posChild) != null) {
				returnnodes.push(findNodeByIndex(posChild));
			}else{
				var foundnodes = findVisibleChildreninBranch(realnode,posChild,[pos]);
				for (var k = 0; k < foundnodes.length; k++) {
					if (VisualGraph.node(foundnodes[k].position) != null) {
						returnnodes.push(foundnodes[k]);
					};
				}
			}
		}
	}
	return returnnodes;
}

function findVisibleChildreninBranch(realnode,childBranchPos,visitednodes){
	var nextnode = findNodeByIndex(childBranchPos);
	var nextnodeChilds = nextnode.edges;
	var returnnodes = [];
	var visitedNodes = visitednodes;

	if(VisualGraph.node(nextnode.position) != null){
		return [nextnode];
	}else{
		if (nextnodeChilds == null) {
			return [];
		};
		for (var j = 0; j < nextnodeChilds.length; j++) {
			var posChild = nextnodeChilds[j].node2name;
			visitedNodes.push(posChild);
			if (CheckDoubles(posChild,visitedNodes)) {
				var foundnodes = findVisibleChildreninBranch(realnode,posChild,visitedNodes);

				for (var k = 0; k < foundnodes.length; k++) {
					if (VisualGraph.node(foundnodes[k].position) != null) {
						returnnodes.push(foundnodes[k]);
					};
				}
			};	
		}
		return returnnodes;
	}
}

function CheckDoubles(element, array){
	var counter = 0;
	for (var i = 0; i < array.length; i++) {
		if (element == array[i]) {
			counter++;
		};
	}
	if (counter > 1){
		return false;
	}else{
		return true;
	}
}

function nodeWithPosition(nodeID,x,y){
	this.nodeID = nodeID;
	this.x = x;
	this.y = y;
}
