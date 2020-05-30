extends Node

onready var logText = get_node("RichTextLabel")
var ws = null

func _ready():
	ws = WebSocketClient.new()
	ws.connect("connection_established", self, "_connection_established")
	ws.connect("connection_closed", self, "_connection_closed")
	ws.connect("connection_error", self, "_connection_error")
	ws.connect("server_close_request", self, "_client_close_request")
	ws.connect("data_received", self, "_client_received")
	
	ws.connect("peer_packet", self, "_client_received")
	ws.connect("peer_connected", self, "_peer_connected")
	ws.connect("connection_succeeded", self, "_client_connected", ["multiplayer_protocol"])
	ws.connect("connection_failed", self, "_client_disconnected")
	
	var url = "ws://%s" % Global.get_serve_ip()
	print("Connecting to " + url)
	logText.append_bbcode("\nConnecting to " + url)
	ws.connect_to_url(url)
	
func _peer_connected(id):
	logText.append_bbcode("%s: Client just connected" % id)

func _client_connected(protocol):
	logText.append_bbcode("Client just connected with protocol: %s" % protocol)

func _client_disconnected(clean=true):
	logText.append_bbcode("Client just disconnected. Was clean: %s" % clean)
	
func _connection_established(protocol):
	print("Connection established with protocol: ", protocol)
	logText.append_bbcode("\nConnection established with protocol: %s" % protocol)
	ws.get_peer(1).put_var({
		"type": 'OnPlayerConnect',
		"data": {
			"username": Global.get_username()
		}
	})
	
func _connection_closed():
	print("Connection closed")
	logText.append_bbcode("\nConnection closed")

func _connection_error():
	print("Connection error")
	logText.append_bbcode("\nConnection error")

func _client_close_request(code, reason):
	print("Close code: %d, reason: %s" % [code, reason])
	logText.append_bbcode("\nClose code: %d, reason: %s" % [code, reason])
	
func _client_received(p_id = 1):
	var packet = ws.get_peer(1).get_packet()
	var is_string = ws.get_peer(1).was_string_packet()

	var resultJSON = JSON.parse(packet.get_string_from_utf8())
	
	if resultJSON.result.type == 'log':
		logText.append_bbcode("\n %s" % resultJSON.result.message)

func seedName(text):
	if ws.get_peer(1).is_connected_to_host():
		ws.get_peer(1).put_var({
			"type": ''
		})
		return true
	return false

func _process(delta):
	if ws.get_connection_status() == ws.CONNECTION_CONNECTING || ws.get_connection_status() == ws.CONNECTION_CONNECTED:
		ws.poll()
