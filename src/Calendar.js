import React, { useContext, useEffect } from 'react';
import { Table } from 'reactstrap';
import moment from 'moment';
import config from './Config';
import { getEvents } from './GraphService';
import Countdown from 'react-countdown-now';
import styled, { keyframes } from 'styled-components';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsalAuthentication } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { graphFetch } from './graphFetch';
import { datetimeToLocal } from './utils';
import { UserContext } from './App';

export default function Calendar(props) {
  let { events } = useContext(UserContext);
  events = events?.filter(e => !e.isAllDay && !e.isCancelled && (moment(datetimeToLocal(e.start.dateTime)) > moment(Date.now())));
  const next = events?.length > 0 && events[0];

  // set the window to full width and 100px tall
  useEffect(() => {
    window.resizeTo(window.screen.width, 145)
    window.moveTo(0,0)
  }, [])

  return <>
    <AuthenticatedTemplate>
      {next &&
        <CalendarEntry entry={next} next={true} />
      }
      {events?.length > 1 && 
        <div className="text-center font-bold my-4">Upcoming Events</div>
      }
      {events?.filter((e, i) => i > 0).map((e, i) => 
        <CalendarEntry key={i} entry={e} />
      )}
    </AuthenticatedTemplate>
    <UnauthenticatedTemplate>
      <div className="mx-auto text-3xl text-center">You must be logged in to view meetings...</div>
    </UnauthenticatedTemplate>
  </>
}

function CalendarEntry({entry, next}) {
  const [warn, setWarn] = React.useState(false);
  const [joined, setJoined] = React.useState(false);
  const [reallyWarn, setReallyWarn] = React.useState(false);
  const [startingNow, setStartingNow] = React.useState(false);
  const {me, manager} = useContext(UserContext)
  // console.log({me, manager})
  const withMgmt = entry.attendees.find(a => a.emailAddress.address === manager?.mail);
  const onTick = (delta) => {
    // console.log(delta);
    setWarn(false);
    setReallyWarn(false);
    setStartingNow(false);
    if (delta.days === 0 && delta.hours === 0 && delta.minutes < 10) {
      setWarn(true);
      setReallyWarn(delta.minutes < 1);
      setStartingNow(delta.minutes < 1 && delta.seconds < 30);
    } 
    if (next) {
      // setWarn(true)
      // setReallyWarn(true)
      // setStartingNow(true)
    }
  }

  const handleOpenJoin = (e) => {
    e.preventDefault()
    setJoined(true)
    window.resizeTo(window.screen.width, 145)
    window.moveTo(0,0)
    window.open(e.target.href, "_blank")
  }

  useEffect(() => {
    console.log({warn, reallyWarn, startingNow})
    if (startingNow) {
      window.resizeTo(window.screen.width, window.screen.height)
      window.focus()
    } else {
      window.resizeTo(window.screen.width, 145)
    }
  }, [warn, reallyWarn, startingNow])
  return <div className={`${withMgmt ? `bg-red-100` : `bg-gray-100`} ${next && `h-[100px]`} w-full`}>
    <div className="p-2 h-full flex gap-2 items-center justify-center border-b-8 border-white">
      <div className="w-1/4 text-left leading-4 font-bold">
        <div className="flex gap-">
          <div className="w-2/3 mr-auto">{entry?.subject}</div>
          <div className="text-right w-1/3">{datetimeToLocal(entry?.start?.dateTime).toLocaleString()}</div>
        </div>
        <div className="font-normal text-sm">Organizer: {entry?.organizer?.emailAddress?.name}</div>
      </div>
      <div className={`w-1/2 text-center text-5xl font-bold ${warn || reallyWarn || startingNow ? `text-red-500` : `text-green-600`} ${reallyWarn ? `animate-ping !opacity-100` : ``}`}>
        <Countdown date={datetimeToLocal(entry?.start?.dateTime)} onTick={onTick} />
      </div>
      <div className="w-1/4 flex justify-end gap-2">
        <a onClick={handleOpenJoin} href={entry.webLink} target="_blank" className="bg-blue-600 text-white px-4 py-2 rounded no-underline" rel="noreferrer">Open</a>
        {entry.isOnlineMeeting &&
          <a onClick={handleOpenJoin} href={entry.onlineMeeting.joinUrl} target="_blank" className="bg-purple-800 text-white px-4 py-2 rounded no-underline" rel="noreferrer">Join</a>
        }
      </div>
    </div>
    {startingNow && !joined &&
      <div className="w-full h-full border-8 border-red-500 flex flex-col items-center justify-center z-50 bg-white absolute top-0 left-0">
        <div className="text-5xl font-bold">"{entry.subject}" is starting now</div>
        {withMgmt || true &&
          <div className="my-8 text-3xl font-bold text-red-500">Your manager is attending - don't be late 😘</div>
        }
        <div className={`w-1/2 text-center text-5xl font-bold ${warn || reallyWarn || startingNow ? `text-red-500` : `text-green-600`} ${reallyWarn ? `animate-ping !opacity-100` : ``}`}>
          <Countdown date={datetimeToLocal(entry?.start?.dateTime)} onTick={onTick} />
        </div>
        <div className="mt-4 flex gap-2 text-5xl">
          <a onClick={handleOpenJoin} href={entry.webLink} target="_blank" className="bg-blue-600 text-white px-8 py-4 rounded no-underline" rel="noreferrer">Open</a>
          {entry.isOnlineMeeting &&
            <a onClick={handleOpenJoin} href={entry.onlineMeeting.joinUrl} target="_blank" className="bg-purple-800 text-white px-8 py-4 rounded no-underline" rel="noreferrer">Join</a>
          }
        </div>
      </div>
    }
  </div>
}