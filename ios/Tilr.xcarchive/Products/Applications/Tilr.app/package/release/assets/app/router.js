'use strict';

var React = require('react-native');
import CodePush from "react-native-code-push";
var {AppRegistry, Navigator, StyleSheet, Text, View} = React;
var Launch = require('./ui/screens/Launch');
var Register = require('./ui/screens/Register');
var Login = require('./ui/screens/Login');
var Login2 = require('./ui/screens/Login2');
var RNRF = require('react-native-router-flux');
var {Route, Schema, Animations, Actions, TabBar} = RNRF;
var Error = require('./ui/screens/Error');
var Home = require('./ui/screens/Home');
var TabView = require('./ui/screens/TabView');
var Modal = require('./ui/screens/Modal');


// Redux stuff is optional
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'

function reducer(state = {}, action) {
    switch (action.type) {
        case Actions.BEFORE_ROUTE:
            //console.log("BEFORE_ROUTE:", action);
            return state;
        case Actions.AFTER_ROUTE:
            //console.log("AFTER_ROUTE:", action);
            return state;
        case Actions.AFTER_POP:
            //console.log("AFTER_POP:", action);
            return state;
        case Actions.BEFORE_POP:
            //console.log("BEFORE_POP:", action);
            return state;
        case Actions.AFTER_DISMISS:
            //console.log("AFTER_DISMISS:", action);
            return state;
        case Actions.BEFORE_DISMISS:
            //console.log("BEFORE_DISMISS:", action);
            return state;
        default:
            return state;
    }

}
let store = createStore(reducer);
const RouteContainer = connect()(RNRF.Router);

class TabIcon extends React.Component {
    render(){
        return (
            <Text style={{color: this.props.selected ? 'red' :'black'}}>{this.props.title}</Text>
        );
    }
}

class Header extends React.Component {
    render(){
        return <Text style={styles.header}></Text>
    }
}

export default class Router extends React.Component {
  async sync() {
    let self = this;
    try {
      return await CodePush.sync(
        { 
          updateDialog: true,
          installMode: CodePush.InstallMode.ON_NEXT_RESUME
        }, 
        (syncStatus) => {
          switch(syncStatus) {
            case CodePush.SyncStatus.CHECKING_FOR_UPDATE: 
              self.setState({
                syncMessage: "Checking for update."
              });
              break;
            case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
              self.setState({
                syncMessage: "Downloading package."
              });
              break;
            case CodePush.SyncStatus.AWAITING_USER_ACTION:
              self.setState({
                syncMessage: "Awaiting user action."
              });
              break;
            case CodePush.SyncStatus.INSTALLING_UPDATE:
              self.setState({
                syncMessage: "Installing update."
              });
              break;
            case CodePush.SyncStatus.UP_TO_DATE:
              self.setState({
                syncMessage: "App up to date.",
                progress: false
              });
              break;
            case CodePush.SyncStatus.UPDATE_IGNORED:
              self.setState({
                syncMessage: "Update cancelled by user.",
                progress: false
              });
              break;
            case CodePush.SyncStatus.UPDATE_INSTALLED:
              self.setState({
                syncMessage: "Update installed and will be run when the app next resumes.",
                progress: false
              });
              break;
            case CodePush.SyncStatus.UNKNOWN_ERROR:
              self.setState({
                syncMessage: "An unknown error occurred 22222222.",
                progress: false
              });
              break;
          }
        },
        (progress) => {
          self.setState({
            progress: progress
          });
        }
      );
    } catch (error) {
      CodePush.log(error);
    }
  }
    componentDidMount() {
        CodePush.notifyApplicationReady();
        this.sync();

        CodePush.checkForUpdate()
        .then((update) => {
            if (!update) {
                console.log("The app is up to date! 2"); 
            } else {
                console.log("An update is available! Should we download it?");
            }
        });
    }

    render() {
        // Provider is optional (if you want to use redux)
        return (
            <Provider store={store}>
                <RouteContainer hideNavBar={true} name="root">
                    <Schema name="modal" sceneConfig={Navigator.SceneConfigs.FloatFromBottom}/>
                    <Schema name="default" sceneConfig={Navigator.SceneConfigs.FloatFromRight}/>
                    <Schema name="withoutAnimation"/>
                    <Schema name="tab" type="switch" icon={TabIcon} />

                    <Route name="register" component={Register} title="Register"/>
                    <Route name="showActionSheet" type="actionSheet" title="What do you want to do?" options={['Delete', 'Save', 'Cancel']} cancelButtonIndex={2} destructiveButtonIndex={0}/>
                    <Route name="home" component={Home} title="Replace" type="replace"/>
                    <Route name="login" schema="modal">
                        <RouteContainer name="loginRouter">
                            <Route name="loginModal" component={Login} schema="modal"/>
                            <Route name="loginModal2" hideNavBar={true} component={Login2} title="Login2"/>
                        </RouteContainer>
                    </Route>
                    <Route name="register2" component={Register} title="Register2"  schema="withoutAnimation"/>
                    <Route name="error" type="modal" component={Error}/>
                    <Route name="modalBox" type="modal" component={Modal}/>
                    <Route name="tabbar">
                        <RouteContainer footer={TabBar} hideNavBar={true}>
                            <Route name="tab1" schema="tab" title="Tab #1" >
                                <RouteContainer onPop={()=>{console.log("onPop is called!"); return true} }>
                                    <Route name="tab1_1" component={TabView} title="Tab #1_1" />
                                    <Route name="tab1_2" component={TabView} title="Tab #1_2" />
                                </RouteContainer>
                            </Route>
                            <Route name="tab2" schema="tab" title="Tab #2" hideNavBar={true} initial={true}>
                                <RouteContainer onPop={()=>{console.log("onPop is called!"); return true} }>
                                    <Route name="tab2_1" component={TabView} title="Tab #2_1" />
                                    <Route name="tab2_2" component={TabView} title="Tab #2_2" />
                                </RouteContainer>
                            </Route>
                            <Route name="tab3" schema="tab" title="Tab #3" component={TabView} hideTabBar={true}/>
                            <Route name="tab4" schema="tab" title="Tab #4" component={TabView} />
                            <Route name="tab5" schema="tab" title="Tab #5" component={TabView} />
                        </RouteContainer>
                    </Route>
                    <Route name="launch" header={Header} initial={true} component={Launch} wrapRouter={true} title="Launch" hideNavBar={true}/>
                </RouteContainer>
            </Provider>
        );
    }
}


import Dimensions from 'Dimensions';
var styles = StyleSheet.create({
    header: {
        width: Dimensions.get('window').width,
        height: 10,
        backgroundColor: '#2D749A',
        opacity: 0.8,
        color: '#fff'
    }
});
