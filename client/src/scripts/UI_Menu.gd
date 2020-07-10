extends Control

onready var input_username = get_node("VBoxContainer/input_username")
onready var input_ip = get_node("VBoxContainer/input_ip")
onready var text_log = get_node("text_log")
onready var sub_title = get_node("sub_title")
onready var server_list = get_node("server_list")

# Called when the node enters the scene tree for the first time.
func _ready():
	input_username.text = self.getUsername()
	pass # Replace with function body.

func getUsername():
	if(OS.get_environment('USERNAME') != ''): 
		return OS.get_environment('USERNAME')
	elif (OS.get_environment('USERDOMAIN') != ''):
		return OS.get_environment('USERDOMAIN')
	else: 
		return ''
		
func validation():
	if input_username.text.length() < 8:
		return OS.alert('O username que você digitou é muito pequeno', 'Validação erro')
	elif input_ip.text.length() < 10:
		return OS.alert('O endereço IP é inválido', 'Validação erro')
	elif input_ip.text.find(':') == -1:
		return OS.alert('O endereço IP é inválido', 'Validação erro')
	elif input_ip.text.find('.') == -1:
		return OS.alert('O endereço IP é inválido', 'Validação erro')
	else:
		Global.set_serve_ip(input_ip.text)
		Global.set_username(input_username.text)
		return get_tree().change_scene("res://src/scenes/Game.tscn")
# Called every frame. 'delta' is the elapsed time since the previous frame.
#func _process(delta):
#	pass


func _on_Button_pressed():
	self.validation()
	pass # Replace with function body.
