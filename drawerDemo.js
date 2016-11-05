import React, { Component } from 'react';
import {
  Text,
  StatusBar,
  View,
  WebView,
  StyleSheet,
  Button,
  Alert,
  TouchableHighlight,
  ListView,
  Image,
  TextInput
} from 'react-native';
import Drawer from 'react-native-drawer'

class ClickableRow extends Component {
	render() {
		return (
			<TouchableHighlight onPress={this.props.onClick}>
	      <Text style={this.props.style}>#   {this.props.text}</Text>
	    </TouchableHighlight>
		)
	}
}

class DrawerContents extends Component {
	render() {
		return (
			<View style={{backgroundColor: '#533750', flex: 1, paddingTop:30, paddingLeft:16, paddingRight: 16}}>
				<Text style={{fontSize: 24, color: 'white', marginBottom: 16}}>Home</Text>

	      <ListView
          dataSource={this.props.drawerData}
          enableEmptySections={true}
          renderRow={(rowData) => {
          	if (rowData.type !== 'label') {
	          	return <ClickableRow text={rowData.text} style={{color:'#9b8699', margin: 12}} onClick={() => this.props.onItemSelected(rowData)}/>
	          } else {
	          	return <Text style={{color:'#9b8699'}}>{rowData.text}</Text>
	          }
          }}
        />
      </View>
		)
	}
}

class ChatRow extends Component {
	render() {
		return (
			<View style={{flexDirection: 'row', marginBottom: 5}}>
				<Image
	        style={{width: 48, height: 48, borderRadius: 6, marginLeft: 10, marginRight: 10, marginBottom: 10}}
	        source={{uri: this.props.message.thumbUrl}}
	      />
	      <View style={{flex: 1}}>
	      	<View style={{flexDirection: 'row'}}>
			      <Text style={{fontWeight: 'bold'}}>{this.props.message.name}</Text>
			      <Text style={{marginLeft: 10, color: 'gray'}}>20:07</Text>
		      </View>
					<Text>{this.props.message.text}</Text>
				</View>
			</View>
		)
	}
}

class ChatWindow extends Component {
	// Initialize the hardcoded data
  constructor(props) {  	
    super(props);
    this.userMap = props.userMap;
    this.botMap = props.botMap;
  }

  getThumbUrl(rowData) {
  	if (rowData.user) {
  		return this.userMap[rowData.user].profile.image_192;
  	} else if (rowData.subtype === "bot_message") {
  		return this.botMap[rowData.bot_id].icons.image_72;
  	}
  }

  getText(rowData) {
  	if (rowData.text) {
  		return rowData.text;
  	} else if (rowData.attachments) {
  		return '<Attachment>';
  	}
  }

  getName(rowData) {
  	if (rowData.user) {
  		return this.userMap[rowData.user].name;
  	} else if (rowData.subtype === "bot_message") {
  		return this.botMap[rowData.bot_id].name;
  	}
  }

  getMessage(rowData) {
  	return {
  		text: this.getText(rowData),
  		thumbUrl: this.getThumbUrl(rowData),
  		name: this.getName(rowData)
  	}
  }
 
	render() {
		return (
			<View style={{flex: 1}}>
				<View style={{backgroundColor: '#533750', flexDirection: 'row', paddingTop: 24}}>
					<TouchableHighlight onPress={this.props.openControlPanel}>
	          <Image 
		          style={{width: 30, height: 30, borderRadius: 6, margin: 13}}
		          source={{uri: this.props.team.thumbUrl}}
		        />
	        </TouchableHighlight>
        	<Text style={{color: 'white', fontSize: 18, alignSelf: 'center'}}>
        		{this.props.team.name}
        	</Text>
        </View>
        <ListView
          dataSource={this.props.messages}
          renderRow={(rowData) => <ChatRow message={this.getMessage(rowData)} />}
          enableEmptySections={true}
        />
			</View>
		)
	}
}

