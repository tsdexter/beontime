import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import { EventType, PublicClientApplication } from '@azure/msal-browser';
import { appId } from './Config';

const pca = new PublicClientApplication({
  auth: {
    clientId: appId,
    // authority: 'https://login.microsoftonline.com/common',
    redirectUri:  `${window.location.protocol}//${window.location.host}`
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false
  },
});

pca.addEventCallback(event => {
  // console.log(event)
  if (event.eventType === EventType.LOGIN_SUCCESS) {
    pca.setActiveAccount(event.payload.account);
  }
})

// switch to createRoot
createRoot(document.getElementById('root')).render(<App msalInstance={pca} />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
