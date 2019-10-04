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
  const events = await client
    .api(`/me/calendar/calendarView?startDateTime=${nowUTC.toISOString()}&endDateTime=2019-10-11T23:59:59.0000000`)
    .get();

  return events;
}