extends RichTextLabel

var grupos = [
	{'name': 'Global', 'color': 'eeeeee'},
	{'name': 'Error', 'color': 'ff0000'},
	{'name': 'Warning', 'color': 'dd7631'},
	{'name': 'Success', 'color': '708160'},
]

func _append_log(text:String, grupo:int = 0):
		
	self.push_color(Color(grupos[grupo]['color']))
	self.add_text('\n'+text)
	self.pop()

	pass # Replace with function body.
