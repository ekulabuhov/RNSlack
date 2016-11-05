export default class Datastore {
  constructor(token) {
    this.token = token;
  }

  getUrl(command, channelId, botId) {
    return `https://slack.com/api/${command}?token=${this.token}${channelId ? '&channel=' + channelId : ''}${botId ? '&bot=' + botId : ''}&pretty=1`;
  }

  getChannels() {
    return fetch(this.getUrl('channels.list')).then((response) =>
      response.json().then((data) => {
        return data.channels;
      })
    )
  }

  getUsers() {
    return fetch(this.getUrl('users.list')).then((response) =>
      response.json().then((data) => {
        return data.members;
      })
    )
  }

  getChannelHistory(channelId) {
    return fetch(this.getUrl('channels.history', channelId)).then((response) =>
      response.json().then((data) => {
        return data.messages;
      })
    )
  }

  getTeamInfo() {
    return fetch(this.getUrl('team.info')).then((response) =>
      response.json().then((data) => {
        return data.team;
      })
    )
  }

  getImList() {
    return fetch(this.getUrl('im.list')).then((response) =>
      response.json().then((data) => {
        return data.ims;
      })
    )
  }

  getImHistory(channelId) {
  	return fetch(this.getUrl('im.history', channelId)).then((response) =>
      response.json().then((data) => {
        return data.messages;
      })
    )
  }

  getBotInfo(id) {
  	console.log(this.getUrl('bot.info', null, id));
  	return fetch(this.getUrl('bots.info', null, id)).then((response) =>
      response.json().then((data) => {
        return data.bot;
      })
    )
  } 
}
