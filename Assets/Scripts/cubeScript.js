#pragma strict

var x: int;
var y: int;
var resource: int;

var carrotPrefab: GameObject;

function Start () {

}

function Update () {
}

function setX(input: int){
	x = input;
}

function setY(input: int){
	y = input;
}

function setType(type: int){

	switch(type){
	case 1: renderer.material.color = Color.grey; // Set main color
			resource = 1;
			break;
	case 2: //new bit of code, needs optimising
			var carrot: GameObject;																	
			carrot = Instantiate(carrotPrefab);							
			carrot.transform.parent = transform;
			carrot.transform.position = transform.position;
			carrot.transform.position.z -= 1.2; //remove after local blender pos is changed (it moves carrot infront of cube)
			carrot.transform.Rotate(Vector3.up * 100 * ((x*y)%36)); //gives sudo random but constant for cube location
			///////////////////////////////////
			
			resource = 2; 
			break;
	case 3: renderer.material.color = Color.green;
			resource = 3; 
			break;
	case 4: renderer.material.color = Color.magenta;
			resource = 4; 
			break;
	case 5: renderer.material.color = Color.cyan;
			resource = 5; 
			break;
	default: renderer.material.color = Color.blue;
			break;
	}

}