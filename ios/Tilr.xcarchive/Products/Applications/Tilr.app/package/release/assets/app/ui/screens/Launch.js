'use strict';

var React = require('react-native');
var {View, Text, StyleSheet, TouchableHighlight, WebView} = React;
var Button = require('react-native-button');
var Actions = require('react-native-router-flux').Actions;
import Dimensions from 'Dimensions';

import CodePush from "react-native-code-push";

// We need to manually include the assets used in the webview here
// So that react packager picks up on them and brings them into the bundle
//require('./game/launch/launch.html');
// require('./game/launch/static/img/images.png');
// require('./game/launch/static/js/lib/lodash.min.js');
// require('./game/launch/static/js/lib/phaser.js');
// require('./game/launch/static/js/game.js');
// require('./game/launch/static/js/grid.js');
// require('./game/launch/static/js/pentominos.js');
// require('./game/launch/static/js/plasma.js');
// require('./game/launch/static/js/setup.js');
// require('./game/launch/static/js/splash.js');
// require('./game/launch/static/js/utils.js');
// require('./game/launch/static/map.json');
// require('./game/launch/static/tileset.png');

var HTTPServer = require('react-native-httpserver');

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
            var reset = '5';
            console.log(reset);
class Launch extends React.Component {
    componentDidMount() {
        HTTPServer.start({port: "8082", root: 'BUNDLE'});
        HTTPServer.url( function(urlbase){
        });

        HTTPServer.dir('/', ['js'], function(info){
        });
    }
    sync() {

        // codePush.getCurrentPackage()
        // .then((update) => {
        //     codePush.downloadUpdate(update)
        //     .then(())
         // info.downloadUrl
        //     // If the current app "session" represents the first time
        //     // this update has run, and it had a description provided
        //     // with it upon release, let's show it to the end user
        //     if (update.isFirstRun && update.description) {
        //         // Display a "what's new?" modal

        //     }
        // });

        // codePush.checkForUpdate()
        // .then((update) => {
        //     if (!update) {
        //         console.log("The app is up to date! 2");
        //     } else {
        //         console.log("An update is available! Should we download it?");
        //     }
        // });
    }
    render() {
        return (
            <View style={styles.container}>
                <Button style={styles.header}>TTT: Trippy Tetra Tiles</Button>
                <WebView
                    ref="webviewbridge"
                    style={styles.webView}
                    url={"http://127.0.0.1:8082/package/release/assets/app/ui/screens/game/launch/launch.html"}
                />
            </View>
        );
    }
}

var styles = StyleSheet.create({
    header: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: Dimensions.get('window').width,
        color: '#fff',
        backgroundColor: '#2D749A',
        padding: 10,
        opacity: 0.8
    },
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
