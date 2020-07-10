export default class Player{
  /**
  * @type {{id: numbler, connection: Object, username: string, health: number, pos: {x: number,y: number,z:number} }}
  */
  static = {
    id: -1,
    connection: null,
    username: '',
    health: 100,
    pos: {
      x: 0, y: 0, z: 0
    }
  }

  constructor(connection, username){
    this.static.connection = connection
    this.static.username = username
  }

  getConnection = () => this.static.connection
  setConnection = (ws) => { this.static.connection = ws }

  getId = () => this.static.id
  setId = (id) => { this.static.id = id }

  getUsername = () => this.static.username
  setUsername = (username) => { this.static.username = username }

  getHealth = () => this.static.health
  setHealth = (health) => { this.static.health = health }

  getPos = () => this.static.pos
  setPos = (pos) => { this.static.pos = pos }
  setPos = (x,y,z) => { this.static.pos = {x,y,z} }
}