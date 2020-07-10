extends KinematicBody2D

# Movimentação
const UP = Vector2(0,-1)
export(float) var SPEED = 20
export(float) var GRAVITY = 20
export(float) var JUMP_FORCE = 300

var positionLast = Vector2(0,0)
var movement = Vector2()
# Multiplayer
export(bool) var peerActive = false
export(int) var peerid = -1
export(int) var skinID = 1

signal updatePlayer(position, current_animation)

func _ready():
	if peerActive == true:
		$Camera2D.current = true

func _physics_process(delta):
	if peerActive == true:
		self._on_moviment(delta)
	pass
func _update_pos(pos):
	self.position = Vector2(pos.x, pos.y)
func _on_moviment(delta):
	movement.y += GRAVITY * delta * 100
	
	if Input.is_action_pressed("ui_left"):
		movement.x = (SPEED * delta * 800) * -1
		self.play_animation("running")
		$Sprite.flip_h = true
	elif Input.is_action_pressed("ui_right"):
		movement.x = (SPEED * delta * 800)
		self.play_animation("running")
		$Sprite.flip_h = false 
	else:
		movement.x = 0
		self.play_animation("idle")
		
	if is_on_floor():
		if Input.is_action_pressed("ui_up"):
			movement.y = (JUMP_FORCE * delta * 200) * -1
	else:
		self.play_animation("jump")
		
	movement = move_and_slide(movement, UP)
	
	#if positionLast.x != int(self.position.x) or positionLast.y != int(self.position.y):
		#positionLast = Vector2(int(self.position.x), int(self.position.y))
		#emit_signal("updatePlayer", self.position, $Sprite.animation, $Sprite.flip_h)
	emit_signal("updatePlayer", self.position, $Sprite.animation, $Sprite.flip_h)
	
func play_animation(name):
	var animation = "%s_%s"
	$Sprite.play(animation % [name, skinID])
	
func client_play(animation, flip):
	$Sprite.play(animation)
	$Sprite.flip_h = flip
