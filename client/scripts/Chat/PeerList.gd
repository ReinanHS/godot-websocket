extends ItemList

func _update_list(list):
	self.clear()
	for i in list:
		self.add_item(i.name)
	pass
