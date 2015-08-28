#pragma strict

var rabbit: GameObject;
var startingPos: Vector3;

function Start () {

	 rabbit = GameObject.Find("/ToonRabbit");
	 startingPos = transform.position;
	 
}

function Update () {

	
	var playerPos: Vector3 = rabbit.rigidbody.position;
	transform.position = Vector3(playerPos.x, playerPos.y, 0) + startingPos;
}