import React from 'react';
import { Table } from 'reactstrap';
import moment from 'moment';
import config from './Config';
import { getEvents } from './GraphService';
import Countdown from 'react-countdown-now';
import styled from 'styled-components';

const StyledCountdown = styled.div`
  span {
    display: block;
    font-weight: 800;
    font-size: ${props => props.warn ? '10rem' : '5rem'};
    color: ${props => props.warn ? 'red' : 'green'};
    text-align: center;
    margin: 0 auto;
  }
`;

function formatDateTime(dateTime) {
  return moment.utc(dateTime).local().format('M/D/YY h:mm A');
}

export default class Calendar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      events: [],
      poll: null,
      warn: false
    };
  }

  async loadEvents() {
    try {
      // Get the user's access token
      var accessToken = await window.msal.acquireTokenSilent({
        scopes: config.scopes
      });
      // Get the user's events
      var events = await getEvents(accessToken);
      console.log({ events });
      // Update the array of events in state
      this.setState({ events: events.value });
    }
    catch (err) {
      this.props.showError('ERROR', JSON.stringify(err));
    }
  }

  async componentDidMount() {
    this.loadEvents();
    const poll = window.setInterval(() => {
      this.loadEvents();
    }, 10000);
    this.setState({ poll });
  }

  componentWillUnmount() {
    window.clearInterval(this.state.poll);
  }

  onTick(delta) {
    // console.log(delta);
    if (delta.minutes < 10) {
      this.setState({ warn: true });
    }
  }

  render() {
    const next = this.state.events.filter(e => !e.isAllDay && !e.isCancelled)[0];
    return (
      <div>
        <h1>Calendar</h1>
        {next &&
          <StyledCountdown warn={this.state.warn}>
            <Countdown date={new Date(next.start.dateTime)} onTick={this.onTick} />
          </StyledCountdown>
        }
        <Table>
          <thead>
            <tr>
              <th scope="col">Organizer</th>
              <th scope="col">Subject</th>
              <th scope="col">Location</th>
              <th scope="col">Start</th>
              <th scope="col">End</th>
            </tr>
          </thead>
          <tbody>
            {this.state.events.map(
              function (event) {
                return (
                  <tr key={event.id}>
                    <td>{event.organizer.emailAddress.name}</td>
                    <td>{event.subject}</td>
                    <td>{event.location.displayName}</td>
                    <td>{formatDateTime(event.start.dateTime)}</td>
                    <td>{formatDateTime(event.end.dateTime)}</td>
                  </tr>
                );
              })}
          </tbody>
        </Table>
      </div>
    );
  }
}