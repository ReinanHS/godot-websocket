export default () => {

  const event = global.eventServer
  const DIALOG_MENU = 1
  
  /**
   * Este Evento é chamado quando o Servidor é iniciado.
   */
  event.on('onServerInit', () => {
    console.log('> Example Plugin successfully loaded')
  })

  /**
   * Este Evento é chamado quando um jogador conecta ao servidor.
   * @param {Player} player O jogador que conectou.
   */
  event.on('onPlayerConnect', (player) => {
    return event.emit('sendClientMessage', player, 'Esse servidor está utilizando o plugin X')
  });

  /**
   * Este Evento é chamado quando um jogador desconecta do servidor.
   * @param {Player} player jogador que desconectou.
   * @param {String} reason O motivo por desconectar.
   */
  event.on('onPlayerDisconnect', (player) => {
    // Lógica para fazer o tratamento do evento
  })

  /**
   * Este Evento é chamado quando um player envia mensagem ao chat.
   * @param {Player} player Jogador que enviou a mensagem.
   * @param {String} text   O texto digitado pelo jogador.
   */
  event.on('onPlayerText', (player, text) => {
    // Lógica para fazer o tratamento do evento
  })

  /**
   * Este Evento é chamado quando um jogador digita um comando no chat, Ex.: /ajuda.
   * @param {Player} player Jogador que digitou o comando
   * @param {Array<String>} cmd O comando que sera executado (incluindo a barra).
   */
  event.on('onPlayerCommandText', (player, cmd) => {
    // Lógica para fazer o tratamento do evento
    if(cmd[0] == '/menu'){
      return event.emit('showPlayerDialog', player, DIALOG_MENU, 'box', 'Menu principal', 'Como você está hoje?', 'Estou bem', 'Estou mal')
    }
  })

  /**
   * Este retorno de chamada é chamado quando um jogador responde a uma caixa de diálogo mostrada usando ShowPlayerDialog
   * @param {Player} player Jogador que digitou o comando
   * @param {Number} dialogid O ID do diálogo ao qual o jogador respondeu, atribuído em showPlayerDialog.
   * @param {Number} response 1 para o botão esquerdo e 0 para o botão direito
   * @param {number} listitem O ID do item da lista selecionado pelo jogador
   * @param {String} inputtext O texto inserido na caixa de entrada pelo player ou o texto do item da lista selecionado.
   */
  event.on('onDialogResponse', (player, dialogid, response, listitem, inputtext) => {
    if(dialogid == DIALOG_MENU){
      const respostas = [
        'bem',
        'mal',
      ]
      return event.emit('sendClientMessage', player, `Sua resposta foi ${respostas[response]}`)
    }
  })

  /**
   * Este Evento é chamado quando o game do cliente é iniciado.
   * @param {Player} player Jogador
   */
  event.on('onClientGameTypeStart', (player) => {
    // Lógica para fazer o tratamento do evento
  })

  /**
   * Este Evento é chamado a cada frame.
   * @param {Player} player Jogador
   */
  event.on('onPlayerUpdate', (player) => {
    // Lógica para fazer o tratamento do evento
  })
}