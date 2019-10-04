import React from 'react';
import {
  Button,
  Jumbotron
} from 'reactstrap';

function WelcomeContent(props) {
  // If authenticated, greet the user
  if (props.isAuthenticated) {
    return (
      <div>
        <h4>Welcome {props.user.displayName}!</h4>
        <p>Use the navigation bar at the top of the page to get started.</p>
      </div>
    );
  }

  // Not authenticated, present a sign in button
  return <Button color="primary" onClick={props.authButtonMethod}>Click here to sign in</Button>;
}

export default class Welcome extends React.Component {

  render() {
    return (
      <Jumbotron>
        <h1>BeOnTime</h1>
        <p className="lead">This is a quick little SPA that displays your upcoming Outlook/Office365 appointments with a large countdown to the next appointment. Once there is less than 10 minutes remaining the countdown doubles in size and turns red.

I leave this open in a window at the top right of my secondary monitor to make sure I don't miss any meetings due to being so focused on my work ;)</p>
        <WelcomeContent
          isAuthenticated={this.props.isAuthenticated}
          user={this.props.user}
          authButtonMethod={this.props.authButtonMethod} />
      </Jumbotron>
    );
  }
}