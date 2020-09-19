# Godot Websocket

Este é um jogo de plataforma online feito na Godot 3.

## Como instalar

Para fazer a instalação deste projeto é necessário ter:

- Git
- Nodejs

O primeiro passo é baixar esse repositório para o seu computador
```git
git clone https://github.com/reinanhs/godot-websocket.git
```

Agora vamos baixar as dependências e iniciar o projeto
```sh
cd godot-websocket/server
npm install
npm start
```

Agora abra o projeto client na sua godot

## Imagens

![Godot webbsocket](https://i.imgur.com/4pdBQ4d.jpg)
![Godot webbsocket javascript](https://i.imgur.com/7qp5zOl.jpg)

## Como criar um plugin?

Para criar um plugin para o servidor, você precisará criar um arquivo javascript no diretório `server/resource`. O arquivo deve seguir a seguinte estrutura:

```javascript
export default () => {
  const event = global.eventServer

  /*
  // É aqui que a lógica do plugin será colocada
  event.on('onServerInit', () => {
    console.log('> Example Plugin successfully loaded')
  })
  */
}
```

Depois de criar o arquivo, teremos que importar o arquivo em `src/plugins.js`:

```javascript
import ExamplePluginName from '../resource/ExamplePluginName'

export default () => {
  return {
    example: ExamplePluginName(),
  }
}
```

### onServerInit

**Descrição**: Este Evento é chamado quando o Servidor é iniciado. 

| Nome       | Parâmetros     |
|------------|----------------|
|onServerInit|Nenhum parâmetro|

**Exemplo**:

```javascript
/**
 * Este Evento é chamado quando o Servidor é iniciado.
 */
event.on('onServerInit', () => {
  console.log('> Example Plugin successfully loaded')
})
```

### onPlayerConnect

**Descrição**: Este Evento é chamado quando um jogador conecta ao servidor.

| Nome          | Parâmetros |
|---------------|------------|
|onPlayerConnect|player      |

**Exemplo**:

```javascript
/**
 * Este Evento é chamado quando um jogador conecta ao servidor.
 * @param {Player} player O jogador que conectou.
 */
event.on('onPlayerConnect', (player) => {
  return event.emit('sendClientMessage', player, 'Esse servidor está utilizando o plugin X')
});
```

### onPlayerDisconnect

**Descrição**: Este Evento é chamado quando um jogador desconecta do servidor.

| Nome             | Parâmetros |
|------------------|------------|
|onPlayerDisconnect|player      |

**Exemplo**:

```javascript
/**
 * Este Evento é chamado quando um jogador desconecta do servidor.
 * @param {Player} player jogador que desconectou.
 * @param {String} reason O motivo por desconectar.
 */
event.on('onPlayerDisconnect', (player) => {
  // Lógica para fazer o tratamento do evento
})
```

### onPlayerText

**Descrição**: Este Evento é chamado quando um player envia mensagem ao chat.

| Nome       | Parâmetros | Parâmetros |
|------------|------------|------------|
|onPlayerText|player      |text        |

**Exemplo**:

```javascript
/**
 * Este Evento é chamado quando um player envia mensagem ao chat.
 * @param {Player} player Jogador que enviou a mensagem.
 * @param {String} text   O texto digitado pelo jogador.
 */
event.on('onPlayerText', (player, text) => {
  // Lógica para fazer o tratamento do evento
})
```

### onPlayerCommandText

**Descrição**: Este Evento é chamado quando um jogador digita um comando no chat, Ex.: /ajuda.

| Nome              | Parâmetros | Parâmetros |
|-------------------|------------|------------|
|onPlayerCommandText|player      |cmd[]       |

**Exemplo**:

```javascript
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
```

### showPlayerDialog

**Descrição**: Mostra ao jogador uma caixa de diálogo síncrona (apenas uma de cada vez).

| Nome           | Parâmetros | Parâmetros |Parâmetros |Parâmetros |Parâmetros |Parâmetros      |
|----------------|------------|------------|-----------|-----------|-----------|----------------|
|showPlayerDialog|player      |dialogid    |style      | caption   |info       |button1, button1|

**Exemplo**:

```javascript
/**
 * Mostra ao jogador uma caixa de diálogo síncrona (apenas uma de cada vez).
 * @param  {Player} player jogador 
 * @param  {Number} dialogid Um ID para atribuir a esta caixa de diálogo, para que as respostas possam ser processadas.
 * @param  {String} style O estilo da dialog.
 * @param  {String} caption O título na parte superior da caixa de diálogo.
 * @param  {String} info O texto a ser exibido na caixa de diálogo principal.
 * @param  {String} button1 O texto do botão esquerdo.
 * @param  {String} button2 O texto do botão direito.
 */
event.emit('showPlayerDialog', player, 1, 'box', 'Header', 'Hello', 'Ok', 'Close')
```

Para ver todos os eventos acesse a documentação