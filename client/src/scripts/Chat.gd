extends Control

onready var input_text = get_node("Panel/input_text")
onready var text_log = get_node("Panel/log") 

signal seedMessage

func _ready():
	pass # Replace with function body.

func append_text(text:String, color:String = "#eeeeee"):
	text_log.push_color(Color(color))
	text_log.add_text('\n'+text)
	text_log.pop()

func _input(event):
	if event is InputEventKey:
		if event.pressed and event.scancode == KEY_ENTER:
			if input_text.text.length() > 0:
				self._on_btn_submit_pressed()

func _on_btn_submit_pressed():
	var message = input_text.text
	input_text.text = ''
	emit_signal("seedMessage", message)
