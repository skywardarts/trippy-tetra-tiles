var React = require('react-native');
var {
    View,
    StyleSheet
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
      console.log('From Native: ' + message);
      var message = JSON.parse(message);

      if (message.key === 'render') {
        var containerNode = document.getElementById('main');

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', '../app/components/' + message.component + '.js');
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                if (xmlhttp.status == 200) {
                    console.log('Response: ' + xmlhttp.responseText);

                    JSXTransformer.exec(xmlhttp.responseText);

                    window.React.render(window.React.createElement(window.LatestComponent, null), containerNode);
                }else{
                    console.log('Error: ' + xmlhttp.statusText);
                }
            }
        }

        xmlhttp.send();
      } else if (message.key === 'run') {
        eval(message);
      }
    };
  });
`;

var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  webView: {
  }
});

module.exports = React.createClass({
  getInitialState: function() {
    return {
      componentWidth: Dimensions.get('window').width,
      componentHeight: 200,
    };
  },
  onBridgeMessage: function (message) {
    console.log('From Web: ' + message);

    var message = JSON.parse(message);

    if (message.key === 'ready') {
      this.refs.webviewbridge.sendToBridge(JSON.stringify({key: 'render', component: this.props.component, props: this.props.children.props}));
    } else if (message.key === 'reposition') {
      this.setState({componentWidth: message.width, componentHeight: message.height});
    }
  },
  _updateWebViewHeight: function() {

  },
  render: function() {
    var {
      children
    } = this.props;

    return (
      <View style={[styles.container, {maxHeight: this.state.componentHeight, width: this.state.componentWidth}]}>
        <WebViewBridge
          ref="webviewbridge"
          style={[styles.webView, {height: this.state.componentHeight, width: this.state.componentWidth}]}
          javaScriptEnabled={true}
          scrollEnabled={false}
          automaticallyAdjustContentInsets={true}
          onNavigationStateChange={this._updateWebViewHeight}
          onBridgeMessage={this.onBridgeMessage}
          injectedJavaScript={injectScript}
          url={"http://localhost:8081/web/component.html"}
        />
      </View>
    );
  }
});