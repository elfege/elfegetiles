import { RequestQueue } from './requestQueue.js';
import { globalData } from './globalData.js';



const requestQueue = new RequestQueue(5); // Set the concurrency limit to 5

export async function sendCommand(cmdurl) {
  requestQueue.enqueue(() => axios.get(cmdurl)
    .then(resp => {
      console.log(resp);
    })
    .catch(err => console.log(err)));
}

export async function updateDeviceState(id_From_Hub, id_html, type, notAButton, value) {
  const ip = globalData.ip
  const appNumber = globalData.appNumber
  const access_token = globalData.access_token


  console.log("ip => ", ip)
  console.log("appNumber => ", appNumber)
  console.log("access_token => ", access_token)
  
  const url = `http://${ip}/apps/api/${appNumber}/devices/${id_From_Hub}?access_token=${access_token}`;
  requestQueue.enqueue(() => axios.get(url).then(resp => {
    const data = resp.data;
    const state = data.attributes.find(val => {
      if (val.name === "switch") {
        return val.currentValue;
      }
    })?.currentValue;

    //only devices with switch attribute, without level attribute
    if (type !== "switch&Level" && type !== "lock") {
      const clsRemove = state === "on" ? "off" : "on";
      $(`#${id_html}`).removeClass(clsRemove);
      $(`#${id_html}`).addClass(state);
    }

    // if the switch is also a dimmer, update slider with the dimmer's switch attribute value
    if (type === "switch&Level") {
      let color = value > 0 && state === "on"
        ? $(":root").css("--onColor")
        : $(":root").css("--offColorSlider");

      let spanDimmerColor = value > 0 && state === "on"
        ? $(":root").css("--spanDimmerOn")
        : $(":root").css("--spanDimmerOff");

      $(`#${id_From_Hub}dimSpan`).css("color", spanDimmerColor);

      $(`#${id_html}`).roundSlider();
      const Obj = $(`#${id_html}`).data("roundSlider");

      Obj.option("value", value);
      Obj.option("tooltipColor", color);
      Obj.option("borderColor", color);
      Obj.option("pathColor", color);
    }
  }));
}

export function updateDimmerState(device, deviceId, evtName, value) {
  const state = parseInt(value) > 0 ? "on" : "off";
  const color = state === "on"
    ? $(":root").css("--onColor")
    : $(":root").css("--offColorSlider");

  const devAsDimSpan = $(`#${deviceId}dimSpan`);

  devAsDimSpan.css("color", color);

  if (evtName === "switch") {
    console.log("******************");
    const clsRemove = value === "on" ? "off" : "on";
    console.log("updating state class for ", device);
    console.log("removing class", clsRemove);
    device.removeClass(clsRemove);
    console.log("adding class ", value);
    device.addClass(value);

    if (value === "on") {
      $(`#bulb${deviceId}`).attr("src", "images/lightOn.png");
    }
    else {
      $(`#bulb${deviceId}`).attr("src", "images/lightOff.png");
    }
  }

  // select the ROUNDSLIDER object
  const devAsSlider = $(`*[data-id_From_Hub_level="${deviceId}"]`);
  devAsSlider.roundSlider();

  //update object's path, tooltip and border colors whether it's an on/off or a level event
  const Obj = devAsSlider.data("roundSlider");
  Obj.option("tooltipColor", color);
  Obj.option("borderColor", color);
  Obj.option("pathColor", color);

  if (evtName == "level") {
    // only if it's a level event
    Obj.option("value", value);
  }
}


export function trimLabel(label, length) {
  label = label.replace(")", "")
    .replace("(", "")
    .replace("-", "")
    .replace("OFFLINE", "")
    .replace("on Home 1", "")
    .replace("on Home 2", "")
    .replace("on Home 3", "")
    .replace("on HOME 1", "")
    .replace("on HOME 2", "")
    .replace("on HOME 3", "")
    .replace("temperature", "temp.")
    .replace("Temperature", "temp.");

  if (label.length > length) {
    label = label.substr(0, length);
  }
  return label;
}

export function overlayOn(text) {
  const o = $("#overlay");
  o.css("display", "block");
  $("#OverlayText").html(text + "  ");
  $("#OverlayText").append($("<button>").addClass("btn btn-primary").text("RELOAD").on("click", restart));
}

