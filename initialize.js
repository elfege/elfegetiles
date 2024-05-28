import { sendCommand, updateDeviceState, trimLabel, WebSocket_init, restart } from './utils.js';
import { RequestQueue } from './requestQueue.js';
import { overlayOn } from './utils.js';
import { globalData } from './globalData.js';


let everythingUrl;
let modesUrl;
let labelLength = 35;

const requestQueue = new RequestQueue(5); // Set the concurrency limit to 5

async function initializeApp() {
  try {
    await getSettings();
    await initialize();
    // console.log(globalData.allDevices);
  } catch (error) {
    console.log("Error during initialization:", error);
    overlayOn("SOMETHING WENT WRONG");
    setTimeout(restart, 5000);
  }
}

export async function getSettings() {
  globalData.response = await axios.get("\\settings.json");
  console.log("response.data => ", globalData.response.data);
  globalData.access_token = globalData.response.data.access_token;
  globalData.ip = globalData.response.data.ip;
  globalData.appNumber = globalData.response.data.appNumber;
  everythingUrl = "http://" + globalData.ip + "/apps/api/" + globalData.appNumber + "/devices/all?access_token=" + globalData.access_token;
  modesUrl = "http://" + globalData.ip + "/apps/api/" + globalData.appNumber + "/modes/all?access_token=" + globalData.access_token;
  getMode(modesUrl);
}


await initializeApp();

