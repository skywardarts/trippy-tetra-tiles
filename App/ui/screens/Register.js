'use strict';

var React = require('react-native');
var {View, Text, StyleSheet, WebView} = React;
var Button = require('react-native-button');
var Actions = require('react-native-router-flux').Actions;
import Dimensions from 'Dimensions';

class Register extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <Text>Register page</Text>
                <Button onPress={Actions.home}>Replace screen</Button>
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
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});

module.exports = Register;