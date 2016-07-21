<?php 
/*
 * Author: roberc
 * One file for output and input. More precisely - there is no "input".
 * Script works like a proxy for javascript. Why? Cross-domain browser limitations...
 * If you have the API password obtained from Shopify, you may use it.
 * This script should work on any server and any modern browsers.
 */
class Shopify {
	private $login, $pass;
	private $url;
	protected $curl;
	
	function __construct($login, $pass, $url) {
		$this->curl = curl_init();
		
		// didn't tested. shoud work
		
		if(strpos($url, '//')) $url = substr($url, strpos($url, '//') + 2);
		if(strpos($url, '/')) $url = substr($url, 0, strpos($url, '/'));
		
		$this->login = $login;
		$this->pass = $pass;
		$this->url = 'https://' . $this->login . ':' . $this->pass . '@' . $url . '/admin';
		
		curl_setopt($this->curl, CURLOPT_USERNAME, $this->login);
		curl_setopt($this->curl, CURLOPT_PASSWORD, $this->pass);
		curl_setopt($this->curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8'));
		curl_setopt($this->curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($this->curl, CURLOPT_VERBOSE, 0);
		curl_setopt($this->curl, CURLOPT_HEADER, 0);
		curl_setopt($this->curl, CURLOPT_SSL_VERIFYPEER, false);
	}
	
	public function post($url, array $params) {
		curl_setopt($this->curl, CURLOPT_URL, $this->url . '/' . $url);
		curl_setopt($this->curl, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($this->curl, CURLOPT_POSTFIELDS, json_encode($params));
		return curl_exec($this->curl);
	}
	
	public function get($url) {
		curl_setopt($this->curl, CURLOPT_URL, $this->url . '/' . $url);
		curl_setopt($this->curl, CURLOPT_CUSTOMREQUEST, "GET");
		return curl_exec($this->curl);
	}
};

if($_SERVER['REQUEST_METHOD'] == 'POST') {
	// how to get data from Angular? yes, it's crazy.
	$data = json_decode(file_get_contents("php://input"), true);
	$ret = array();
	if(is_array($data['sys']) && strlen($data['sys']['l']) && strlen($data['sys']['p']) && strlen($data['sys']['u'])) {
		header("Content-Type: application/json");
		$cUrl = new Shopify($data['sys']['l'], $data['sys']['p'], $data['sys']['u']);
		// Shopify don't need credentials
		unset($data['sys']);
		$str = $cUrl->post('products.json', $data);
		// just a dirty hack
		$r = json_decode('[' . $str . ']');
		$r = $r[0];
		if(strlen($r->errors)) {
			$ret['errors'] = $r->errors;
		}
		else {
			$ret['product_id'] = $r->product->id;
		}
	}
	echo json_encode($ret);
	die();
}
?>
<!doctype html><html><head><title>Shopify Insert Product Test Page</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" />
<meta http-equiv="Cache-Control" content="must-revalidate, no-store, private, no-cache" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<script type="text/javascript" src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
<script type="text/javascript" src="https://code.jquery.com/ui/1.12.0/jquery-ui.min.js"></script>
<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/angularjs/1.5.3/angular.min.js"></script>
<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/angularjs/1.5.3/angular-route.min.js"></script>
</head><body><div id="container" style="width:600px; margin:auto">
<script type="text/javascript" src="shopify.js"></script>
<script>
var url = '<?php echo $_SERVER['PHP_SELF'] ?>';
</script>
<div ng-app="Shopify"><div class="view-container"><div ng-view class="view-frame"></div></div></div>
</div></body></html>
