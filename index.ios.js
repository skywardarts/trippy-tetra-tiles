'use strict';

var React = require('react-native');
var {AppRegistry} = React;
import Router from './package/release/assets/app/router';

console.disableYellowBox = true;

AppRegistry.registerComponent('Router', () => Router);