export async function initialize() {
  console.log("initialize...");
  const ip = globalData.ip
  const appNumber = globalData.appNumber
  const access_token = globalData.access_token
  const allDevices = globalData.allDevices

  WebSocket_init(ip, allDevices);
  await axios.get(everythingUrl).then(res => {
    console.log("res.data instanceof Object", res.data instanceof Object);
    console.log("Array.isArray(res.data)", Array.isArray(res.data));

    const d = res.data[0].id;
    console.log(d, "is Integer", " ", Number.isInteger(d));

    // sort all data by labels by alphab. order. 
    const array = [];
    res.data.forEach((e) => {
      array.push(e.label);
    });
    array.sort().forEach((e) => {
      allDevices.push(res.data.find(it => it.label === e));
    });

    allDevices.forEach((e, index) => {
      const id_From_Hub = e.id;

      const isLock = e.capabilities.find(el => el === "Lock");
      const isLight = e.name.toLowerCase().includes("light") || e.label.toLowerCase().includes("light");
      const isSwitchLevel = e.capabilities.includes("SwitchLevel");
      const isSwitch = e.capabilities.includes("Switch") && !isSwitchLevel;
      const isWindow = e.label.toLowerCase().includes("window");
      const isthermostat = e.capabilities.includes("Thermostat");
      const isPowerMeterOnly = e.capabilities.includes("PowerMeter") && !isSwitch;

      let notAButton = !e.capabilities.find(el => el.toLowerCase().includes("button"));

      notAButton = notAButton
        ? notAButton
        : e.type.toLowerCase().includes("button")
          ? false
          : true;

      const deviceType = isLock
        ? "lock"
        : isSwitchLevel
          ? "dimmer"
          : isLight
            ? "light"
            : "otherSwitch";

      if (e.label.toLowerCase().includes("window")) {
        let { name, ...other } = e;
        // console.log(name, other)
      }
      if (notAButton && (isLight || isLock || isSwitchLevel || isSwitch)) {
        if (isLight) {
          const id_html = id_From_Hub + "light";

          $("#lights").append(
            $("<button>")
              .addClass("btn btn-primary tiles")
              .attr({ id: id_html, "data-id_From_Hub": id_From_Hub, "data-device-type": `${deviceType}` })
              .text(trimLabel(e.label, labelLength))
              .append($("<img>").attr({
                "src": "images/lightOff.png",
                "id": "bulb" + id_From_Hub
              }).css({
                "position": "relative",
                "float": "left",
                "left": "0px"
              }))
          );

          $(`#${id_html}`).on("click", () => {
            console.log("id_From_Hub => ", id_From_Hub);
            const url = `http://${ip}/apps/api/${appNumber}/devices/${id_From_Hub}/toggle?access_token=${access_token}`;
            sendCommand(url);
          });

          const state = e.attributes.switch;
          // console.log("e.currentValue = ", state)
          if (state === "on") {
            $(`#bulb${id_From_Hub}`).attr("src", "images/lightOn.png");
          }
          else {
            $(`#bulb${id_From_Hub}`).attr("src", "images/lightOff.png");
          }
          const clsRemove = state === "on"
            ? "off"
            : "on";
          $(`#${id_html}`).removeClass(clsRemove);
          $(`#${id_html}`).addClass(state);
        }
        if (isSwitchLevel) {
          const id_From_Hub_level = id_From_Hub;
          const id_html = id_From_Hub_level + "leveldiv";
          const idspan = id_From_Hub_level + "dimSpan";
          const label = trimLabel(e.label, labelLength);

          /******************CREATE DIMMERS****************** */
          // console.log(index)
          $("#dimmers").append($("<div>").attr("id", id_html).addClass("float-left mt-5 mr-2 text-center dimmerObject").roundSlider().attr({
            id: id_html, "data-id_From_Hub_level": id_From_Hub_level, // every dimmer is also a switch, so we need a different data attr here.
            "data-device-type": `${deviceType}`
          }));

          // Call the roundSlider
          $(`#${id_html}`).roundSlider();
          //create object
          const Obj = $(`#${id_html}`).data("roundSlider");
          //enable svg Mode
          Obj.option("svgMode", true);

          // prepend device name to leveldiv => must be done after enabling svg mode
          $(`#${id_html}`).prepend($("<span>").attr({
            id: idspan, "data-id_From_Hub": id_From_Hub, // we want the switch on/off value here
            "data-spandimmer-state": ""
          }).addClass("spanDimmer").text(label));

          $(`#${id_html}`).on("change", function (evt) {
            const url = `http://${ip}/apps/api/${appNumber}/devices/${id_From_Hub_level}/setLevel/${evt.value}?access_token=${access_token}`;
            sendCommand(url);
          });

          const level = e.attributes.level;

          Obj.option("value", level);

          updateDeviceState(id_From_Hub_level, id_html, "switch&Level", notAButton, level); // request update for its on/off switch state
        }
        if (isLock) {
          const id_html = id_From_Hub + "lock";

          // console.log("/************************CREATE LOCKS ********************************/");
          $("#rowLocks").append($("<div>").addClass("col-lg-fill"))
            .append($("<button>")
              .addClass("btn btn-primary tiles")
              .attr({ id: `${id_html}`, "data-id_From_Hub": id_From_Hub, "data-device-type": "lock" })
              .text(trimLabel(e.label.toLowerCase().replace("lock", "")))
              .css("text-transform", "capitalize"));

          const state = e.attributes.lock;
          const classToRemove = state === "locked"
            ? "btn btn-success bi bi-unlock"
            : "btn btn-warning bi bi-lock";

          const classToAdd = state === "locked"
            ? "btn btn-warning bi bi-lock"
            : "btn btn-success bi bi-unlock";

          $(`#${id_html}`).removeClass(classToRemove).addClass(classToAdd);

          $(`#${id_html}`).on("click", () => {
            axios.get(`http://${ip}/apps/api/${appNumber}/devices/${id_From_Hub}?access_token=d6699bb3-0d13-48d1-ab5d-8cc583efa76c`).then(resp => {
              const data = resp.data;
              console.log("data => ", data);
              const state = data.attributes.find(val => {
                if (val.name === "lock") {
                  return val.currentValue;
                }
              }).currentValue;
              console.log(
                `${data.label} is ${state}. ${state === "locked"
                  ? "unlocking"
                  : "locking"}`);
              const cmd = state === "locked"
                ? "unlock"
                : "lock";
              const url = `http://${ip}/apps/api/${appNumber}/devices/${data.id}/${cmd}?access_token=${access_token}`;
              sendCommand(url);
            });
          });
        }

        /************************ALL OTHER DEVICES + all dimmers as switch buttons********************************/

        if (!isLight && !isLock && (isSwitch || isSwitchLevel)) {
          const id_html = id_From_Hub + "switch";

          $("#switches").append($("<button>").addClass("btn btn-primary tiles").attr({ id: id_html, "data-id_From_Hub": id_From_Hub, "data-device-type": `${deviceType}` }).text(trimLabel(e.label, labelLength)));

          const hasPower = Object.values(e.attributes).find(val => val === "power");
          if (e.attributes.power !== null && e.attributes.power !== undefined) {
            $(`#${id_html}`).text(`${e.label} \n ${e.attributes.power}W`);
          }
          if (e.label.toLowerCase().includes("fan")) {
            const imgpath = e.attributes.switch === "on"
              ? "/images/fan.gif"
              : "/images/fan.png";
            $(`#${id_html}`).append($("<img>").addClass("img-fluid").attr("src", imgpath).css({ width: "20%", "z-index": "20" }));
          }

          $(`#${id_html}`).on("click", () => {
            const url = `http://${ip}/apps/api/${appNumber}/devices/${id_From_Hub}/toggle?access_token=${access_token}`;
            sendCommand(url);
          });

          updateDeviceState(id_From_Hub, id_html, "switch", notAButton);
        }
      }
      if (isthermostat) {
        $("#thermostats").append(`
          <section class="thermostatWrap">
            <span class="spanThermostat"> ${e.label}</span>
            <div class="thermostat"> 
            <div class="temperature" id=temperature${id_From_Hub} role="slider" aria-valuenow="72" aria-valuemin="0" aria-valuemax="100"></div> 
            </div>
            <div class="sliderWrapper"><input class="tempSlider" id=thermostat${id_From_Hub} type="range" value="72" min="0" max="100" /></div>
          </section> 
        `);

        const radiusPercent = $(`#temperature${id_From_Hub}`);
        const slider = $(`#thermostat${id_From_Hub}`);

        const increment = (radius) => {
          const value = `${radius}%`;
          radiusPercent.attr("aria-valuenow", value);
          radiusPercent.css("--radius", value);
          radiusPercent.html(parseFloat(value));
        };

        const currentValue = e.attributes.thermostatSetpoint;

        // console.log(e.label, " value => ", currentValue)
        increment(currentValue);

        // change ui while sliding
        slider.on("input", (evt) => {
          console.log("evt ============> ", evt.target.value);

          increment(evt.target.value);
        });

        //send command once mouse is up 
        slider.on("change", (evt) => {
          const url = `http://${ip}/apps/api/${appNumber}/devices/${id_From_Hub}/setLevel/${evt.target.value}?access_token=${access_token}`;
          console.log(url);
          // TODO : thermostats specific commands... 
          // sendCommand(url);
        });
      }
      if (isPowerMeterOnly) {
        console.log(e.label, " is a power meter");
        const v = e.attributes.power;
        if (v !== null && v !== undefined) {
          const nav = $("#row-nav-buttons");
          nav.prepend(`
            <div id="power${id_From_Hub}" class="col-fluid m-1 block">
              <button id="pwr${id_From_Hub}" class="btn btn-outline-warning bt-block navButton m-0">POWER</button>
            </div>
            `);
          const value = `${v} Watts`;
          console.log(value);
          $(`#pwr${id_From_Hub}`).text(value);
        }
      }
    });
  }).then(resp => {
    $("#loading_message_container").remove();
    $("#master_container").removeAttr("hidden");
  }).catch(error => {
    console.log("error: ", error);

    // $("div").remove()
    $("body").append($("<div class='col-lg-4'>").text(`
      Hubitat isn't responding.
      \n${JSON.stringify(error)}
    `).css("color", "white"));
    overlayOn("Page will reload in 2 seconds...");
    setTimeout(restart, 5000);
  });
}

