extends Node

var username = 'Visitante'
var serve_ip = '127.0.0.1:8080'

func get_username() -> String:
	return username

func set_username(name: String) -> void:
	username = name

func get_serve_ip() -> String:
	return serve_ip

func set_serve_ip(ip: String) -> void:
	serve_ip = ip
