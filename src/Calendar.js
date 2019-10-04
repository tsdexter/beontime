import React from 'react';
import { Table } from 'reactstrap';
import moment from 'moment';
import config from './Config';
import { getEvents } from './GraphService';
import Countdown from 'react-countdown-now';
import styled, { keyframes } from 'styled-components';

const blink = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

const StyledCountdown = styled.div`
  span {
    display: block;
    font-weight: 800;
    font-size: 5rem;
    color: green;
    text-align: center;
    margin: 0 auto;
  }
  &.warn { 
    span {
      font-size: 10rem;
      color: red;
    }
    &.reallyWarn {
      span {
        animation: ${blink} 500ms linear infinite;
      }
    }
  }
  h1, h2 {
    margin: 0 auto;
    text-align: center;
    font-weight: bold;
  }
  h2 {
    margin-bottom: 2rem;
    font-size: 2rem;
  }
`;

function formatDateTime(dateTime) {
  return moment.utc(dateTime).local().format('M/D/YY h:mm A');
}

function formatTime(dateTime) {
  return moment.utc(dateTime).local().format('h:mm A');
}

export default class Calendar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      events: [],
      poll: null,
      warn: false,
      reallyWarn: false,
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
    }, 60000);
    this.setState({ poll });
  }

  componentWillUnmount() {
    window.clearInterval(this.state.poll);
  }

  onTick = (delta) => {
    // console.log(delta);
    if (delta.days === 0 && delta.hours === 0 && delta.minutes < 10) {
      this.setState({
        warn: true,
        reallyWarn: delta.minutes < 5
      });
    } else {
      this.setState({ warn: false, reallyWarn: false });
    }
  }

  convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;
  }

  render() {
    const next = this.state.events.filter(e => !e.isAllDay && !e.isCancelled)[0];
    let date;
    if (next) date = new Date(next.start.dateTime);
    return (
      <div>
        {next &&
          <div>
            <StyledCountdown className={`${this.state.warn && 'warn'} ${this.state.reallyWarn && 'reallyWarn'}`}>
              <h1>{next.subject}</h1>
              <Countdown date={this.convertUTCDateToLocalDate(date)} onTick={this.onTick} />
              <h2>{next.location.displayName} @ {formatTime(next.start.dateTime)}</h2>
            </StyledCountdown>
          </div>
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