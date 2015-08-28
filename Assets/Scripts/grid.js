#pragma strict
 
var cubePrefabs : GameObject[];
var spacePrefabs : GameObject[];

private var rabbit: GameObject;

private var zoneX: int = 0;
private var zoneY: int = 0;
var zoneSize: int = 12; //this should be set to an even number >= 2

static var GRIDSIZEX: int = 200;
static var GRIDSIZEY: int = 1000;
static var cubeData: int[,];
static var cubeDataShape: int[,];
private var aliveCubes;
private var spaces;
static var cubesNeededUpdated: boolean = false;

function Start () {

	// This will return the game object named rabbit.
	// rabbit must not have a parent in the hierarchy view!
	rabbit = GameObject.Find("/ToonRabbit");
	print("starting position of the player is: " + rabbit.rigidbody.position);
	
	
	cubeData = new int[GRIDSIZEX, GRIDSIZEY];					// set the size of the array
	cubeDataShape = new int[GRIDSIZEX, GRIDSIZEY];				
	
	for (var i : int = 0; i< GRIDSIZEX; i++){											
		for(var j: int = 0; j< 250; j++){
			cubeData[i,j] = chooseCubeType(0.1, 0.5, 0.9, 0.99, 0.999);
		}
		for(j = 250; j< 500; j++){
			cubeData[i,j] = chooseCubeType(0.05, 0.5, 0.6, 0.9, 0.99);
		}
		for(j = 500; j< 750; j++){
			cubeData[i,j] = chooseCubeType(0.01, 0.5, 0.55, 0.8, 0.9);
		}
		for(j = 750; j< GRIDSIZEY; j++){
			cubeData[i,j] = chooseCubeType(0.01, 0.5, 0.51, 0.6, 0.8);
		}
	}
	
	//update all cube shapes//
	for (var m : int = 0; m< GRIDSIZEX; m++){											
		for(var n: int = 0; n< GRIDSIZEY; n++){
			updateCubeDataShape(m,n);
		}
	}
	//////////////////////////
	
	/////REMOVE LATER//////
	var cubeTypeCount: int[] = new int[6];
	
	for(var k: int = 0; k< GRIDSIZEY; k++){											
		for (var l : int = 0; l< GRIDSIZEX; l++){
			switch (cubeData[l,k]){
			case 0: cubeTypeCount[0] += 1;
					break;
			case 1: cubeTypeCount[1] += 1;
					break;
			case 2: cubeTypeCount[2] += 1;
					break;
			case 3: cubeTypeCount[3] += 1;
					break;
			case 4: cubeTypeCount[4] += 1;
					break;
			case 5: cubeTypeCount[5] += 1;
					break;
			default: print("there is a cube in here that doesn't belong?!");
					 break;
			}
		}
	}
	
	print("empty cubes: " + cubeTypeCount[0]);
	print("grey cubes: " + cubeTypeCount[1]);
	print("red cubes: " + cubeTypeCount[2]);
	print("green cubes: " + cubeTypeCount[3]);
	print("magenta cubes: " + cubeTypeCount[4]);
	print("cyan cubes: " + cubeTypeCount[5]);
	///////////////////////

	createLocalCubes(zoneX, zoneY);
		
}

function Update () {

	var newZoneX: int = findCurrentZoneXorY(0);		// find the current zone.
	var newZoneY: int = -findCurrentZoneXorY(1); 	// negative becuase as you go down, zones increase.

	if (zoneX != newZoneX || zoneY != newZoneY){
		zoneX = newZoneX;							// if the zone changes, update it.
		zoneY = newZoneY;
		removeAllCubes();
		createLocalCubes((zoneX), (zoneY));
	}
	
	if(cubesNeededUpdated == true){
		updateAllCubes();
		cubesNeededUpdated = false;
	}

}

function createLocalCubes(xStart: int, yStart: int){
	//draw a grid of cube objects from the script on cubestart 
	//by duplicating cube in x and y for every even int
	
	xStart = (xStart*zoneSize/2) - (zoneSize);	// start grid at an ofset above and to the left of rabbit.
	yStart = (yStart*zoneSize/2) - (zoneSize);	// i.e. = (scale and move by size of border) - (move rabbit to centre of zone)
	
	// limit the cube spawns so be inside the size of the array
	
	var xLimit: int = (GRIDSIZEX/2);
	var yLimit: int = GRIDSIZEY;
	
	if (yStart < 0)							{ yStart = 0;}
	if (yStart > yLimit-(2*zoneSize)-1)		{ yStart = yLimit-(2*zoneSize)-1;}
	if (xStart < -xLimit)					{ xStart = -xLimit;}
	if (xStart > xLimit-(2*zoneSize)-1)		{ xStart = xLimit-(2*zoneSize)-1;}
	
	for(var j: int = yStart; j< (yStart + (zoneSize*2)); j++){											
		for (var i : int = xStart; i< (xStart + (zoneSize*2)); i++) {									
																										
																									// load cubes around-
			var cube: GameObject;																	// current zone
			cube = Instantiate (calculateCubePrefab((i+(GRIDSIZEX/2)),j));							// (x,y)-->	[][][][]
			cube.transform.position = Vector3((i+1)*2.0, -j*2.0, 0);								// 			[]{}{}[]
			cube.name = "cube("+(i+(GRIDSIZEX/2))+","+j+")"; // add ofset cos array isn't negative	// 			[]{}{}[]
																									// 			[][][][]
			if(cubeData[(i+(GRIDSIZEX/2)),j] != 0){
				cube.GetComponent(cubeScript).setX((i+(GRIDSIZEX/2)));									
				cube.GetComponent(cubeScript).setY(j);
				cube.GetComponent(cubeScript).setType(cubeData[(i+(GRIDSIZEX/2)),j]);
			}
		}																					
	}																						
}

