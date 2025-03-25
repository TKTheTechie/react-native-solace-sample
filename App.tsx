import React, {useState} from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import mqtt from "mqtt";
import solace from './solclient-debug';

const App = () => {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Count: {count}</Text>
      <Button
        title="Connect"
        onPress={() => {
          setCount(count + 1);
            let client = mqtt.connect("ws://localhost:8000", {
              username: "default",
              password: "default",
              clientId: "react-native-client"
            });
          
          client.on("connect", function () {
            console.log("connected");
            client.subscribe("test/topic", function (err) {
              if (!err) {
                console.log("subscribed");
              }
            })
            client.on("message", function (topic, message) {
              console.log(`Received message: ${message.toString()} on topic: ${topic}`);
            });
          });
          
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default App;
