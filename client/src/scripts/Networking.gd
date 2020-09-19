extends Node2D

onready var chat = get_node("CanvasLayer/Chat")
onready var dialog = get_node("CanvasLayer/Dialog")
var ws = WebSocketClient.new()

const PlayerChild = preload("res://src/scenes/Player.tscn")

func _ready():
	self.connection()
	pass # Replace with function body.
func connection():
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

	ws.connect_to_url(url)
	
	chat.append_text("[Game] Conectando ao servidor %s" %url)
	chat.append_text("[Game] Espere alguns segundos até estabelecermos uma conexão...")

func _peer_connected(id):
	chat.append_text("[Game] O player de Id %s acabou de se conectar" % id)

func _client_connected(protocol):
	chat.append_text("[Game] Conexão realizada com sucesso! - %s" %protocol)

func _client_disconnected(clean=true):
	chat.append_text("[Game] Um player saio da sala - %s" %clean)
	
func _connection_established(protocol):
	chat.append_text("[Game] Conexão realizada com sucesso! - %s" %protocol)	
	ws.get_peer(1).put_var({
		"type": 'OnPlayerAuth',
		"data": {
			"username": Global.get_username()
		}
	})
	
func _connection_closed():
	chat.append_text("[Game] Você foi desconectado do Servidor ")	

func _connection_error():
	chat.append_text("[Game] Não foi possível estabelecer uma conexão com o servidor")
func _client_close_request(code, reason):
	chat.append_text("Conexão fechada: %d, por: %s" % [code, reason])
	
func _client_received():
	var packet = ws.get_peer(1).get_packet()

	var resultJSON = JSON.parse(packet.get_string_from_utf8())
	
	print(resultJSON.result.type)
	
	if resultJSON.result.type == 'message':
		return chat.append_text(resultJSON.result.message, resultJSON.result.color)
	elif resultJSON.result.type == 'showPlayerDialog':
		dialog._hide_dialog()
		
		dialog.dialogid = resultJSON.result.dialogid
		dialog.style = resultJSON.result.style
		
		dialog.button1.text = resultJSON.result.button1
		dialog.button2.text = resultJSON.result.button2
		
		dialog._set_caption(resultJSON.result.caption)
		dialog._set_info(resultJSON.result.info)
		
		dialog._show_dialog()
	elif resultJSON.result.type == 'spawnPlayer':
		
		var client = PlayerChild.instance()
		client.peerActive = resultJSON.result.active
		client.peerid = resultJSON.result.id
		client.skinID = resultJSON.result.skin
		client.position = Vector2(resultJSON.result.position.x, resultJSON.result.position.y)
		client.set_name("Player_%d" % client.peerid)
		client.connect("updatePlayer", self, "_on_Player_updatePlayer")
		$SpawnPlayer.add_child(client)
	
	elif resultJSON.result.type == 'updatePost':		
		var nameClient = "Player_%d" % resultJSON.result.id
		
		for client in get_node("SpawnPlayer").get_children():
			if client.get_name() == nameClient:
				client.position = Vector2(resultJSON.result.position.x, resultJSON.result.position.y)
				client.client_play(resultJSON.result.animation, resultJSON.result.flip)
	elif resultJSON.result.type == 'removePlayer':
		var nameClient = "Player_%d" % resultJSON.result.id
		
		for client in get_node("SpawnPlayer").get_children():
			if client.get_name() == nameClient:
				client.queue_free()
	pass
	
func _process(delta):
	if ws.get_connection_status() == ws.CONNECTION_CONNECTING || ws.get_connection_status() == ws.CONNECTION_CONNECTED:
		ws.poll()
	pass

func _on_Chat_seedMessage(message):
	if ws.get_peer(1).is_connected_to_host():
		ws.get_peer(1).put_var({
			"type": 'OnPlayerText',
			"data": {
				"text": message
			}
		})
	pass


func _on_Player_updatePlayer(position, current_animation, flip):
	if ws.get_peer(1).is_connected_to_host():
		ws.get_peer(1).put_var({
			"type": 'onPlayerUpdate',
			"data": {
				"position": position,
				"animation": current_animation,
				"flip": flip
			}
		})
	pass


func _on_Dialog_dialogResponse(dialogid, response, listitem, inputtext):
	if ws.get_peer(1).is_connected_to_host():
		ws.get_peer(1).put_var({
			"type": 'onDialogResponse',
			"data": {
				"dialogid": dialogid,
				"response": response,
				"listitem": listitem,
				"inputtext": inputtext,
			}
		})
	pass
