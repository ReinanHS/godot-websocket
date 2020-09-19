extends Control

onready var PANEL = get_node("Panel")
onready var Caption = get_node("Panel/Caption/Label")
onready var Info = get_node("Panel/Label")
onready var button1 = get_node("Panel/Footer/Button")
onready var button2 = get_node("Panel/Footer/Button2")

var move_panel = false

var dialogid = 0
var style = 'DIALOG_STYLE_MSGBOX'
var listitem = 0
var inputtext = ''

signal dialogResponse

# Called when the node enters the scene tree for the first time.
func _ready():
	self._hide_dialog()
	pass # Replace with function body.

func _show_dialog():
	self.visible = true
	PANEL.visible = true

func _hide_dialog():
	self.visible = false
	PANEL.visible = false

func _input(event):
	# Mouse in viewport coordinates.
	if event is InputEventMouseMotion:
		if move_panel and event.pressure > 0:
			var position = Vector2(event.position)
			position.x -= 540
			position.y -= 150
			
			PANEL.set_position(position)
	  

func _on_Caption_mouse_entered():
	move_panel = true
	pass # Replace with function body.

func _on_Caption_mouse_exited():
	move_panel = false
	pass # Replace with function body.

func _set_caption(title:String):
	Caption.text = title
	
func _set_info(info:String):
	Info.text = info

func _on_Button_pressed():
	emit_signal("dialogResponse", self.dialogid, 0, self.listitem, self.inputtext)
	self._hide_dialog()
	pass # Replace with function body.


func _on_Button2_pressed():
	emit_signal("dialogResponse", self.dialogid, 1, self.listitem, self.inputtext)
	self._hide_dialog()
	pass # Replace with function body.
