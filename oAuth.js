import React, { Component } from 'react';
import {
  Text,
  StatusBar,
  View,
  WebView,
  StyleSheet
} from 'react-native';

const oauthAccessUrl = 'https://slack.com/api/oauth.access',
    clientId = '4194323104.99918806739',
    clientSecret = '423f0838f58589fff906a0a06e1aa769',
    scope = 'client',
    ouathAuthorizeUrl = `https://slack.com/oauth/authorize?client_id=${clientId}&scope=${scope}`;

var WEBVIEW_REF = 'webview';

export default class Oauth extends Component {
  state = {
    url: ouathAuthorizeUrl,
    status: 'No Page Loaded',
    backButtonEnabled: false,
    forwardButtonEnabled: false,
    loading: true,
    scalesPageToFit: true,
    topText: 'hello'
  };

  onNavigationStateChange = (navState) => {
    this.setState({
      backButtonEnabled: navState.canGoBack,
      forwardButtonEnabled: navState.canGoForward,
      url: navState.url,
      status: navState.title,
      loading: navState.loading,
      scalesPageToFit: false
    });
  };

  onLoadStart = () => {
    if (this.state.url.indexOf('code=') + 1) {
      this.refs[WEBVIEW_REF].stopLoading();

      let url = this.state.url,
        code = url.substring(url.search('code=') + 5, url.search('&')),
        slackOautAccess = `${oauthAccessUrl}?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`;

      console.log(`retrieving ${slackOautAccess}`)
      this.setState({url: ''})

      fetch(slackOautAccess).then((response) => {
        response.json().then((data) => {
          this.props.onAuthorize(data);
        })
      })
      
    }
    console.log('starting to load: ' + this.state.url);
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true}></StatusBar>
        <WebView
          source={{uri: this.state.url}}
          style={{marginTop: 20}}
          onNavigationStateChange={this.onNavigationStateChange}
          onLoadStart={this.onLoadStart}
          ref={WEBVIEW_REF}
        />
      </View>
    )
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1
  }
})