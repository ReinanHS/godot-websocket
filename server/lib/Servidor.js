import Bootstrap from './Bootstrap'
import WebSocket from 'ws'
import localIpV4Address from 'local-ipv4-address'
import Slots from './Slots'
import Player from './Player'
import gdCom from '@gd-com/utils'
export default class Servidor extends Bootstrap{

  /**
  * @type {{wss: WebSocket, whitelist: Array}}
  */
  static = {
    wss: null,
    whitelist: [],
  }

  slots = new Slots()

  constructor(){
    super()
    this.slots = new Slots( 20 )
    localIpV4Address()
      .then((ipAddress) => this.onInit(ipAddress))
      .catch(() => this.onInit());
  }

  onInit = (ip) => {
    this.showLog(`> Criando o servidor WebSocket em 127.0.0.1:${this.config.server_port | process.env.PORT}`, true)
    this.showLog(`> Conexões pela rede local: ${ip != undefined ? ip : 'desabilitado'}:${this.config.server_port | process.env.PORT}`, true)
    
    this.static.wss = new WebSocket.Server({ 
      port: this.config.server_port | process.env.PORT 
    })

    this.showLog(`> Carregando a whitelist`)
    this.static.whitelist = this.getWhitelist()

    this.showLog(`> Iniciando o servidor`, true)
    this.onServerInit()

    global.eventServer.emit('onServerInit');
  }

  onServerInit = () => {
    this.static.wss.on('connection', (ws, req) => {
      
      this.showLog(`> Nova tentativa de conexão ${req.socket.remoteAddress}`)

      ws.on('message', (message) => {
        let recieveBuff = Buffer.from(message)
        let recieve = gdCom.getVar(recieveBuff)
        
        try {
          const player = this.slots.clients[ws.id]
          
          if(recieve.value.type == 'OnPlayerAuth'){
            return this.onAuth(ws, recieve.value.data)
          }else if(recieve.value.type == 'OnPlayerText'){
            const message = recieve.value.data.text

            if(message[0] == '/'){
              return this.onPlayerCommandText(player, message.split(' '))
            }

            return this.onPlayerText(player, message)
          }else if(recieve.value.type == 'onPlayerUpdate'){
            return this.onPlayerUpdate(player, recieve.value.data)
          }else if(recieve.value.type == 'onDialogResponse'){
            const response = recieve.value.data
            return this.onDialogResponse(player, response.dialogid, response.response, response.listitem, response.inputtext)
          }

        } catch (error) {
          this.showLog(`> Erro na chamada da função ${recieve.value.type}`)          
          this.showLog(error.message)          
        }

      })

      ws.on('close', e => {
        if(ws.id != undefined){
          const player = this.slots.clients[ws.id]
          this.showLog(`> ${player.getUsername()} saiu do jogo!`, true)
        
          this.slots.remove(player)
          this.onPlayerDisconnect(player, e)

          this.slots.map((client) => {
            if(client.getId() != player.getId() && client.getConnection().readyState === WebSocket.OPEN){
              try {
                client.getConnection().send(JSON.stringify({
                  type: 'removePlayer',
                  id: player.getId(),
                }))
              
              } catch (error) {
                return this.showLog(`> Ocorreu um erro ao deletar o jogador: ${error.message}`, true)
              }
            }
          })
        }
      })
    })   
  }

  onAuth = (ws, data) => {
    const player = new Player(ws, data.username)

    if(this.slots.isFull()){
      return this.kick(player, 'Desculpe. O servidor está cheio, tente novamente mais tarde!')
    }else if(this.config.white_list == true && this.static.whitelist.find(username => username == data.username) == undefined){
      return this.kick(player, 'Desculpe. Você não está na Whitelist!')
    }else if(this.slots.isPlayerOnline(data.username)){
      return this.kick(player, `Desculpe. O nome ${data.username} já está em uso!`)
    }else{

      this.slots.push(player)
      this.showLog(`> ${data.username} entrou no jogo!`, true)

      ws.id = player.getId()

      try{
        this.onPlayerConnect(player)
        this.enableGameStart(player)
      }catch(error){
        console.error(error)
      }

      return 1
    }
  }
  /**
   * Kick um jogador do servidor. Eles terão que sair do servidor e se reconectar, se quiserem continuar jogando.
   * @param  {Player} player 
   */
  kick = (player, message = 'Você foi expulso do servidor!') => {
    const ws = player.getConnection()
    try {
      ws.send(JSON.stringify({
        type: 'kick',
        message: message
      }))
    
    } catch (error) {
      return this.showLog(`Ocorreu um erro ao enviar a messagem: ${error.message}`, true)
    }

    ws.close()
    this.slots.remove(player)
  }

