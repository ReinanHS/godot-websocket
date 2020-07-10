import Player from './Player'
export default class Slots{
  clients = new Array(10).fill(null)
  length = 0

  constructor(length = 10){
    this.clients = new Array(length).fill(null)
  }

  /**
   * Função para pegar o tamanho da lista de clientes
   * @return {number} - Tamanho da lista de clientes 
   */
  getLength(){
    return this.length
  }

  /**
   * Função para Verificar se o servidor está lotado
   * @return {boolean} - Verifica se o servidor está lotado
   */
  isFull(){
    return this.getLength() >= this.clients.length
  }
  
  /**
   * Função para adicionar um novo player
   * @param  {Player} player
   * @return {number} - Retorna o ID ou um número negativo se não for encontrado
   */
  push(player){
    
    return this.search((index) => {
      player.setId(index)

      this.clients[index] = player
      this.length++

      return index
    })()
  }

  /**
   * Função para remover um player
   * @param  {Player} player
   * @return {number} - Retorna o ID ou um número negativo se não for encontrado
   */
  remove(player){
    return this.search((index) => {
      this.clients[index] = null
      this.length--

      return 1
    }, player)()
  }

  /**
   * Função para editar um player
   * @param  {Player} player
   */
  update(func, player){
    this.clients[player.getId()] = func(this.clients[player.getId()])
  }

  
  /**
   * Função para fazer uma busca pelo servidor
   * @param  {Function} func
   * @param  {Object} object
   */
  search(func, object = null){
    const clients = this.clients
    return function findEmpty(index = 0){
      if(index >= clients.length) return -1
      else if( clients[index] === object ){
        return func(index, object)
      }else if(clients[ (clients.length -1 ) - index ] === object){
        return func((clients.length -1 ) - index, object)
      }else return findEmpty(index + 1)
    }
  }

  
  /**
   * Função para mapear a lista de jogadores
   * @param  {Function} func
   */
  map(func){
    const clients = this.clients
    function loop(index = 0){
      if(index >= clients.length / 2) return -1
      else{
        const reverse = (clients.length -1 ) - index

        if (clients[index] != null) func(clients[index], index)
        if (clients[reverse] != null && index != reverse) func(clients[reverse], reverse)
        
        return loop(index + 1)
      }
    }

    loop()
  }

  /**
   * Função para saber se um usuário está online
   * @param  {String} username - nome do usuário
   * @return {boolean}
   */
  isPlayerOnline(username){
    const clients = this.clients

    function loop(index = 0){
      if(index >= clients.length / 2) return -1
      else{
        const reverse = (clients.length -1 ) - index

        if ( index == reverse ){
          if (clients[index] != null ){
            return clients[index].getUsername() == username  
          }else return false
        }
        else if ( clients[index] != null ){
          return clients[index].getUsername() == username
        }
        else if ( clients[reverse] != null ){
          return clients[reverse].getUsername() == username
        }
        else return loop(index + 1)
      }
    }

    return this.getLength() > 0 ? loop() : false
  }
}