function removeAllCubes(){

	aliveCubes = GameObject.FindGameObjectsWithTag ("cube");
	spaces = GameObject.FindGameObjectsWithTag ("space");

	if (aliveCubes != null){
		for (var cube in aliveCubes){
			DestroyImmediate(cube);
		}
	}
	if (spaces != null){
		for (var space in spaces){
			DestroyImmediate(space);
		}
	}
	
}

function findCurrentZoneXorY(axis: int){
	//each square is 2by2 since cubes are each 2by2by2
	//int fourSquares = 2*4;
	var currentXorY: int;
	
	if(axis == 0){currentXorY = rabbit.rigidbody.position.x;}
	else 
	if (axis == 1){currentXorY = rabbit.rigidbody.position.y;}
	else
	throw "this is an invalid axis (choose '0' for x OR '1' for y)";
		
	//assume that zone size is 10 cubes
	var currentZoneXorY = Mathf.Floor(currentXorY/zoneSize);
	
	return currentZoneXorY;
}

function chooseCubeType(prob0: float, prob1: float, prob2: float, prob3: float, prob4: float){

	//prob 5 will be anything that is left

	var rnd : float = Random.value;
 
			if (rnd < prob0) {
			   return 0;
			} else if (rnd < prob1) {
			   return 1;
			} else if (rnd < prob2) {
			   return 2;
			} else if (rnd < prob3) {
			   return 3;
			} else if (rnd < prob4) {
			   return 4;
			} else {
			   return 5;
			} 
}

////////////////////code for cube shapes//////////////////////////

function updateCubeDataShape(i: int, j: int){
	//finds the cube type (0-16) for a cube
	//by looking at the value of the surrounding 
	//elements in the cubeData array
	
	//represented as a 1,2,4or8 or 0 int (1,2,4or8=rounded, 0=cornered)
	var topLeft: int = 0;
	var topRight: int = 0;
	var bottomLeft: int = 0;
	var bottomRight: int = 0;
	
	if(cornerChecker(i, j, -1, -1)){
		topLeft = 1;
	}
	if(cornerChecker(i, j, 1, -1)){
		topRight = 2;
	}
	if(cornerChecker(i, j, -1, 1)){
		bottomLeft = 4;
	}
	if(cornerChecker(i, j, 1, 1)){
		bottomRight = 8;
	}
	
	
	cubeDataShape[i,j] = topLeft + topRight + bottomLeft + bottomRight;
}

function cornerChecker(cubeX: int, cubeY: int, xSide: int, ySide: int){
	if(cubeData[cubeX, cubeY] != 0){
		//makes sure we are not at two edges
		if((cubeX==0 || cubeX==(GRIDSIZEX-1)) && (cubeY==0 || cubeY==(GRIDSIZEY-1))){
		  	return true;
		//if we are at the top or bottom, just check side
		}else if((cubeY==0 && ySide == -1) || (cubeY==(GRIDSIZEY-1) && ySide == 1)){
			if(cubeData[cubeX+xSide, cubeY] == 0){
				return true;
			}else{
				return false;
			}
		//if we are at the sides, just check top/bottom
		}else if((cubeX==0 && xSide == -1) || (cubeX==(GRIDSIZEX-1) && xSide == 1)){
			if(cubeData[cubeX, cubeY+ySide] == 0){
				return true;
			}else{
				return false;
			}
		}else if(cubeData[cubeX+xSide, cubeY] == 0 && 			// example top left corner. (check 3 in top corner)
				 cubeData[cubeX, cubeY+ySide] == 0 && 			//	  {}{}[]
				 cubeData[cubeX+xSide, cubeY+ySide] == 0){		//	  {}**[]
			return true;										//	  [][][]
		}else{
			return false;
		}
	}else{
		//makes sure we are not at two edges
		if((cubeX==0 || cubeX==(GRIDSIZEX-1)) && (cubeY==0 || cubeY==(GRIDSIZEY-1))){
		  	return false;
		  	
		//if we are at the top or bottom, just check side
		}else if((cubeY==0 && ySide == -1) || (cubeY==(GRIDSIZEY-1) && ySide == 1)){
			return false;
			
		//if we are at the sides, just check top/bottom
		}else if((cubeX==0 && xSide == -1) || (cubeX==(GRIDSIZEX-1) && xSide == 1)){
			return false;
				
		}else if(cubeData[cubeX+xSide, cubeY] != 0 && 			// example top left corner. (check 2 in top corner)
				 cubeData[cubeX, cubeY+ySide] != 0){ 			//	  []{}[]	 												
			return true;										//	  {}  []
		}else{													//	  [][][]
			return false;
		}
	}
}

function updateAllCubes(){
	//update all cube shapes//
	for (var m : int = 0; m< GRIDSIZEX; m++){											
		for(var n: int = 0; n< GRIDSIZEY; n++){
			updateCubeDataShape(m,n);
		}
	}
	removeAllCubes();
	createLocalCubes((zoneX), (zoneY));
}

function calculateCubePrefab(cubeX: int, cubeY: int){
	if(cubeData[cubeX, cubeY] != 0){
		return cubePrefabs[cubeDataShape[cubeX, cubeY]];
	}else{
		return spacePrefabs[cubeDataShape[cubeX, cubeY]];
	}
}
////////////////////end code for cube shapes///////////////////////

