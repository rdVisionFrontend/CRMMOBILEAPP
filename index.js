/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {Provider} from 'react-redux';
import {store} from './src/Redux/store';
import ToastManager from 'toastify-react-native';

const Root = () => (
  <Provider store={store}>
    <App />
    <ToastManager />
  </Provider>
);

AppRegistry.registerComponent(appName, () => Root);
