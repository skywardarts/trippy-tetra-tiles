'use strict';

var React = require('react-native');

var Tweet = require('../../Components/Tweet');
var TweetPage = require('../../Components/TweetBig');
var Webify = require('../../Components/Webify');
var TodoList = require('../../Components/TodoList/TodoList');
var AnimatedViews = require('../../Components/AnimatedViews');

var {
  StyleSheet,
  ScrollView,
  View,
  Text
} = React;


var Screen = React.createClass({
  getInitialState: function() {
    return {
      tweets: [
        {
          text: null,
          user: {
            name: "What's going on?",
            username: "sss",
            avatar: null
          },
        },
        {
          text: "Wow, native and web components mixed together!",
          user: {
            name: "Eric Muyser",
            username: "ericmuyser",
            avatar: "https://pbs.twimg.com/profile_images/561395528143876096/Etf67oKo_400x400.jpeg"
          },
        },
        {
          text: "This is gonna rock",
          user: {
            name: "John Doe",
            username: "JohnD",
            avatar: "https://pbs.twimg.com/profile_images/436581173871927296/txsssbgk_400x400.jpeg"
          }
        },
        {
          text: "Hello world!",
          user: {
            name: "Leonard Pauli",
            username: "LeonardPauli",
            avatar: "https://pbs.twimg.com/profile_images/436581173871927296/txEzxxbgk_400x400.jpeg"
          }
        }
      ]
    }
  },
  goToTweet: function(tweetData) {
    this.props.toRoute({
      name: "Tweet",
      component: TweetPage,
      data: tweetData
    });
  },

  render() {
    var Tweets = this.state.tweets.map((tweetData) => {
      return <Tweet {...tweetData} onPress={this.goToRoute} goToTweet={this.goToTweet} />;
    });

    return (
      <ScrollView style={styles.mainContainer}>
        <View style={styles.commentContainer}>
          <Tweet {...this.state.tweets[0]} onPress={() => null} goToTweet={() => null}>
          </Tweet>
        </View>
        <View style={styles.mapContainer}>
          <AnimatedViews />
        </View>
        <View style={styles.commentContainer}>
          <Tweet {...this.state.tweets[1]} onPress={() => null} goToTweet={() => null}>
            <Webify component="TodoList">
              <TodoList title="Magic 1" />
            </Webify>
          </Tweet>
          <Tweet {...this.state.tweets[2]} onPress={() => null} goToTweet={() => null}>
            <Webify component="TodoList">
              <TodoList title="Magic 2" />
            </Webify>
          </Tweet>
          <Tweet {...this.state.tweets[3]} onPress={() => null} goToTweet={() => null}>
            <Webify component="TodoList">
              <TodoList title="Magic 3" />
            </Webify>
          </Tweet>
        </View>
      </ScrollView>
    )
  }
});


var styles = StyleSheet.create({
  commentContainer: {
    flex: 1,
    backgroundColor: '#f5f8fa'
  },
  mainContainer: {
    flex: 1
  },
  mapContainer: {
    height: 430
  }
});


module.exports = Screen;
