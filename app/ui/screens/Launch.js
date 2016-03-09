'use strict';

var React = require('react-native');
var {View, Text, StyleSheet, TouchableHighlight, WebView} = React;
var Button = require('react-native-button');
var Actions = require('react-native-router-flux').Actions;
import Dimensions from 'Dimensions';


            // <View style={styles.container}>
            //     <Text>Launch page</Text>
            //     <FacebookButton />
            //     <Button onPress={()=>Actions.login({data:"Custom data", title:'Custom title' })}>Go to Login page</Button>
            //     <Button onPress={Actions.register}>Go to Register page</Button>
            //     <Button onPress={Actions.register2}>Go to Register page without animation</Button>
            //     <Button onPress={()=>Actions.error("Error message")}>Popup error</Button>
            //     <Button onPress={Actions.modalBox}>PopUp with ReactNativeModalBox</Button>
            //     <Button onPress={Actions.tabbar}>Go to TabBar page</Button>
            //     <Button onPress={()=>Actions.showActionSheet({callback:index=>alert("Selected:"+index)})}>Show ActionSheet</Button>
            // </View>
class Launch extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <Button onPress={Actions.pop}>Back</Button>
                <WebView
                    ref="webviewbridge"
                    style={styles.webView}
                    url={"http://localhost:8081/app/ui/screens/game/launch/launch.html"}
                />
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
        padding: 0
    },
    webView: {
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width
    },
});

module.exports = Launch;