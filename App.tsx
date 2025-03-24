import React, {useState} from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
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

          let factoryProps = new solace.SolclientFactoryProperties();
          factoryProps.profile = solace.SolclientFactoryProfiles.version10;
          solace.SolclientFactory.init(factoryProps);
          solace.SolclientFactory.setLogLevel(solace.LogLevel.DEBUG);

          if (!solace) {
            return;
          }

          const session = solace.SolclientFactory.createSession({
            url: ['ws://10.103.233.119:8008'],
            vpnName: 'default',
            userName: 'default',
            password: '',
            clientName: 'MN3735183VDNAHLB',
            reapplySubscriptions: true,
            includeSenderId: true,
          });

          // Register lifecycle event handlers
          session.on(solace.SessionEventCode.UP_NOTICE, () => {
            console.log(
              '!*> Successfully connected and ready to publish messages. ===',
            );
          });

          session.on(
            solace.SessionEventCode.CONNECT_FAILED_ERROR,
            sessionEvent => {
              console.warn(
                `!*> Connection failed to the message router: ${sessionEvent.infoStr} - check parameter values and connectivity!`,
              );
            },
          );

          session.on(solace.SessionEventCode.DISCONNECTED, () => {
            console.log('!*> Disconnected.');
          });

          // Log a message when topic subscription is successful. This is actually handled by OBO sub manager (VB)
          session.on(solace.SessionEventCode.SUBSCRIPTION_OK, sessionEvent => {
            console.log(
              `!*> Successfully subscribed/unsubscribed from topic: ${sessionEvent.correlationKey}`,
              sessionEvent,
            );
          });

          // Handle message
          session.on(solace.SessionEventCode.MESSAGE, message => {
            console.log(
              '!*> Received message:',
              message.getBinaryAttachment(),
              ', details:\n',
              message.dump(),
            );
            console.log('Message is', message);
            // SolaceMessageHandler.handleMessage(message.getBinaryAttachment() as string)
          });

          try {
            session.connect();
          } catch (error) {
            console.log(error.toString());
          }
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
