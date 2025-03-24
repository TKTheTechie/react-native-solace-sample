# React Native Solace Sample

This is a React Native project demonstrating how to integrate and use the Solace PubSub+ messaging platform.

## Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js and npm/Yarn:** Required for managing JavaScript dependencies.
* **React Native CLI:** Installed globally (`npm install -g react-native-cli`).
* **Android Studio or Xcode:** Depending on whether you're targeting Android or iOS.
* **React Native Development Environment:** Properly set up as described in the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) documentation.
* **Solace PubSub+ Broker:** Accessible from your development environment. Replace the placeholder url and vpn with your values.
* **solclient-debug.js:** The Solace JavaScript API library. Place this file in your project's root directory or a suitable location. In this example it is in the root directory.

## Getting Started

1.  **Clone the Repository (if applicable):** If you have a repository, clone it to your local machine.

2.  **Navigate to the Project Directory:**

    ```bash
    cd your-project-directory
    ```

3.  **Install Dependencies:**

    ```bash
    # using npm
    npm install

    # OR using Yarn
    yarn install
    ```

4.  **Start the Metro Server:**

    ```bash
    # using npm
    npm start

    # OR using Yarn
    yarn start
    ```

5.  **Run the Application:**

    **For Android:**

    ```bash
    # using npm
    npm run android

    # OR using Yarn
    yarn android
    ```

    **For iOS:**

    ```bash
    # using npm
    npm run ios

    # OR using Yarn
    yarn ios
    ```

## App.tsx Code Explanation

The `App.tsx` file contains the core logic for connecting to the Solace PubSub+ broker and handling messages.

```typescript
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
            url: ['ws://10.103.233.119:8008'], // Replace with your Solace broker URL
            vpnName: 'default', // Replace with your VPN name
            userName: 'default', // Replace with your username
            password: '', // Replace with your password
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

          // Log a message when topic subscription is successful.
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
