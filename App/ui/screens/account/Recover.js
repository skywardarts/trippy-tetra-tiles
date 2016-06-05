'use strict';

var React = require('react-native');

var {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} = React;


var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f8fa'
  },
});

var Screen = React.createClass({
  componentDidMount() {
  },
  render() {
    return (
      <View style={styles.container}>
        <Text>Breacrumbs</Text>
        <Text>Gallery</Text>
        <Text>$20 - $40</Text>
        <Text>xx Retailers</Text>
        <Text>4 stars</Text>
        <Text>1705 reviews</Text>
        <Text>18% off</Text>
        <Text>one sentence description</Text>
        <Text>add to cart</Text>
        <Text>share bar [fb | twitter]</Text>
        <Text>price history</Text>
        <Text>retail price</Text>
        <Text>retail price table</Text>
        <Text>tags [ 2014, High CAGR, US-Only, TRU Exclusive]</Text>
        <Text>view entire price history</Text>
        <Text>tab container</Text>
        <Text>tab: compare prices</Text>
        <Text>retailer | rating | availability | price | price with delivery</Text>
        <Text>set details</Text>
        <Text>description</Text>
        <Text>details table</Text>
        <Text>set number : 75030</Text>
        <Text>name: mf</Text>
        <Text>comments bar</Text>
        <Text>23 comments</Text>
        <Text>comment</Text>
        <Text>mike taylor</Text>
        <Text>desc</Text>
        <Text>stars</Text>
        <Text>add comment bar</Text>
        <Text>footer: copyright</Text>
      </View>
    )
  }
});


module.exports = Screen;
