// convert datetime from UTC to local
export function datetimeToLocal(datetime) {
  var date = new Date(`${datetime}Z`);
  var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

  var offset = date.getTimezoneOffset() / 60;
  var hours = date.getHours();

  newDate.setHours(hours - offset);

  return date;
}

//launch countdown
export const launch = () => {
  const w = window.open("/countdown", "_blank", {
    width: window.screen.width,
    height: 145,
    top: 0,
    left: 0,
  })
  w.resizeTo(window.screen.width, 145)
  w.focus()
  window.close()
}