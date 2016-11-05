'use strict';

import React, { Component } from 'react';
import Exponent from 'exponent';
import {
  Text,
  AppRegistry,
  StyleSheet,
  Navigator,
  View,
  StatusBar,
  WebView,
  Button,
  TouchableHighlight,
  Alert
} from 'react-native';
import Oauth from './oAuth';
import DrawerDemo from './drawerDemo';
import Datastore from './datastore';

const onButtonPress = () => {
  Alert.alert('Button has been pressed!');
};

class HelloWorld extends Component {
  render() {
    return (
      <View>
        <StatusBar hidden={true}></StatusBar>
        <TouchableHighlight onPress={onButtonPress}>
          <Text>This is a button</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

class Main extends Component {
  state = {
    isLoggedIn: false 
  }
  
  onAuthorize(response) {
    this.datastore = new Datastore(response.access_token);

    this.setState({ isLoggedIn: true })
  }

  render() {
    if (this.state.isLoggedIn) {
      return <DrawerDemo datastore={this.datastore}/>;
    }
    return <Oauth onAuthorize={(token) => this.onAuthorize(token)}/>;
  }
}

class PropertyFinderApp extends Component {
  render() {
    return (
      <Navigator
        initialRoute={{ title: 'Awesome Scene', index: 0 }}
        renderScene={(route, navigator) =>
          <Text>Hello {route.title}!</Text>
        }
        style={{padding: 100}}
        navigationBar={
           <Navigator.NavigationBar
             routeMapper={{
               LeftButton: (route, navigator, index, navState) =>
                { return (<Text>Cancel</Text>); },
               RightButton: (route, navigator, index, navState) =>
                 { return (<Text>Done</Text>); },
               Title: (route, navigator, index, navState) =>
                 { return (<Text>Awesome Nav Bar</Text>); },
             }}
             style={{backgroundColor: 'gray', marginTop: 24}}
           />
        }
      />
    )
  }
}

var styles = StyleSheet.create({
  text: {
    color: 'black',
    backgroundColor: 'white',
    fontSize: 30,
    margin: 80
  },
  container: {
    flex: 1
  }
})

Exponent.registerRootComponent(Main);