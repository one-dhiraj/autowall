/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/pages/App';
import {name as appName} from './app.json';
import BackgroundFetch from "react-native-background-fetch";
import { backgroundFetchHeadlessTask } from './src/components/utilFunctions';

AppRegistry.registerComponent(appName, () => App);

// Now register the handler.
BackgroundFetch.registerHeadlessTask(backgroundFetchHeadlessTask);