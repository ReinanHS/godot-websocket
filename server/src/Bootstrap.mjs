import fs from 'fs'
import AppRoot from 'app-root-path'
import ENV from 'dotenv'
/** Classe que tem funções essenciais */
export default class Bootstrap {

  /**
   * Carregando as configurações do arquivo .ENV
   */
  constructor(){
    this.config = this.getConfig()
  }

  /**
   * Função para criar um arquivo
   * @param {String} filename - Nome do arquivo.
   * @param {String} content - Conteúdo do arquivo.
   * @return {fs} Resultado do arquivo que foi criado.
   */
  saveFile(filename, content){
    const contentString = content
    return fs.writeFileSync(`${this.getPath()}/${filename}`, contentString)
  }

  /**
   * Função para pegar o conteúdo do arquivo
   * @param {String} filename - Nome do arquivo.
   * @return {String} Conteúdo do arquivo.
   */
  loadFile(filename){
    try{
      const contentString = fs.readFileSync(`${this.getPath()}/${filename}`, 'utf-8')
      return contentString
    }catch(e){
      if(filename != 'log.txt'){
        console.log(`[LOG] - O Arquivo ${filename} não foi encontrado.`)
      }
      return null
    }
  }

  /**
   * Função para criar o log do servidor
   * @param {String} log - Informações que serão salvas no log.
   */
  writeLog(log){
    const data = new Date()
    const dataDoLog = `${data.getSeconds()}:${data.getMinutes()}:${data.getHours()}`
    const getLog = this.loadFile('log.txt')
    
    const logContent = getLog != null ? (getLog + `\n[${dataDoLog}] - ${log}`) : `[${dataDoLog}] - ${log}`

    this.saveFile('log.txt', logContent)
  }

  /**
   * Função para mostrar na tela o log
   * @return {console} Informações do log.
   */
  showLog(log, is_debug = false){
    this.writeLog(log)
    if(this.getConfig().debug === 'true' || is_debug === true){
      return console.log(log)
    }
  }

  /**
   * Função para pegar as configurações do arquivo .ENV 
   * @return {ENV} Informações do arquivo .ENV
   */
  getConfig() {
    if(ENV.config({ path: `${this.getPath()}/.env` }).error){
      console.error('[INFO SYSTEM] O arquivo .ENV não existe, ele é de extrema importância para o funcionamento desse programa.');
      console.log(`[INFO SYSTEM] O programa foi finalizado por falta de componentes fundamentais`)
      process.exit(0)
    }else return ENV.config({ path: `${this.getPath()}/.env` }).parsed
  }

  /**
   * Função para pegar o diretório do projeto 
   * @return {String} Diretório do projeto
   */
  getPath() {
    return AppRoot.path;
  }
}