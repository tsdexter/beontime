import React, { Component, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'reactstrap';
import { UserAgentApplication } from 'msal';
import NavBar from './NavBar';
import ErrorMessage from './ErrorMessage';
import Welcome from './Welcome';
import config, { scopes } from './Config';
import { getUserDetails } from './GraphService';
import 'bootstrap/dist/css/bootstrap.css';
import Calendar from './Calendar';
import { MsalProvider, useIsAuthenticated, useMsal, useMsalAuthentication } from '@azure/msal-react';
import { AuthButton } from './AuthButton';
import { InteractionRequiredAuthError, InteractionType } from '@azure/msal-browser';
import { graphFetch } from './graphFetch';

// create UserContext
export const UserContext = React.createContext();

// create a provider component
export const UserContextProvider = (props) => {
  const [loading, setLoading] = React.useState(true);
  const [me, setMe] = React.useState(null);
  const [manager, setManager] = React.useState(null);
  const [events, setEvents] = React.useState(null);
  const [ssoLaunched, setSsoLaunched] = React.useState(false);
  const {
    result, error
  } = useMsalAuthentication(InteractionType.Silent, {
    scopes: scopes,
  });
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    // recheck calendarview every 10 seconds
    const interval = setInterval(() => {
      window.location.reload()
      console.log(`polling`, error, result)
    //   if (!!error) return;
    //   if (result) {
    //     const { accessToken } = result;
    //     const now = new Date();
    //     const nowUTC = new Date(now.toUTCString());
    //     const end = new Date(+new Date() + 1209600000);
    //     const endUTC = new Date(end.toUTCString());
    //     graphFetch(`https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=${nowUTC.toISOString()}&endDateTime=${endUTC.toISOString()}&$orderby=start/dateTime&$top=20`, accessToken)
    //       .then(data => {
    //         setEvents(data)
    //         console.log("events", data)
    //       }).catch(error => {
    //         console.log(error)
    //       })
    //   }
    }, 120000);
    return () => clearInterval(interval);
  }, [result, error])

  useEffect(() => {
    if (!!me) return;
    if (!!manager) return;
    if (!!events) return;
    if (!!error) return;
    console.log("running")
    if (result) {
      console.log("result", result)
      const { accessToken } = result;
      graphFetch('https://graph.microsoft.com/v1.0/me', accessToken)
        .then(data => {
          setMe(data)
          console.log("me", data)
        }).catch(error => {
          console.log(error)
        })

      graphFetch('https://graph.microsoft.com/v1.0/me/manager', accessToken)
        .then(data => {
          setManager(data)
          console.log("mgr", data)
        }).catch(error => {
          console.log(error)
        })

      const now = new Date();
      const nowUTC = new Date(now.toUTCString());
      const end = new Date(+new Date() + 1209600000);
      const endUTC = new Date(end.toUTCString());
      // console.log({ nowUTC: nowUTC.toISOString(), endUTC: endUTC.toISOString() })
      graphFetch(`https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=${nowUTC.toISOString()}&endDateTime=${endUTC.toISOString()}&$orderby=start/dateTime&$top=20`, accessToken)
        .then(data => {
          setEvents(data)
          console.log("events", data)
          setLoading(false)
        }).catch(error => {
          console.log(error)
        })
    }
    // if (!isAuthenticated && !ssoLaunched) {
    //   instance.ssoSilent({
    //     scopes: scopes,
    //     loginHint: ""
    //   }).then((response) => {
    //     instance.setActiveAccount(response.account)
    //   }).catch(error => {
    //     if (error instanceof InteractionRequiredAuthError) {
    //       instance.loginPopup({
    //         scopes: scopes, 
    //       })
    //     }
    //   })
    //   setSsoLaunched(true)
    // }
  }, [result, error, isAuthenticated, ssoLaunched, me, manager, instance, events]);
  return <UserContext.Provider value={{me, manager, events: events?.value, loading}}>{props.children}</UserContext.Provider>
}


function App(props) {
  return (
    <MsalProvider instance={props.msalInstance}>
      <UserContextProvider>
        <Router>
          <Routes>
            <Route path="/" element={<><Welcome /><AuthButton /></>} />
            <Route path="/countdown" element={
              <div className="overflow-y-scroll">
                <Calendar />
                <AuthButton />
              </div>
            } />
          </Routes>
        </Router>
        <p className="my-4 mx-auto text-center text-sm">Created with ❤ by <a href="https://github.com/tsdexter/beontime" target="_BLANK">Thomas Dexter</a></p>
      </UserContextProvider>
    </MsalProvider>
  )
}

export default App;