async function getMode(url) {
  axios.get(modesUrl)
    .then(modes => {
      const all = modes.data;
      // console.log("modes: ", all)
      const currentMode = all.find(e => e.active).name;
      console.log("currentMode => ", currentMode);
      $("#currentMode").text(currentMode);

      // const drop = $("#modesDrop")
      for (let m of all) {
        // console.log("***********", m.name)
        $("#modesDrop").append(
          $("<a>").attr({
            "id": `${m.name}Mode`,
            "href": `javascript:setMode("${m.name}", "${m.id}")`
          })
            .addClass("dropdown-item")
            .text(m.name)
        );
      }
    })
    .catch(err => console.log("ERROR GETTING MODES => ", err));
}

async function setMode(mode, id) {
  console.log("setting location mode to ", mode);

  const url = "http://" + ip + "/apps/api/" + appNumber + "/modes/" + id + "?access_token=" + access_token;
  requestQueue.enqueue(() => axios.get(url)
    .then(resp => console.log(resp))
    .catch(err => console.log("Mode Update failed => ", err)));

  //other hubs?
  const response = await axios.get("\\settings.json");

  for (let i = 0; i < Object.values(response.data.otherHubs).length; i++) {
    const ip_ = Object.values(response.data.otherHubs)[i];
    const appNumb = Object.values(response.data.otherHubsAppNumbers)[i];
    const token = Object.values(response.data.otherHubsTokens)[i];
    console.log("updating mode for ip:", ip_, " index: ", i, " appNumb:", appNumb, " token:", token);

    const u = "http://" + ip_ + "/apps/api/" + appNumb + "/modes/" + id + "?access_token=" + token;
    requestQueue.enqueue(() => axios.get(u)
      .then(resp => console.log(resp))
      .catch(err => console.log("Mode Update failed => ", err)));
  }
}