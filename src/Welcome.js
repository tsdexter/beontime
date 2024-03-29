import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import React, { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { launch } from './utils';

export default function Welcome(props) {
  const [, setUsername] = React.useState('')
  const [name, setName] = React.useState('')
  const { instance } = useMsal();

  const currentAccount = instance.getActiveAccount();
  useEffect(() => {
    if (currentAccount) {
      console.log({ currentAccount })
      setUsername(currentAccount.username)
      setName(currentAccount.name)
    }
  }, [currentAccount])

  useEffect(() => {
    // get launch param from querystring
    const urlParams = new URLSearchParams(window.location.search);
    const launchParam = urlParams.get('launch');
    console.log("launch", { launchParam })
    if (launchParam !== "false") 
    launch()
  }, [])

  return (
    <>
      <AuthenticatedTemplate>
        {/* <Calendar /> */}
        <div className="w-[380px] mx-auto m-4 text-center">
          <h4>Welcome {name}!</h4>
          <p>How to make the most of BeOnTime:</p>
          <ol className="text-left list-outside list-decimal">
            <li>Open the page in Chrome</li>
            <li>Click the vertical dots menu at the top right</li>
            <li>Open the "More Tools" menu</li>
            <li>Click "Create shortcut"</li>
            <li>Make sure you check "Open as window"</li>
            <li>Click "Create"</li>
            <li>The countdown will open in a new window</li>
            <li>Right-click the icon in your dock/taskbar and pin it for easy access</li>
          </ol>
          <p>Open the <button onClick={launch} className="text-green-800 underline">countdown</button> to see your events listing</p>
          <small>note: meetings with a red background have your manager attending - don't miss these 🙊</small>
        </div>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        {/* <AuthButton /> */}
      </UnauthenticatedTemplate>
    </>
  )
}