extends Control

onready var ChatLog = get_node("ChatLog")
onready var PreerList = get_node("PeerList")
onready var ChatTextBox = get_node("ChatTextBox")
onready var SeedButton = get_node("SendButton")
onready var Network = get_node("Network")

var playersList = [
	{'name': 'Reinan'},
	{'name': 'Gabriel'},
	{'name': 'Lucas'},
	{'name': 'Joel'},
]

func _ready():
	ChatTextBox.connect("text_entered", self, "_seed_message")
	SeedButton.connect("pressed", self, "_seed_message")
	#PreerList._update_list(playersList)
	pass # Replace with function body.
	
func _input(event):
	if event is InputEventKey:
		if event.pressed and event.scancode == KEY_ENTER:
			self._seed_message()

func _seed_message():
	if ChatTextBox.text.length() > 0:
		Network._send_message(ChatTextBox.text)
		ChatTextBox.text = ''
	pass
