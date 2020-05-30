import Bootstrap from './Bootstrap'
import WebSocket from 'ws'
import gdCom from '@gd-com/utils'
let wss = null
let CLIENTS = []

/** Class do servidor com a lógica */
export default class Servidor extends Bootstrap {

  /**
   * Construtor responsável por iniciar o servidor
   */
  constructor(){
    super()
    this.startServer()
  }

  /**
   * Função para gerar um ID para o player.
   * @return {number} Número aleatório.
   */
  randomPlayerID(){
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  }

  /**
   * Função para iniciar o servidor
   */
  startServer(){
    wss = new WebSocket.Server({ port: this.config.server_port })
    this.OnGameModeInit()

    wss.on('connection', ws => {

      if ( CLIENTS.length >= this.config.max_players ) {
        this.showLog(`[SERVER] Novas conexões estão sendo bloqueadas porque o servidor atingiu o seu limite`)
        this.SendClientMessage(ws, 'O servidor está cheio, tente novamente mais tarde', 1)
        return ws.close()
      }

      this.showLog(`[SERVER] Uma nova tentativa de conexão IP: ${ws._socket.remoteAddress}`)

      ws.on('message', (message) => {
        let recieveBuff = Buffer.from(message)
        let recieve = gdCom.getVar(recieveBuff)

        try {
          return this[recieve.value.type](ws, recieve.value)
        } catch (error) {
          return this.SendClientMessage(ws, `Error: ${this.config.debug ? error : 'Call Function'}`, 1)          
        }

      })
    
      ws.on('close', e => {
        this.OnPlayerDisconnect(ws, e)
      })
    })    

  }

  /**
   * Essa função é chamada quando o servidor estiver sendo carregado
   */
  OnGameModeInit(){
    this.showLog(`Project is running at ws://${this.config.server_ip}:${this.config.server_port}/`, true)
    this.showLog('webpack output is served from', true)
  }

  /**
   * Essa função é chamada quando um player se conectar com o servidor
   * @param {player} player - Player
   * @param {object} result - Informações do Player
   */
  OnPlayerConnect(player, result){
    const username = result.data.username

    if(CLIENTS.find(players =>  players.username == username) != undefined){
      this.showLog(`[SERVER] O nome ${player.username} já está em uso`)
      this.SendClientMessage(player, "[SERVER] O nome de usuário já está em uso", 1)
      return player.close()
    }

    player.username = username
    CLIENTS.push(player)

    const message = `[SERVER] ${player.username} entrou no jogo` 
    this.showLog(message, true)
    this.SendClientScore()
    return this.SendClientMessageToAll(message)
  }

  /**
   * Essa função é chamada quando um player se desconectar com o servidor
   * @param {player} player - Player
   * @param {object} reason - Razão pela qual o jogador se descontou do servidor
   */
  OnPlayerDisconnect(player, reason){

    if(CLIENTS.length > 1){
      for(let i = CLIENTS.length-1; i--;){
        if(CLIENTS[i].id == player.id) {
          CLIENTS[i] = CLIENTS[CLIENTS.length-1]
          CLIENTS = CLIENTS.splice(0, CLIENTS.length-1)
          break
        }
      }
    }else CLIENTS = []

    const message = `[SERVER] ${player.username} foi desconectado do servidor` 
    this.showLog(message, true)
    this.SendClientMessageToAll(message)
    this.SendClientScore()
  } 

  /**
   * Essa função é responsavel por mandar mensagem para um player
   * @param {player} player - Player
   * @param {String} message - Messagem
   * @param {Number} color - Cor da messagem
   */
  SendClientMessage(player, message, color = 2){
    try {
      player.send(JSON.stringify({
        type: 'log',
        color: color,
        message: message
      }))
    
    } catch (error) {
      return this.showLog(`Ocorreu um erro ao enviar a messagem: ${error.message}`, true)
    }
  }

  /**
   * Essa função é responsavel por mandar mensagem para todos os players
   * @param {String} message - Messagem
   * @param {Number} color - Cor da messagem
   */
  SendClientMessageToAll(message, color = 2){
    CLIENTS.forEach(player => {
      this.SendClientMessage(player, message, color)
    })
  }

  /**
   * Essa função é chamada quando o Player digitou alguma coisa
   * @param {player} player - Player
   * @param {Object} result - Informações do que ele digitou
   */
  OnPlayerText(player, result){
    this.SendClientMessageToAll(`[${player.username}]: ${result.data.text}`)
  }

  /**
   * Essa função é responsável por mandar o score para os Playes
   */
  SendClientScore(){
    const score = CLIENTS.map(player => {
      return {name: player.username }
    })

    CLIENTS.forEach(player => {
      try {

        player.send(JSON.stringify({
          type: 'score',
          score: score
        }))
      
      } catch (error) {
        return this.showLog(`Ocorreu um erro ao enviar o score: ${error.message}`, true)
      }
    })
  }
}