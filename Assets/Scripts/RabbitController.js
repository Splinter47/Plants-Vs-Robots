#pragma strict

var vertAcc: float = 1.5;
var horAcc: float = 0.8;
public var thruster : ParticleSystem;
var cubeStart: GameObject;

private var currentCube: GameObject;
private var currentCubeDown: GameObject;
private var currentCubeLeft: GameObject;
private var currentCubeRight: GameObject;

private var greyResource: int;
private var redResource: int;
private var greenResource: int;
private var magentaResource: int;
private var cyanResource: int;

private var fuelInStation: int = 0;
private var fuelMax: int = 100;
private var fuel: int = 50;
private var refuelStartTime: float;

private var delayCounter: float;
private var drillDelayStartTime: float;

private var anim: Animation; // the animation reference will be saved here
private var facingLeft: boolean = true;
//private var facingRight: boolean = false;

private var torch: Light;
private var duration : float= 1;


// Use this for initialization
function Start (){
		refuelStartTime = Time.time;
		drillDelayStartTime = Time.time;
		// find the child object Model and get a reference to its animation:
  		anim = transform.Find("ToonRabbitMesh").animation;
  		//intial GUI refresh
  		updateFuel();
  		torch = GameObject.Find("rabbitTorch2").GetComponent(Light);
  		thruster.Stop(true);
}
	
// Update is called once per frame
function Update ()
{
	// Iphone touch test
	if (Input.touchCount > 0){
		print(Input.GetTouch(0).position);
	}
	
	// Get the horizontal and vertical axis.
	// By default they are mapped to the arrow keys.
	// The value is in the range -1 to 1
			
	//check for vertical then add force
	if (Input.GetAxis ("Vertical") > 0) {
		if(thruster.isPlaying == false){thruster.Play(true);}
		rigidbody.AddForce (Vector3.up * vertAcc);
		
		currentCubeDown = null; // make null, so it can't be destroyed
		currentCubeLeft = null;
		currentCubeRight = null;	
	} 
	else{
			thruster.Stop(true);
			
			if (Input.GetAxis ("Vertical") < 0) {
				if(currentCubeDown != null){
					currentCube = currentCubeDown;
					drill();
				}
		}
	} 
	
	//check for horizontal then add force
	if (Input.GetAxis ("Horizontal") > 0) {
		rigidbody.AddForce (Vector3.right * horAcc);
		//play walk right animation
		if(facingLeft){
			anim.CrossFade("turnRight");
			facingLeft = false;
		}
		currentCubeLeft = null;
		
		if (rigidbody.velocity.y < 0.05) {
			if(currentCubeRight != null){
				currentCube = currentCubeRight;
				drill();
			}
		}
		
	} 
	else if (Input.GetAxis ("Horizontal") < 0) {
		rigidbody.AddForce (Vector3.left * horAcc);
		//play walk left animation
		if(!facingLeft){
			anim.CrossFade("turnLeft");
			facingLeft = true;
		}
		currentCubeRight = null;
		
		if (rigidbody.velocity.y < 0.05) {
			if(currentCubeLeft != null){
				currentCube = currentCubeLeft;
				drill();
			}
		}
	} 
	
	updateFuel();
	rigidbody.velocity = Vector3.ClampMagnitude(rigidbody.velocity, 25);
	delayCounter = Time.time - drillDelayStartTime;
	lightFlicker();
		
}
	
//when the rabbit enters th collider of another object, pass hit as the other object i.e a 'cube' 
//OnCollisionStay is called once per frame
function OnCollisionStay(hit : Collision){
 
	//check that the object hit has a 'cube' 
	if(hit.gameObject.tag == "cube"){
		
		//get the X and Y of cube which is hit and the rabbit player
		var cubeY: int = hit.gameObject.GetComponent(cubeScript).y;
		var cubeX: int = hit.gameObject.GetComponent(cubeScript).x-(grid.GRIDSIZEX/2);
		var rabbitY: float = rigidbody.position.y;
		var rabbitX: float = rigidbody.position.x;
		
		//cube must be below the rabbit
		if((2*cubeY) >= (1.5-rabbitY)){      // ofset due to rabbits hight about 1.4 to 1.9
   			currentCubeDown = hit.gameObject;
   		}
   		//cube must be to the left of the rabbit and a cube touching below must exist
   		else if((2*cubeX) <= (rabbitX-1.5) && currentCubeDown != null){
   			currentCubeLeft = hit.gameObject;
   		}
   		//cube must be to the right of the rabbit and a cube touching below must exist
   		else if((2*cubeX) >= (rabbitX-1.5) && currentCubeDown != null){
   			currentCubeRight = hit.gameObject;
   		}
	}
	
}

