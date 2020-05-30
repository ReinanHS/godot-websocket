extends Panel

onready var input_Name = get_node("Input_Name")
onready var input_IP = get_node("Input_IP")
onready var btn_join = get_node("Join_bnt")
onready var label_log = get_node("Label_log")

func _data_validation():
	if input_Name.text.length() <= 1:
		label_log.text = 'Nome de usuário inválido'
		return false
	elif input_IP.text.length() <= 4:
		label_log.text = 'IP do servidor inválido'
		return false
	else:
		label_log.text = ''
		return true
	pass

func _change_to_game():
	return get_tree().change_scene("res://scenes/Chat.tscn")
	pass

func _on_Join_bnt_pressed():
	if(_data_validation()):
		
		btn_join.text = 'Carregando'
		btn_join.disabled = true
		
		Global.set_serve_ip(input_IP.text)
		Global.set_username(input_Name.text)
		return _change_to_game()
	pass # Replace with function body.
