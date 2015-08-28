using UnityEngine;
using System.Collections;

public class NavMove : MonoBehaviour {

	public GameObject target;

	public NavMeshAgent agent;
	public Camera camera;
	private UICamera nCamera; 

	// Use this for initialization
	void Start () {
		nCamera = camera.transform.GetComponent<UICamera>();
	}
	
	// Update is called once per frame
	void Update () {
	}

	void OnClick(){
		print ("clicked");

		RaycastHit hit;
		Ray ray = camera.ScreenPointToRay(UICamera.currentTouch.pos);
		
		if (collider.Raycast(ray, out hit, 100.0f)) {
			agent.SetDestination(hit.point);
			
			// Do something with the object that was hit by the raycast.
		}
	}
}
