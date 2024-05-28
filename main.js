import { getSettings, initialize } from './initialize.js';

import { restart } from './utils.js';
import { globalData } from './globalData.js';




const smartDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());


// let allDevices = [];

jQuery(function () {
  console.log("dom loaded");
  $("*").contents().filter(function () {
    return this.nodeType == 8;
  }).remove();
  console.log("allDevices:", globalData.allDevices);
});


jQuery(() => {
  $("#lightsToggle").on("click", togglePanels);
  $("#switchesToggle").on("click", togglePanels);
  $("#dimmersToggle").on("click", togglePanels);
  $("#locksToggle").on("click", togglePanels);
  $("#thremostatsToggle").on("click", togglePanels);
  $("#showAll").on("click", togglePanels);
  $("#refreshValues").on("click", refreshValues);

  function togglePanels(e) {
    const background = $(":root").css("--baseBackground");

    switch (this.id) {
      case "lightsToggle":
        console.log("case: ", "lightsToggle");
        $(document.body).css("background", background);
        $("#lightsCol").removeAttr("hidden");
        $("#otherSwitchesCol").attr("hidden", true);
        $("#dimmersCol").attr("hidden", true);
        $("#lightsToggle").addClass("active");
        $("#switchesToggle").removeClass("active");
        $("#dimmersToggle").removeClass("active");
        break;

      case "switchesToggle":
        console.log("case: ", "switchesToggle");
        $(document.body).css("background", background);
        $("#otherSwitchesCol").removeAttr("hidden");
        $("#lightsCol").attr("hidden", true);
        $("#dimmersCol").attr("hidden", true);
        $("#locksCol").attr("hidden", true);
        $("#lightsToggle").removeClass("active");
        $("#switchesToggle").addClass("active");
        $("#dimmersToggle").removeClass("active");
        $("#locksToggle").removeClass("active");
        break;

      case "dimmersToggle":
        console.log("case: ", "dimmersToggle");
        if (smartDevice) {
          $("body").css("background", "url(/images/klein_explosion.jpg)  no-repeat center center fixed");
        } else {
          $("body").css("background", "url(/images/klein_explosion.jpg)  no-repeat ");
        }
        $("#dimmersCol").removeAttr("hidden");
        $("#lightsCol").attr("hidden", true);
        $("#otherSwitchesCol").attr("hidden", true);
        $("#locksCol").attr("hidden", true);
        $("#thermostatsCol").attr("hidden", true);
        $("#lightsToggle").removeClass("active");
        $("#switchesToggle").removeClass("active");
        $("#dimmersToggle").addClass("active");
        $("#locksToggle").removeClass("active");
        $("#thremostatsToggle").removeClass("active");
        break;

      case "locksToggle":
        console.log("case: ", "locksToggle");
        if (smartDevice) {
          $("body").css("background", `${$(":root").css("--locksBackground")}  no-repeat center center fixed`);
        } else {
          $("body").css("background", `${$(":root").css("--locksBackground")} no-repeat`);
        }
        $("#locksCol").removeAttr("hidden");
        $("#lightsCol").attr("hidden", true);
        $("#dimmersCol").attr("hidden", true);
        $("#otherSwitchesCol").attr("hidden", true);
        $("#thermostatsCol").attr("hidden", true);
        $("#locksToggle").addClass("active");
        $("#lightsToggle").removeClass("active");
        $("#switchesToggle").removeClass("active");
        $("#dimmersToggle").removeClass("active");
        $("#thremostatsToggle").removeClass("active");
        break;

      case "thremostatsToggle":
        $(document.body).css("background", $(":root").css("--thermostatsBackground"));
        $("#thermostatsCol").removeAttr("hidden");
        $("#locksCol").attr("hidden", true);
        $("#lightsCol").attr("hidden", true);
        $("#dimmersCol").attr("hidden", true);
        $("#otherSwitchesCol").attr("hidden", true);
        $("#thremostatsToggle").addClass("active");
        $("#locksToggle").removeClass("active");
        $("#lightsToggle").removeClass("active");
        $("#switchesToggle").removeClass("active");
        $("#dimmersToggle").removeClass("active");
        break;

      case "showAll":
        if (smartDevice) {
          $("body").css("background", "url(/images/klein_explosion.jpg)  no-repeat center center fixed");
        } else {
          $("body").css("background", "url(/images/klein_explosion.jpg)  no-repeat ");
        }
        $("#lightsCol").removeAttr("hidden");
        $("#otherSwitchesCol").removeAttr("hidden");
        $("#dimmersCol").removeAttr("hidden");
        $("#locksCol").removeAttr("hidden");
        $("#thermostatsCol").removeAttr("hidden");
        $("#lightsToggle").addClass("active");
        $("#switchesToggle").addClass("active");
        $("#dimmersToggle").addClass("active");
        $("#locksToggle").addClass("active");
        $("#thremostatsToggle").addClass("active");
        break;
    }
    $("body").css({
      "-webkit-background-size": "cover",
      "-moz-background-size": "cover",
      "-o-background-size": "cover",
      "background-size": "cover",
      "background-size": "100vw 100vh",
      "background-attachment": "fixed"
    });
  }

  // $("#dimmersToggle").trigger("click")
  $("#lightsToggle").trigger("click");
  // $("#thremostatsToggle").trigger("click")
  // $("#locksToggle").trigger("click")
});

//reload every 10 hours to refresh with recent modifications (new devices, UI changes, etc.)
setTimeout(restart, 10 * 60 * 60 * 1000);