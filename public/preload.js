const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  sendSync: ipcRenderer.sendSync
})

// var fakeUserAgentGetter = function () {
//   return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36";
// };

// var fakeAppVersionGetter = function () {
//   return "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36";
// };

// if (Object.defineProperty) {
//   Object.defineProperty(navigator, "userAgent", {
//     value: fakeUserAgentGetter()
//   });

//   Object.defineProperty(Navigator.prototype, "userAgent", {
//     get: fakeUserAgentGetter
//   });

//   Object.defineProperty(navigator, "appVersion", {
//     value: fakeAppVersionGetter()
//   });

//   Object.defineProperty(Navigator.prototype, "appVersion", {
//     get: fakeAppVersionGetter
//   });

// } else if (Object.prototype.__defineGetter__) {
//   console.log("here")
//   navigator.__defineGetter__("userAgent", fakeUserAgentGetter);
//   Navigator.prototype.__defineGetter__("userAgent", fakeUserAgentGetter);

//   navigator.__defineGetter__("appVersion", fakeAppVersionGetter);
//   Navigator.prototype.__defineGetter__("appVersion", fakeAppVersionGetter);
// }


// var fake_navigator = {};

// for (var i in navigator) {
//   fake_navigator[i] =  navigator[i];
// }

// fake_navigator.appVersion = "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36";

// fake_navigator.userAgent =  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36";

// navigator = fake_navigator;
