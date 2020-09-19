import { Servidor } from '../lib/Multiplayer'
import { EventEmitter } from 'events'

global.eventServer = new EventEmitter()

const server = new Servidor()

global.eventServer.on('sendClientMessage', (player, text, color) => {
  return server.sendClientMessage(player, text, color)
});

global.eventServer.on('sendClientMessageToAll', (text, color) => {
  return server.sendClientMessageToAll(text, color)
});

global.eventServer.on('showPlayerDialog', (player, dialogid, style, caption, info, button1, button2) => {
  return server.showPlayerDialog(player, dialogid, style, caption, info, button1, button2)
});

import PluginLoad from './plugins'
PluginLoad()