function OnTriggerEnter(hit : Collider){
	
	//when the rabbit enters the fuelstaion's trigger, call refuel();
	if (hit.gameObject.name == "FuelStation"){
		print("fueling");
		refuel();
		
	}
}

function drill(){

	//set a delay to prevent many cubes being destroyed at once
	if(delayCounter >0.5){
		drillDelayStartTime = Time.time;
		
		var xIndex: int = currentCube.GetComponent(cubeScript).x;
		var yIndex: int = currentCube.GetComponent(cubeScript).y;
		
		var resource: int = currentCube.GetComponent(cubeScript).resource;
		switch(resource){
		case 1: greyResource += 1;
				break;
		case 2: redResource += 1; 
				break;
		case 3: greenResource += 1; 
				break;
		case 4: magentaResource += 1; 
				break;
		case 5: cyanResource += 1; 
				break;
		default: print("this cube has nothing in it, strange?!?");
				break;
		}
				
		grid.cubeData[xIndex, yIndex] = 0;
		Destroy(currentCube);
		grid.cubesNeededUpdated = true;
		
	}
}

function refuel(){

	fuelInStation += redResource * 1;
	fuelInStation += greenResource * 5;
	fuelInStation += magentaResource * 30;
	fuelInStation += cyanResource * 100;
	
	redResource = 0;
	greenResource = 0;
	magentaResource = 0;
	cyanResource = 0;
	
	// case1 total refuel: set tank full and take differnce off fuelInStation
	if(fuelInStation + fuel >= fuelMax){				
		refuelStartTime = Time.time; 			// this resets the fuel to 100/100
		fuelInStation -= (fuelMax-fuel);
	}
	// case2 partial refuel: (set tank full)- (full tank) + (old fuel) + (new fuel)
	else if(fuelInStation>0){
		refuelStartTime = Time.time - (fuelMax-fuel-fuelInStation); // setting earlier time reduces start fuel
		fuelInStation = 0;
	}
}

function updateFuel(){
	var counter: int = Time.time - refuelStartTime;
	fuel = fuelMax - counter;
	print(fuel);
}

function OnGUI () {
		var guiString: String = "Red(1) Gathered: " + redResource;
		GUI.Label (Rect (10, 10, 200, 20), guiString);
		guiString = "Green(5) Gathered: " + greenResource;
		GUI.Label (Rect (10, 30, 200, 20), guiString);
		guiString = "Magenta(30) Gathered: " + magentaResource;
		GUI.Label (Rect (10, 50, 200, 20), guiString);
		guiString = "Cyan(100) Gathered: " + cyanResource;
		GUI.Label (Rect (10, 70, 200, 20), guiString);
		
		var guiStringFuel: String = "Fuel: " + fuel + "/" + fuelMax;
		GUI.Label (Rect (500, 10, 200, 20), guiStringFuel);
		
		var guiStringFuelInStation: String = "Fuel in the Station: " + fuelInStation;
		GUI.Label (Rect (500, 30, 200, 20), guiStringFuelInStation);
		
		var depth: int = -(rigidbody.position.y / 2);
		var guiStringDepth: String = "Dept: " + depth;
		GUI.Label (Rect (500, 50, 200, 20), guiStringDepth);
		
		if(fuel<=0){
		var guiStringGameOver: String = "***Game Over***";
		GUI.Label (Rect (250, 200, 200, 20), guiStringGameOver);
		}
	}
	
function lightFlicker(){
	var rnd : float = Random.Range(0.0,1.0);
	var lightIntensity:float = 5.8;
	if (rnd>0.98){
		lightIntensity = rnd;
	}
	
	// argument for cosine
	var phi: float = Time.time / duration * 2 * Mathf.PI;
	// get cosine between -0.5 and 0.5
	var amplitude: float = Mathf.Cos(phi) * 0.5;
	// set light color
	torch.intensity = amplitude + lightIntensity;
	
}