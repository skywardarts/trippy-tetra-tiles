'use strict';

var React = require('react-native');

var {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  WebView
} = React;


import WebViewBridge from 'react-native-webview-bridge';
import Dimensions from 'Dimensions';

const injectScript = `
  function webViewBridgeReady(cb) {
    //checks whether WebViewBirdge exists in global scope.
    if (window.WebViewBridge) {
      cb(window.WebViewBridge);
      return;
    }

    function handler() {
      //remove the handler from listener since we don't need it anymore
      document.removeEventListener('WebViewBridge', handler, false);
      //pass the WebViewBridge object to the callback
      cb(window.WebViewBridge);
    }

    //if WebViewBridge doesn't exist in global scope attach itself to document
    //event system. Once the code is being injected by extension, the handler will
    //be called.
    document.addEventListener('WebViewBridge', handler, false);
  }

  webViewBridgeReady(function (webViewBridge) {
    webViewBridge.onMessage = function (message) {
      alert('got a message from Native: ' + message);

      webViewBridge.send("message from webview");

      eval(message);
    };
  });
`;

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f8fa'
  },
  webView: {
    maxHeight: Dimensions.get('window').height,
    width: Dimensions.get('window').width
  },
});

var Screen = React.createClass({
  componentDidMount() {
    // setTimeout(() => {
    //   this.refs.webviewbridge.sendToBridge("alert(5);");
    // }, 5000);
  },
  onBridgeMessage: function (message) {
    console.log(message);
  },
  render() {
    return (
      <View style={styles.container}>
        <WebView
          ref="webviewbridge"
          style={styles.webView}
          onBridgeMessage={this.onBridgeMessage}
          injectedJavaScript={injectScript}
          url={"http://google.com"}
        />
      </View>
    )
  }
});


module.exports = Screen;
