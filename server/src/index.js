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

import PluginLoad from './plugins'
PluginLoad()