export default class DrawerDemo extends Component {  
	ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
	state = {
		user: {},
		messages: this.ds.cloneWithRows([]),
		team: {},
		ims: [],
		drawerData: this.ds.cloneWithRows([])
	}
	datastore = this.props.datastore
	userMap = {}
	botMap = {}

	constructor(props) {
		super(props);

		this.datastore.getTeamInfo().then((teamInfo) => {
			this.setState({ team: { thumbUrl: teamInfo.icon.image_88, name: teamInfo.name }})
		})

		Promise.all([this.datastore.getChannels(), this.datastore.getUsers(), this.datastore.getImList()]).then((results) => {
    	var rows = [{text: 'CHANNELS', type: 'label'}],
    		channels = results[0],
    		users = results[1],
    		ims = results[2];

    	this.ims = ims;
    	this.users = users;

    	// build a user lookup map
	  	this.users.forEach((user) => {
	  		this.userMap[user.id] = user;
	  	})

	  	// Preselect default channel
	  	var generalChannel = channels.find((channel) => channel.name === 'general');
	  	this.onItemSelected({type: 'channel', id: generalChannel.id});

    	rows = rows.concat(channels.map((channel) => { return {id: channel.id, text: channel.name, type: 'channel'} }))
    	rows.push({text: 'USERS', type: 'label'});
    	rows = rows.concat(users
    		.filter((user) => {
    			if (this.ims.find((im) => im.user === user.id)) {
    				return user;
    			}
    		})
    		.map((user) => {
	    		return {id: user.id, text: user.name, type: 'user'} 
	    	}))
    	this.setState({ drawerData: this.ds.cloneWithRows(rows) });
    })

	}

  closeControlPanel = () => {
    this._drawer.close()
  };
  openControlPanel = () => {
    this._drawer.open()
  };

  onItemSelected = (rowData) => {
  	this.closeControlPanel();

  	if (rowData.type === 'user') {
  		var user = this.users.find((user) => user.id === rowData.id);
  		this.setState({ user: { thumbUrl: user.profile.image_192, name: user.name } })

  		var im = this.ims.find((im) => im.user === rowData.id);
  		this.datastore.getImHistory(im.id).then((messages) => {
  			if (messages.length === 0) {
  				messages.push({ user: rowData.id, text: `This is a start of your conversation with ${user.name}`})
  			}
  			this.retrieveBotInfo(messages).then(() => {
	  			this.setState({ messages: this.ds.cloneWithRows(messages) })
	  		});
  		})
  	}

  	if (rowData.type === 'channel') {
	    this.datastore.getChannelHistory(rowData.id).then((messages) => {
	    	this.retrieveBotInfo(messages).then(() => {
		    	this.setState({ messages: this.ds.cloneWithRows(messages) })
		    })
	    })
  	}
  };

  retrieveBotInfo(messages) {
		var botIds = messages.filter((message) => {
			// if we have a message with bot id and we don't have his info yet
			if (message.bot_id && !this.botMap[message.bot_id]) {
				return message;
			}
		}).map((message) => message.bot_id);

		return new Promise((resolve) => {
			if (botIds.length) {
				var promises = botIds.map((botId) => this.datastore.getBotInfo(botId));
				Promise.all(promises).then((results) => {
					results.forEach((bot) => this.botMap[bot.id] = bot);
					resolve();
				})
			} else {
				resolve();
			}
		})
  }

  render () {
    return (
      <Drawer
      	type="overlay"
        ref={(ref) => this._drawer = ref}
        openDrawerOffset={100}
        content={<DrawerContents 
        	datastore={this.props.datastore} 
        	onItemSelected={this.onItemSelected}
        	drawerData={this.state.drawerData} />}
        >
        <ChatWindow 
        	openControlPanel={this.openControlPanel} 
        	messages={this.state.messages} 
        	user={this.state.user}
        	team={this.state.team} 
        	userMap={this.userMap}
        	botMap={this.botMap} />
      </Drawer>
    )
  }
}