var XPConfig = {
  appKey: "UDb8c5FAtUmV9nPlxYJrjIOJIjqmMBFT",
  backendUrl: "https://api.xtremepush.com",
};
var XPEnvironment = { sdkKey: "xtremepush", version: "1.7.3" };
if (typeof event == "undefined") {
  self.addEventListener("install", function (event) {
    event.waitUntil(XPHandleInstall(event));
  });
  self.addEventListener("activate", function (event) {
    event.waitUntil(XPHandleActivate(event));
  });
  self.addEventListener("push", function (event) {
    if (event.data) {
      data = event.data.json();
      XPLog("Encrypted push received: ", data);
      XPApiRequest("/push/api/actionDelivered", { action_id: data.id });
      self.registration
        .showNotification(data.title, {
          body: data.alert,
          icon: data.icon,
          image: data.image,
          tag: data.id,
          data: data,
          requireInteraction: data["require-interaction"] ? true : false,
          actions: data.actions,
        })
        .catch(function (err) {
          XPLog(err);
        });
    } else {
      event.waitUntil(XPHandlePush(event));
    }
  });
  self.addEventListener("notificationclick", function (event) {
    event.waitUntil(XPHandleNotificationClick(event));
  });
  self.addEventListener("notificationclose", function (event) {
    event.waitUntil(XPHandleNotificationClose(event));
  });
}
var XPHandlePush = function (event) {
  return new Promise(function (resolve, reject) {
    XPLog("Push notification received");
    XPApiRequest("/push/api/pushListActual", {})
      .then(function (data) {
        if (data.actions && data.actions.length) {
          XPLog("Push notifications list retrieved: ", data.actions);
          var notificationsCount = data.actions.length;
          var notificationsProcessed = 0;
          for (var i = 0; i < data.actions.length; i++) {
            self.registration
              .showNotification(data.actions[i].title, {
                body: data.actions[i].alert,
                icon: data.actions[i].icon,
                image: data.actions[i].image,
                tag: data.actions[i].id,
                data: data.actions[i],
                requireInteraction: data.actions[i]["require-interaction"]
                  ? true
                  : false,
                actions: data.actions[i].actions,
              })
              .then(function () {
                if (++notificationsProcessed >= notificationsCount) {
                  resolve();
                }
              })
              .catch(function (err) {
                XPLog(err);
                if (++notificationsProcessed >= notificationsCount) {
                  reject(err);
                }
              });
          }
        } else {
          XPLog("Empty push notifications list retrieved");
          resolve();
        }
      })
      .catch(function (err) {
        XPLog("Unable to retrieve push notifications list: ", err);
        reject(err);
      });
  });
};
var XPHandleNotificationClick = function (event) {
  return new Promise(function (resolve, reject) {
    var notification = event.notification.data;
    var action = event.action;
    var url = null;
    if (!action) {
      XPLog("Push notification clicked: ", notification.id);
      url = notification.url;
    } else {
      XPLog("Push notification button clicked: ", notification.id, action);
      for (var b = 0; b < notification.actions.length; b++) {
        if (notification.actions[b].action == action) {
          url = notification.actions[b].url;
          break;
        }
      }
    }
    event.notification.close();
    if (url && clients.openWindow) {
      clients
        .openWindow(url)
        .then(function () {
          resolve();
        })
        .catch(function (err) {
          reject(err);
        });
    } else {
      resolve();
    }
  });
};
var XPHandleNotificationClose = function (event) {
  return new Promise(function (resolve, reject) {
    var notification = event.notification.data;
    XPLog("Push notification closed: ", notification.id);
    XPApiRequest("/push/api/actionHit", {
      action_id: notification.id,
      close: 1,
    })
      .then(function () {
        XPLog("Notification close event is tracked");
        resolve();
      })
      .catch(function (err) {
        XPLog("Unable to track notification close event: ", err);
        reject(err);
      });
  });
};
var XPHandleInstall = function (event) {
  return new Promise(function (resolve, reject) {
    XPLog("Installing service worker");
    self
      .skipWaiting()
      .then(function () {
        resolve();
      })
      .catch(function () {
        reject();
      });
  });
};
var XPHandleActivate = function (event) {
  return new Promise(function (resolve, reject) {
    XPLog("Activating service worker");
    XPApiRequest("/push/api/swActivate", {})
      .then(function () {
        XPLog("Activate event is tracked");
        resolve();
      })
      .catch(function (err) {
        XPLog("Unable to track activate event: ", err);
        resolve();
      });
  });
};
var XPApiRequest = function (action, data) {
  return new Promise(function (resolve, reject) {
    self.registration.pushManager
      .getSubscription()
      .then(function (subscription) {
        if (subscription || XPGetParam("id")) {
          data.id = XPGetParam("id");
          data.key = XPGetParam("key");
          data.appkey = XPConfig.appKey;
          data.sw_version = XPEnvironment.version;
          if (subscription) {
            if (subscription.subscriptionId) {
              data.token = subscription.subscriptionId;
            } else {
              var matches = subscription.endpoint.match(/([^\/]+)$/);
              data.token = matches[0];
            }
          }
          var req_url = XPConfig.backendUrl + action;
          var req_data = JSON.stringify(data);
          XPLog("Requesting " + req_url + " with data: " + req_data);
          fetch(req_url, {
            method: "post",
            body: req_data,
            credentials: "include",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
              Accept: "application/json",
            },
          })
            .then(function (response) {
              if (response.status == 200) {
                response.json().then(function (data) {
                  if (!data.error) {
                    resolve(data);
                  } else {
                    reject(data.error);
                  }
                });
              } else {
                reject("HTTP Error " + response.status);
              }
            })
            .catch(function (err) {
              reject(err);
            });
        } else {
          reject("Both push subscription and device id are not found");
        }
      })
      .catch(function (err) {
        reject(err);
      });
  });
};
var XPGetParam = function (name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(self.location.search);
  if (results) {
    return decodeURIComponent(results[1].replace(/\+/g, " "));
  } else {
    return null;
  }
};
var XPLog = function () {
  if (XPGetParam("debug_logs")) {
    var log = Array.prototype.slice.call(arguments);
    log.unshift(
      XPEnvironment.sdkKey.charAt(0).toUpperCase() +
        XPEnvironment.sdkKey.slice(1) +
        " Service Worker:"
    );
    console.log.apply(console, log);
  }
};
if (typeof event != "undefined") {
  var handler;
  if (event.type == "push") {
    handler = XPHandlePush(event);
  }
  if (event.type == "notificationclick") {
    handler = XPHandleNotificationClick(event);
  }
  if (event.type == "install") {
    handler = XPHandleInstall(event);
  }
  handler
    .then(function () {
      resolve();
    })
    .catch(function () {
      reject();
    });
}