  /**
   * Esta função envia uma mensagem para um jogador específico com a cor escolhida no chat.
   * @param  {Player} player O player para o qual a mensagem vai ser exibida.
   * @param  {String} message O texto que será exibido (máximo de 144 caracteres).
   * @param  {Object} color A cor da mensagem (formato {0,0,0} RPG).
   */
  sendClientMessage = (player, message, color = '#eeeeee') => {
    const ws = player.getConnection()
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({
          type: 'message',
          color: color,
          message: message.slice(0, 144)
        }))
      
      } catch (error) {
        return this.showLog(`Ocorreu um erro ao enviar a messagem: ${error.message}`, true)
      }
    }
  }

  /**
   * Exibe uma mensagem no chat para todos os jogadores. Este é um equivalente para vários jogadores do SendClientMessage.
   * @param  {String} message O texto que será exibido (máximo de 144 caracteres).
   * @param  {Object} color A cor da mensagem (formato {0,0,0} RPG).
   */
  sendClientMessageToAll = (message, color = '#eeeeee') => {
    this.slots.map(player => {
      return this.sendClientMessage(player, message, color)
    })
  }

  /**
   * Essa função é chamada quando um player se conectar com o servidor
   * @param  {Player} player
   */
  onPlayerConnect = (player) => {
    this.sendClientMessageToAll(`${player.getUsername()} entrou no jogo!`, '#fcbf1e')
    return global.eventServer.emit('onPlayerConnect', player);
  }

  /**
   * Essa função é chamada quando um player se desconectar com o servidor
   * @param  {Player} player
   * @param  {string} reason
   */
  onPlayerDisconnect = (player, reason) => {
    this.sendClientMessageToAll(`${player.getUsername()} saiu do jogo!`, '#fcbf1e')
    return global.eventServer.emit('onPlayerDisconnect', player, reason);
  }

  /**
   * Essa função é chamada quando um player se movimenta
   * @param  {Player} player
   * @param  {Object} data
   */
  onPlayerUpdate = (player, result) => {
    player.setPos(result.position.x, result.position.y, 0)
    this.slots.clients[player.getId()] = player

    const data = {
      type: 'updatePost',
      position: player.getPos(),
      animation: result.animation,
      flip: result.flip,
      id: player.getId(),
    }

    global.eventServer.emit('onPlayerUpdate', player, data);

    this.slots.map((client) => {
      if(client.getId() != player.getId() && client.getConnection().readyState === WebSocket.OPEN){
        try {
          client.getConnection().send(JSON.stringify(data))
        } catch (error) {
          return this.showLog(`> Ocorreu um erro ao atualizar a posição do jogador: ${error.message}`, true)
        }
      }
    })
  }

  /**
   * Esse retorno de chamada é chamado quando um jogador insere uma mensagem na janela de bate-papo do cliente.
   * @param  {Player} player O jogador que digitou uma messagem.
   * @param  {String} text Mensagem enviada pelo player
   */
  onPlayerText = (player, text) => {
    global.eventServer.emit('onPlayerText', player, text);
    return this.sendClientMessageToAll(`${player.getUsername()}: ${text}`)
  }

  /**
   * Esse retorno de chamada é chamado quando um jogador insere um comando na janela de bate-papo do cliente. Comandos são tudo que começam com uma barra, por exemplo /help.
   * @param  {Player} player O jogador que inseriu um comando. 
   * @param  {Array<String>} cmdtext O comando que foi inserido (incluindo a barra).
   */
  onPlayerCommandText = (player, cmdtext = []) => {

    global.eventServer.emit('onPlayerCommandText', player, cmdtext);

    if(cmdtext[0] == '/help'){
      return this.sendClientMessage(player,`> Comando de ajuda`)
    }
  }

  /**
   * Função para criar um player e os outros jogadores.
   * @param  {Player} player O jogador. 
   */
  enableGameStart = (player) => {
    const skin = Math.floor(Math.random() * (4 - 1 + 1)) + 1

    this.spawnPlayer(player, {x: 0, y: 0}, skin, true)

    global.eventServer.emit('onClientGameTypeStart', player);

    if(this.slots.length > 1){
      try {
        this.slots.map((client) => {

          if(client.getId() != player.getId()){
            const skinClient = Math.floor(Math.random() * (4 - 1 + 1)) + 1
            this.spawnPlayer(
              player, 
              {x: client.getPos().x, y: client.getPos().y}, 
              skinClient,
              false,
              {id: client.getId(), username: client.getUsername()}
            )
          
            this.spawnPlayer(
              client, 
              {x: player.getPos().x, y: player.getPos().y}, 
              skin,
              false,
              {id: player.getId(), username: player.getUsername()}
            )
          }
        })
      } catch (error) {
        this.showLog(`> Ocorreu um erro na criação dos personagens`)
      }
    }
  }

  /**
   * Função para criar o player
   * @param  {Player} player jogador 
   * @param  {Object} position posição
   * @param  {Number} skin skin do player
   * @param  {Boolean} active Se o jogador é controlavel
   */
  spawnPlayer = (player, position, skin = 1, active = false, data = null) => {
    const ws = player.getConnection()
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({
          type: 'spawnPlayer',
          id: (data != null ? data.id : player.getId()),
          skin: skin,
          active: active,
          username: (data != null ? data.username : player.getUsername()),
          position: {
            x: position.x | 0,
            y: position.y | 0
          }
        }))
      
      } catch (error) {
        return this.showLog(`Ocorreu um erro ao criar o player: ${error.message}`, true)
      }
    }
  }

  /**
   * Mostra ao jogador uma caixa de diálogo síncrona (apenas uma de cada vez).
   * @param  {Player} player jogador 
   * @param  {Number} dialogid Um ID para atribuir a esta caixa de diálogo, para que as respostas possam ser processadas.
   * @param  {String} style O estilo da dialog.
   * @param  {String} caption O título na parte superior da caixa de diálogo. O comprimento da legenda não pode exceder mais de 64 caracteres antes de começar a ser cortada.
   * @param  {String} info O texto a ser exibido na caixa de diálogo principal.
   * @param  {String} button1 O texto do botão esquerdo.
   * @param  {String} button2 O texto do botão direito.
   */
  showPlayerDialog = (player, dialogid, style, caption, info, button1 = '', button2 = '') => {
    const ws = player.getConnection()
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({
          type: 'showPlayerDialog',
          dialogid: dialogid,
          style: style,
          caption: caption,
          info: info,
          button1: button1,
          button2: button2,
        }))
      
      } catch (error) {
        return this.showLog(`Ocorreu um erro ao exibir a caixa de diálogo : ${error.message}`, true)
      }
    }
  }

  /**
   * Este retorno de chamada é chamado quando um jogador responde a uma caixa de diálogo exibida usando ShowPlayerDialog clicando em um botão.
   * @param  {Player} player jogador 
   * @param  {Number} dialogid O ID do diálogo ao qual o jogador respondeu, atribuído em ShowPlayerDialog.
   * @param  {Number} response 1 para o botão esquerdo e 0 para o botão direito (se apenas um botão for mostrado, sempre 1).
   * @param  {Number} listitem O ID do item da lista selecionado pelo jogador (começa em 0)
   * @param  {String} inputtext O texto inserido na caixa de entrada pelo player ou o texto do item da lista selecionado.
   */
  onDialogResponse = (player, dialogid, response, listitem = 0, inputtext = '') => {
    global.eventServer.emit('onDialogResponse', player, dialogid, response, listitem, inputtext);
  }
}