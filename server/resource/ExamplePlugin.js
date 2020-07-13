export default () => {

  const event = global.eventServer
  
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