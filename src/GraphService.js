var graph = require('@microsoft/microsoft-graph-client');

function getAuthenticatedClient(accessToken) {
  // Initialize Graph client
  const client = graph.Client.init({
    // Use the provided access token to authenticate
    // requests
    authProvider: (done) => {
      done(null, accessToken.accessToken);
    }
  });

  return client;
}

export async function getUserDetails(accessToken) {
  const client = getAuthenticatedClient(accessToken);

  const user = await client.api('/me').get();
  return user;
}

export async function getEvents(accessToken) {
  const client = getAuthenticatedClient(accessToken);
  const now = new Date();
  const nowUTC = new Date(now.toUTCString());
  const end = new Date(+new Date() + 1209600000);
  const endUTC = new Date(end.toUTCString());
  const events = await client
    .api(`/me/calendar/calendarView?startDateTime=${nowUTC.toISOString()}&endDateTime=${endUTC.toISOString()}`)
    .get();
  console.log({ events })
  return events;
}