'use strict';

import Nextgen from 'nextgen';
var ReactNativeModalBox = require('../containers/ReactNativeModalBox');
console.log(Nextgen.ui.Screen);
export default class Modal extends Nextgen.ui.Screen {
    render() {
        return ReactNativeModalBox;
    }
}