export function overlayOff() {
  document.getElementById("overlay").style.display = "none";
}

export function WebSocket_init(ip, allDevices) {
  console.log("ip => ", ip);

  // Create WebSocket connection.
  const socket = new WebSocket(`ws://${ip}/eventsocket`);

  // Connection opened
  socket.addEventListener("open", event => {
    socket.send("Hello Server!");
  });

  // Listen for messages
  socket.addEventListener("message", event => {
    const evt = JSON.parse(event.data);
    console.log(evt.displayName, evt.name, "is", evt.value);

    const isDimCapable = allDevices.find(el => el.id === `${evt.deviceId}`)
      ?.capabilities
      ?.find(el => el === "SwitchLevel");

    const device = evt.name !== "level"
      ? $(`*[data-id_From_Hub="${evt.deviceId}"]`)
      : $(`*[data-id_From_Hub_level="${evt.deviceId}"]`);

    const states = ["on", "off", "locked", "unlocked"];

    if (evt.name === "power") {
      $(`#${evt.deviceId}switch`).text(`${evt.displayName} \n ${evt.value}W`);

      const mainPow = document.getElementById(`pwr${evt.deviceId}`);
      console.log("*********mainPow = ", mainPow);
      if (mainPow !== null) {
        console.log("----------------MAIN POWER METER EVT-----------------");
        $(`#pwr${evt.deviceId}`).text(`${evt.value} Watts`); //update main power meter's value, if any
      }
    } else if (evt.name === "lock") {
      const classToRemove = evt.value === "locked"
        ? "btn btn-warning bi bi-unlock"
        : "btn btn-success bi bi-lock";

      const classToAdd = evt.value === "locked"
        ? "btn btn-warning bi bi-lock"
        : "btn btn-success bi bi-unlock";

      $(`#${evt.deviceId}lock`).removeClass(classToRemove).addClass(classToAdd);

      // DIMMERS
    } else if (evt.name === "level") {
      updateDimmerState(device, evt.deviceId, evt.name, evt.value);

      // switches or devices as switches
    } else if (states.find(e => e === evt.value)) {
      if (isDimCapable) {
        //switch with level capab.
        updateDimmerState(device, evt.deviceId, evt.name, evt.value);
      } else {
        // for regular tiles only
        const clsRemove = evt.value === "on"
          ? "off"
          : "on";

        if (evt.value === "on") {
          $(`#bulb${evt.deviceId}`).attr("src", "images/lightOn.png");
        }
        else {
          $(`#bulb${evt.deviceId}`).attr("src", "images/lightOff.png");
        }
        device.removeClass(clsRemove);
        // console.log("Adding class ", evt.value);
        device.addClass(evt.value);
      }

      if (evt.displayName.toLowerCase().includes("fan")) {
        const tile = $(`#${evt.deviceId}switch`);
        const imgpath = evt.value === "on"
          ? "/images/fan.gif"
          : "/images/fan.png";

        $(`#${evt.deviceId}switch img:last-child`).remove();
        $(`#img${evt.deviceId}switch`).remove();

        tile.append($("<img>").addClass("img-fluid").attr({ src: imgpath, id: `img${evt.deviceId}switch` }).css({ width: "20%", "z-index": "20" }));

        tile.removeAttr("src");

        console.log(`***************${evt.deviceId}`);
      }
    }
  });

  socket.addEventListener("close", event => {
    overlayOn("connexion to server closed... The hub is probably reloading or shut down. Please wait about 60s.  ");
    setTimeout(restart, 60000);
  });

  socket.addEventListener("failed", event => {
    overlayOn("connexion to server failed... The hub is probably reloading or shut down. Please wait about 60s.  ");
    setTimeout(restart, 60000);
  });
}



export async function refreshValues() {
  console.log("REFRESHING ALL DEVICES VALUES");
  console.log("allDevices:", globalData.allDevices);
  for (const device of globalData.allDevices) {
    const url = `http://${ip}/apps/api/${appNumber}/devices/${device.id}/refresh?access_token=${access_token}`;
    if (device.capabilities.includes("Refresh")) {
      requestQueue.enqueue(() => axios.get(url)
        .then(response => {
          console.log(`${device.name} Refresh successful : ${response.data}`);
        })
        .catch(error => {
          console.log("Error refreshing:", error);
        }));
    }
  }
}

export function restart() {
  location.reload();
}