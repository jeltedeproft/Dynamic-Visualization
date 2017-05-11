/* This function parses a document in json format , returning the information inside as an object*/
function process_input() {
	var inputelement = document.getElementById("json_input");
	var numFiles = inputelement.files.length;

	/*check if user selected more than 1 file */
	if (numFiles > 1){
		alert("u can only open one json file at a time");
	}

	/* the file*/
	var inputfile = inputelement.files[0];

	/* the filereader*/
	var reader = new FileReader();

	reader.onload = function(e) {
	  var result = reader.result;
	  /*convert to json*/
	  var jsonfile = JSON.parse(result);

	  /*get the nodes inside the json file, this variable represents the full graph */
	  nodes = disassembleStates(jsonfile);

	  /*some global variables to communicate*/
	  selectedNodeID = -10;
	  selectedNode = null;
	  selectedGraphNode= null;
	  scale = 1;
	  translate = [0,0];
	  movementX = 0;
	  movementY = 0;
	  scaletemp = 1;
	  translatetemp = [0,0];
	  synchronize = false;

	  /*we get only the first and last node (this is our starting point)*/
	  var lastnumber = Object.keys(nodes).length - 1;

	  // check if the position = 0 or = max
	  for (var node of nodes){
	  	var number = node.position.toString();
	  	if (number == 0 || number == lastnumber){
	  		node.visibility = true;
	  	}
	  }

	  /*remove any pre existing visualizations*/
	  RemoveVisualizations();

	  /*create the renderer, we do this here because we're gna reuse it*/
	  render = new dagreD3.render();

	  /*initialize visualization*/
	  VisualGraph = initializeVisualization(nodes,render);
	}

	reader.readAsText(inputfile);
}