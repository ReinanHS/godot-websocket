extends Node

onready var ChatLog = get_tree().get_root().get_node("Control").find_node("ChatLog")
onready var ChatTextBox = get_tree().get_root().get_node("Control").find_node("ChatTextBox")
onready var PreerList = get_tree().get_root().get_node("Control").find_node("PeerList")
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
	ChatLog._append_log("Conectando ao servidor %s" %url, 1)
	ChatLog._append_log("Espere alguns segundos até estabelecermos uma conexão...", 1)

	ws.connect_to_url(url)
	
func _peer_connected(id):
	#print("%s: Client just connected" % id)
	ChatLog._append_log("O player de Id %s acabou de se conectar" % id, 1)

func _client_connected(protocol):
	#print("Client just connected with protocol: %s" % protocol)
	ChatLog._append_log("Conexão realizada com sucesso!", 3)

func _client_disconnected(clean=true):
	#print("Client just disconnected. Was clean: %s" % clean)
	ChatLog._append_log("Um player saio da sala", 2)
	
func _connection_established(protocol):
	#print("Connection established with protocol: ", protocol)
	ChatLog._append_log("Conexão realizada com sucesso!", 3)	
	ws.get_peer(1).put_var({
		"type": 'OnPlayerConnect',
		"data": {
			"username": Global.get_username()
		}
	})
	
func _connection_closed():
	#print("Connection closed")
	ChatLog._append_log("Você foi desconectado do Servidor ", 1)	

func _connection_error():
	#print("Connection error")
	ChatLog._append_log("Não foi possível estabelecer uma conexão com o servidor", 1)
	return get_tree().change_scene("res://scenes/Login.tscn")

func _client_close_request(code, reason):
	#print("Close code: %d, reason: %s" % [code, reason])
	ChatLog._append_log("Conexão fechada: %d, por: %s" % [code, reason], 1)
	
func _client_received(p_id = 1):
	var packet = ws.get_peer(1).get_packet()
	var is_string = ws.get_peer(1).was_string_packet()

	var resultJSON = JSON.parse(packet.get_string_from_utf8())
	
	if resultJSON.result.type == 'log':
		ChatLog._append_log(resultJSON.result.message, resultJSON.result.color)
	elif resultJSON.result.type == 'score':
		PreerList._update_list(resultJSON.result.score)
	pass

func _send_message(text: String):
	if ws.get_peer(1).is_connected_to_host():
		ws.get_peer(1).put_var({
			"type": 'OnPlayerText',
			"data": {
				"text": text
			}
		})
		return true
	return false

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
