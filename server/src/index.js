const WebSocket = require('ws')
const gdCom = require('@gd-com/utils')

const wss = new WebSocket.Server({ port: 8080 })
let CLIENTS = []

wss.getUniqueID = function () {
  function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  }
  return s4()
}

console.log('O servidor foi inicializado em:')
console.log('\nws://localhost:8080 \n')

wss.on('connection', ws => {
  ws.id = wss.getUniqueID()

  //console.log('connected '+ws.id)

  ws.on('message', (message) => {
    let recieveBuff = Buffer.from(message)
    let recieve = gdCom.getVar(recieveBuff)

    if(recieve.value.type != undefined && recieve.value.type != null){
      servidor[recieve.value.type](ws, recieve.value)
    }
  })

  ws.on('close', e => {
    console.log(`${ws.id} foi desconectado do servidor`)
    CLIENTS = CLIENTS.find(element => element.id != ws.id )
    if ( CLIENTS == undefined ){
      CLIENTS = []
    }
  })
})

const servidor = {
  _connection_established: (player, result) => {
    player.username = result.data.username
    CLIENTS.push(player)
  },
  send_client_message: (player, message) => {
    player.send({
      type: 'log',
      message: message
    })
  }
}

function sendAll (message) {
  for (var i=0; i<CLIENTS.length; i++) {
      CLIENTS[i].send(`Message ${CLIENTS[i].id}: ${message}`);
  }
}