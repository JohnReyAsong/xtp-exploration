var XPConfig = {
  appKey: "UDb8c5FAtUmV9nPlxYJrjIOJIjqmMBFT",
  backendUrl: "https://api.xtremepush.com",
  iconSmall: null,
  iconLarge: null,
  websiteName: "AYIEBet",
  websiteOrigins: ["https://xtp-exploration.vercel.app"],
  safariPush: false,
  safariPushID: null,
  chromePush: false,
  firefoxPush: false,
  vapidPublicKey:
    "BApP15ozcnqCJiC1JjnJyTPWn5b_iyVIdK9sdbFy25R8o26CQsFW1b6aYYZTUoBz1agWprWapHIRJ5XuIKP5SuM",
  webPushFrame: true,
  webPushHttpWindow: true,
  webPushHttpsWindow: true,
  webPushDescription: null,
  serviceWorkerSourceUrl:
    "https://prod.webpu.sh/UDb8c5FAtUmV9nPlxYJrjIOJIjqmMBFT/service-worker-source.js",
  serviceWorkerWebsiteUrl: null,
  serviceWorkerWindowUrl: null,
  manifestWebsiteUrl: null,
  manifestWindowUrl: null,
  windowUrl: null,
  frameUrl: null,
  promptParams: {
    autoPrompt: true,
    autoPromptStart: 1,
    autoPromptRepeat: 50,
    autoPromptAllowRedirect: null,
    autoPromptBlockRedirect: null,
    autoPromptDismissRedirect: null,
    customPrompt: false,
  },
  notificationCenter: {
    enabled: false,
    color: "light",
    position: "right",
    button: "default",
    layout: "panel",
    switch: false,
    pagination: 10,
  },
  ga: {
    enabled: true,
    trackingID: null,
    dimension: 5,
    dimensionReadonly: false,
    function: "ga",
    tracker: "xtremepush",
  },
  session: { enabled: true, interval: 1800 },
  cookie: { domain: null },
};
var XPTranslations = {
  en: {
    custom_prompt_allow: "Allow",
    custom_prompt_deny: "Don't Allow",
    custom_prompt_text:
      "Website notifications can be changed in browser notifications preferences.",
    custom_prompt_title:
      "{website_name} would like to send you push notifications.",
    notification_center_error_no_push_in_browser:
      "Your browser doesn't support push notifications",
    notification_center_no_notifications: "You have no notifications yet",
    notification_center_show_more: "show more",
    notification_center_status_push_off: "Push Notifications OFF",
    notification_center_status_push_on: "Push Notifications ON",
    notification_center_title: "PERSONAL INBOX",
    notification_center_turn_on_push_in_browser:
      "Please turn on notifications in your browser settings",
    window_error_already_denied_text: "You can turn it on in browser settings",
    window_error_already_denied_title:
      "Seems you denied push notifications before",
    window_error_already_granted_text: "You can close this window",
    window_error_already_granted_title:
      "Seems you are already subscribed for push notifications",
    window_error_direct_open_text: "window_error_direct_open_text",
    window_error_direct_open_title:
      "This window needs to be opened from origin website",
    window_error_fail_text: "You can close this window",
    window_error_fail_title: "Sorry, we're unable to enable push notifications",
    window_text: "Get updates and news from {website_name}",
    window_title: "Click on 'Allow' to enable push notifications",
  },
};
var XPCore = function () {
  var self = this;
  this.isLaunched = false;
  this.isReady = false;
  this.readyCallbacks = [];
  this.lastScrollTop = 0;
  this.debugLogsEnabled = false;
  this.init = function () {
    XPApiInstance = new XPApi();
    XPStoreInstance = new XPStore();
    XPSessionManagerInstance = new XPSessionManager();
    XPUpdateManagerInstance = new XPUpdateManager();
    XPWindowManagerInstance = new XPWindowManager();
    XPFrameManagerInstance = new XPFrameManager();
    XPPushManagerInstance = new XPPushManager();
    XPTranslationInstance = new XPTranslation();
    XPNotificationCenterInstance = new XPNotificationCenter();
    XPGaManagerInstance = new XPGaManager();
    XPPageHelperInstance = new XPPageHelper();
    XPCustomMessageHandlerInstance = new XPCustomMessageHandler();
    if (XPStoreInstance.checkDebugKey()) {
      self.debugLogsEnabled = true;
    }
    return this;
  };
  this.launch = function () {
    this.checkRequirements(function () {
      self.linkStyle();
      XPStoreInstance.launch();
      XPSessionManagerInstance.launch();
      XPUpdateManagerInstance.launch();
      XPApiInstance.launch();
      XPNotificationCenterInstance.launch();
      XPGaManagerInstance.launch();
      self.isLaunched = true;
    });
  };
  this.ready = function () {
    this.isReady = true;
    for (var i = 0; i < this.readyCallbacks.length; i++) {
      setTimeout(
        (function (callback) {
          if (typeof callback == "function") {
            callback();
          }
        })(this.readyCallbacks[i]),
        0
      );
    }
    this.readyCallbacks = [];
  };
  this.deviceReady = function () {
    XPPushManagerInstance.launch();
    this.ready();
  };
  this.tokenUpdated = function (token, permission, pushSenderId, keys) {
    XPStoreInstance.set("token", token);
    XPStoreInstance.set("push_sender_id", pushSenderId);
    XPStoreInstance.set("permission", permission);
    XPStoreInstance.set("push_keys", keys);
    if (this.isLaunched) {
      XPApiInstance.deviceUpdate();
      XPNotificationCenterInstance.updateSubscriptionControls();
    }
  };
  this.addReadyCallback = function (callback) {
    if (this.isReady) {
      callback();
    } else {
      this.readyCallbacks.push(callback);
    }
  };
  this.eventHit = function (title, value) {
    XPApiInstance.eventHit("custom", title, value);
  };
  this.tagHit = function (title, value) {
    XPApiInstance.tagHit(title, value);
  };
  this.impressionHit = function (title) {
    XPApiInstance.impressionHit(title);
  };
  this.pushPermission = function () {
    if (!this.isReady) return null;
    return XPPushManagerInstance.getPermission();
  };
  this.prompt = function (callbacks) {
    XPPushManagerInstance.prompt(callbacks);
  };
  this.autoPrompt = function () {
    XPPushManagerInstance.autoPrompt();
  };
  this.setConfig = function (key, value) {
    var path = key.split(".");
    var child = XPConfig;
    path.forEach(function (i, idx) {
      var name = i.replace(/_[a-zA-Z]{1}/g, function (txt) {
        return txt.charAt(1).toUpperCase();
      });
      if (idx == path.length - 1) {
        child[name] = value;
      } else {
        child = child[name];
      }
    });
  };
  this.setDebugLogsEnabled = function (enabled) {
    this.debugLogsEnabled = enabled;
  };
  this.setAppLanguage = function (app_language, success, error) {
    XPStoreInstance.set("app_language", app_language);
    if (this.isLaunched) XPApiInstance.deviceUpdate(success, error);
  };
  this.setAppVersion = function (app_version, success, error) {
    XPStoreInstance.set("app_version", app_version);
    if (this.isLaunched) XPApiInstance.deviceUpdate(success, error);
  };
  this.setExternalID = function (external_id, success, error) {
    XPStoreInstance.set("external_id", external_id);
    if (this.isLaunched) XPApiInstance.deviceUpdate(success, error);
  };
  this.setUserID = function (user_id, success, error) {
    XPStoreInstance.set("user_id", user_id);
    XPStoreInstance.remove("email");
    if (this.isLaunched) XPApiInstance.deviceUpdate(success, error);
    XPNotificationCenterInstance.cleanInbox();
  };
  this.setGaId = function (ga_id) {
    XPStoreInstance.set("ga_id", ga_id);
    if (self.isLaunched) XPApiInstance.deviceUpdate();
  };
  this.setEmail = function (email, success, error) {
    XPStoreInstance.set("email", email);
    if (this.isLaunched) XPApiInstance.deviceUpdate(success, error);
  };
  this.setSubscription = function (enabled, success, error) {
    XPStoreInstance.set("subscription", enabled);
    if (self.isLaunched) XPApiInstance.deviceUpdate(success, error);
  };
  this.import = function (profile, success, error) {
    if (success === undefined) success = function () {};
    if (error === undefined) error = function () {};
    XPApiInstance.import(profile, success, error);
  };
  this.updateUser = function (userData, success, error) {
    if (success === undefined) success = function () {};
    if (error === undefined) error = function () {};
    XPApiInstance.updateUser(userData, success, error);
  };
  this.getGaId = function () {
    return XPStoreInstance.get("ga_id");
  };
  this.deviceInfo = function () {
    var info = {};
    if (XPStoreInstance.get("id")) info["id"] = XPStoreInstance.get("id");
    if (XPStoreInstance.get("token"))
      info["token"] = XPStoreInstance.get("token");
    if (XPStoreInstance.get("external_id"))
      info["external_id"] = XPStoreInstance.get("external_id");
    if (XPStoreInstance.get("user_id"))
      info["user_id"] = XPStoreInstance.get("user_id");
    if (XPStoreInstance.get("device_id"))
      info["device_id"] = XPStoreInstance.get("device_id");
    if (typeof XPStoreInstance.get("subscription") !== "undefined")
      info["subscription"] = XPStoreInstance.get("subscription");
    return info;
  };
  this.showLocalNotification = function (notification) {
    new XPLocalNotification(notification);
  };
  this.showPopupMessage = function (popupMessage) {
    new XPPopupMessage(popupMessage);
  };
  this.linkStyle = function () {
    if (window.XPStyle) {
      var style = document.createElement("style");
      style.innerHTML = XPStyle;
      var script = document.getElementsByTagName("script")[0];
      script.parentNode.insertBefore(style, script);
    }
    if (window.XPDynamicStyle) {
      var style = document.createElement("style");
      style.innerHTML = XPDynamicStyle;
      var script = document.getElementsByTagName("script")[0];
      script.parentNode.insertBefore(style, script);
    }
    if (window.XPPopupStyle) {
      var style = document.createElement("style");
      style.innerHTML = XPPopupStyle;
      var script = document.getElementsByTagName("script")[0];
      script.parentNode.insertBefore(style, script);
    }
  };
  this.checkRequirements = function (success, error) {
    var delay = false;
    if (success === undefined) success = function () {};
    if (error === undefined) error = function () {};
    if (!XPConfig) {
      this.error("Config is not set");
      error();
      return;
    }
    if (!XPConfig.appKey) {
      this.error("Application key is not set");
      error();
      return;
    }
    if (!XPConfig.backendUrl) {
      this.error("Backend URL is not set");
      error();
      return;
    }
    if (!this.checkOrigin()) {
      error();
      return;
    }
    if (!window.XMLHttpRequest) {
      this.log("XMLHttpRequest is not supporting by this browser");
      error();
      return;
    }
    if (!window.localStorage) {
      this.log("localStorage is not supporting by this browser");
      error();
      return;
    }
    XPStoreDetectPrivateMode(function (privateMode) {
      if (privateMode) {
        self.log("Private browsing mode is not supported");
        error();
      } else {
        success();
      }
    });
  };
  this.checkOrigin = function () {
    if (!XPConfig.websiteOrigins) {
      this.error("Websites origins are not set");
      return false;
    }
    var allowOrigin = false;
    for (var i = 0; i < XPConfig.websiteOrigins.length; i++) {
      if (XPConfig.websiteOrigins[i] == location.origin) {
        allowOrigin = true;
        break;
      }
    }
    if (!allowOrigin) {
      this.error("Website origin is not allowed", location.origin);
      return false;
    }
    return true;
  };
  this.log = function () {
    if (this.debugLogsEnabled) {
      var log = Array.prototype.slice.call(arguments);
      log.unshift(
        XPEnvironment.sdkKey.charAt(0).toUpperCase() +
          XPEnvironment.sdkKey.slice(1) +
          ":"
      );
      console.log.apply(console, log);
    }
  };
  this.error = function () {
    var log = Array.prototype.slice.call(arguments);
    log.unshift(
      XPEnvironment.sdkKey.charAt(0).toUpperCase() +
        XPEnvironment.sdkKey.slice(1) +
        ":"
    );
    console.error.apply(console, log);
  };
  this.deviceUnregistered = function () {
    XPStoreInstance.remove("id");
    XPStoreInstance.remove("key");
  };
  return this;
};
var XPCoreWindow = function () {
  var self = this;
  this.isWindow = true;
  this.debugLogsEnabled = true;
  this.autoClose = true;
  this.reservedSpace = 0;
  this.init = function () {
    XPStoreInstance = new XPStore();
    XPUpdateManagerInstance = new XPUpdateManager();
    XPPushManagerInstance = new XPPushManager();
    XPTranslationInstance = new XPTranslation();
    return this;
  };
  this.launch = function () {
    if (window.opener) {
      var data = {};
      data[XPEnvironment.sdkKey] = { window: true, close: true };
      window.addEventListener("beforeunload", function () {
        window.opener.postMessage(JSON.stringify(data), "*");
      });
    }
    this.initContent();
    if (!this.checkRequirements()) {
      this.renderError();
      return false;
    }
    if (!this.checkOrigin()) {
      this.renderError();
      return false;
    }
    if (!this.getParam("id") || !this.getParam("key")) {
      this.renderContent(
        XPTranslationInstance.t("window_error_direct_open_title"),
        XPTranslationInstance.t("window_error_direct_open_text")
      );
      return false;
    }
    XPStoreInstance.set("id", this.getParam("id"));
    XPStoreInstance.set("key", this.getParam("key"));
    if (!XPPushManagerInstance.launch()) {
      this.renderError();
      return false;
    }
    switch (XPPushManagerInstance.getPermission()) {
      case "default":
        this.renderPromptInformation();
        break;
      case "denied":
        this.autoClose = false;
        this.renderContent(
          XPTranslationInstance.t("window_error_already_denied_title"),
          XPTranslationInstance.t("window_error_already_denied_text")
        );
        break;
      case "granted":
        this.autoClose = false;
        this.renderContent(
          XPTranslationInstance.t("window_error_already_granted_title"),
          XPTranslationInstance.t("window_error_already_granted_text")
        );
        break;
      case "unavailable":
        this.renderError();
        return false;
    }
    return true;
  };
  this.initContent = function () {
    this.linkStyle();
    this.linkHeaders();
    document.getElementsByTagName("body")[0].className = "webpush-window-body";
    var el = document.createElement("div");
    el.id = "webpush-window";
    el.innerHTML =
      '<img id="webpush-window-image">' +
      '<div id="webpush-window-title"></div>' +
      '<div id="webpush-window-text"></div>';
    document.getElementsByTagName("body")[0].appendChild(el);
    if (!(window.orientation === undefined)) {
      window.addEventListener("resize", function () {
        self.repositionContent();
      });
    }
  };
  this.renderContent = function (title, text, reservedSpace) {
    document.getElementById("webpush-window-title").innerHTML = title;
    document.getElementById("webpush-window-text").innerHTML = text;
    document.getElementById("webpush-window-image").src = XPConfig.iconLarge;
    this.reservedSpace = reservedSpace;
    this.repositionContent();
    document.getElementById("webpush-window").style.opacity = 1;
  };
  this.repositionContent = function () {
    var wHeight = document.documentElement.clientHeight;
    if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
      document.getElementById("webpush-window-image").style.display =
        wHeight < 480 ? "none" : "inline-block";
      document.getElementById("webpush-window-text").style.display =
        wHeight < 320 ? "none" : "block";
    }
    var cHeight = document.getElementById("webpush-window").clientHeight;
    var marginTop;
    if (!this.reservedSpace) this.reservedSpace = 0;
    if (this.reservedSpace >= 0) {
      marginTop =
        Math.max((wHeight - cHeight) / 2, this.reservedSpace || 0) -
        wHeight / 2;
    } else {
      marginTop =
        Math.max((wHeight - cHeight) / 2 + this.reservedSpace, 0) - wHeight / 2;
    }
    document.getElementById("webpush-window").style.marginTop =
      marginTop + "px";
  };
  this.linkStyle = function () {
    if (window.XPStyle) {
      var style = document.createElement("style");
      style.innerHTML = XPStyle;
      var script = document.getElementsByTagName("script")[0];
      script.parentNode.insertBefore(style, script);
    }
    if (window.XPPopupStyle) {
      var style = document.createElement("style");
      style.innerHTML = XPPopupStyle;
      var script = document.getElementsByTagName("script")[0];
      script.parentNode.insertBefore(style, script);
    }
  };
  this.linkHeaders = function () {
    var title = document.createElement("title");
    title.innerHTML = XPConfig.websiteName;
    document.getElementsByTagName("head")[0].appendChild(title);
    var meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    document.getElementsByTagName("head")[0].appendChild(meta);
  };
  this.renderPromptInformation = function () {
    var marginTop =
      navigator.userAgent.toLowerCase().indexOf("android") > -1 ? -90 : 130;
    var text = XPConfig.webPushDescription
      ? XPConfig.webPushDescription.replace("\n", "<br>")
      : XPTranslationInstance.t("window_text");
    this.renderContent(
      XPTranslationInstance.t("window_title"),
      text,
      marginTop
    );
  };
  this.renderError = function () {
    this.renderContent(
      XPTranslationInstance.t("window_error_fail_title"),
      XPTranslationInstance.t("window_error_fail_text")
    );
  };
  this.tokenUpdated = function (token, permission, pushSenderId, pushKeys) {
    if (window.opener) {
      var data = {};
      data[XPEnvironment.sdkKey] = {
        window: true,
        token: token,
        permission: permission,
        pushSenderId: pushSenderId,
        pushKeys: pushKeys,
      };
      window.opener.postMessage(JSON.stringify(data), "*");
      if (this.autoClose) {
        window.close();
      }
    }
  };
  this.checkRequirements = function () {
    if (!window.XMLHttpRequest) {
      this.log("XMLHttpRequest is not supporting by this browser");
      return false;
    }
    if (!window.localStorage) {
      this.log("localStorage is not supporting by this browser");
      return false;
    }
    if (!XPConfig) {
      this.error("Config is not set");
      return false;
    }
    if (!XPConfig.appKey) {
      this.error("Application key is not set");
      return false;
    }
    if (!XPConfig.backendUrl) {
      this.error("Backend URL is not set");
      return false;
    }
    if (window.location.protocol != "https:") {
      this.error("Page is loaded not under HTTPS");
      return false;
    }
    if (!XPPushManagerInstance.currentInstance) {
      this.log("Push notifications are not implemented by this browser");
      return false;
    }
    return true;
  };
  this.checkOrigin = function () {
    if (
      !XPConfig.windowUrl ||
      XPConfig.windowUrl != location.origin + location.pathname
    ) {
      this.error("Website origin is not allowed");
      return false;
    }
    return true;
  };
  this.log = function () {
    if (this.debugLogsEnabled) {
      var log = Array.prototype.slice.call(arguments);
      log.unshift(
        XPEnvironment.sdkKey.charAt(0).toUpperCase() +
          XPEnvironment.sdkKey.slice(1) +
          " Window:"
      );
      console.log.apply(console, log);
    }
  };
  this.error = function () {
    var log = Array.prototype.slice.call(arguments);
    log.unshift(
      XPEnvironment.sdkKey.charAt(0).toUpperCase() +
        XPEnvironment.sdkKey.slice(1) +
        " Window:"
    );
    console.error.apply(console, log);
  };
  this.getParam = function (name) {
    if (
      (name = new RegExp("[?&]" + encodeURIComponent(name) + "=([^&]*)").exec(
        location.search
      ))
    ) {
      return decodeURIComponent(name[1]);
    } else {
      return null;
    }
  };
  this.setAppLanguage = function (app_language) {
    XPStoreInstance.set("app_language", app_language);
    if (this.isLaunched) XPApiInstance.deviceUpdate();
  };
  return this;
};
var XPCoreFrame = function () {
  this.isFrame = true;
  this.debugLogsEnabled = true;
  this.init = function () {
    XPStoreInstance = new XPStore();
    XPUpdateManagerInstance = new XPUpdateManager();
    XPPushManagerInstance = new XPPushManager();
    return this;
  };
  this.launch = function () {
    if (!this.checkRequirements()) {
      this.returnError();
      return false;
    }
    if (!this.checkOrigin()) {
      this.returnError();
      return false;
    }
    if (!this.getParam("id") || !this.getParam("key")) {
      this.error("Device is not set");
      this.returnError();
      return false;
    }
    XPStoreInstance.set("id", this.getParam("id"));
    XPStoreInstance.set("key", this.getParam("key"));
    window.addEventListener("message", function (event) {
      if (event.data) {
        try {
          var data = JSON.parse(event.data);
        } catch (e) {}
        if (data) {
          var scope = data[XPEnvironment.sdkKey];
          if (scope && scope.page) {
            XPCoreInstance.log("Received message from the page: ", scope);
            if (scope.subscribe) {
              XPPushManagerInstance.systemPrompt();
            }
          }
        }
      }
    });
    return XPPushManagerInstance.launch();
  };
  this.tokenUpdated = function (token, permission, pushSenderId, pushKeys) {
    if (permission == "granted" && !token) {
      permission = "deregistered";
    }
    var data = {};
    data[XPEnvironment.sdkKey] = {
      frame: true,
      token: token,
      permission: permission,
      pushSenderId: pushSenderId,
      pushKeys: pushKeys,
    };
    window.parent.postMessage(JSON.stringify(data), "*");
  };
  this.returnError = function () {
    var data = {};
    data[XPEnvironment.sdkKey] = { frame: true, error: true };
    window.parent.postMessage(JSON.stringify(data), "*");
  };
  this.checkRequirements = function () {
    if (!window.XMLHttpRequest) {
      this.log("XMLHttpRequest is not supporting by this browser");
      return false;
    }
    if (!window.localStorage) {
      this.log("localStorage is not supporting by this browser");
      return false;
    }
    if (!window.parent) {
      this.log("This page should be loaded to an iframe");
      return false;
    }
    if (!XPConfig) {
      this.error("Config is not set");
      return false;
    }
    if (!XPConfig.appKey) {
      this.error("Application key is not set");
      return false;
    }
    if (!XPConfig.backendUrl) {
      this.error("Backend URL is not set");
      return false;
    }
    if (window.location.protocol != "https:") {
      this.error("Page is loaded not under HTTPS");
      return false;
    }
    if (!XPPushManagerInstance.currentInstance) {
      this.log("Push notifications are not implemented by this browser");
      return false;
    }
    return true;
  };
  this.checkOrigin = function () {
    if (
      !XPConfig.frameUrl ||
      XPConfig.frameUrl != location.origin + location.pathname
    ) {
      this.error("This URL is not allowed for the frame");
      return false;
    }
    return true;
  };
  this.log = function () {
    if (this.debugLogsEnabled) {
      var log = Array.prototype.slice.call(arguments);
      log.unshift(
        XPEnvironment.sdkKey.charAt(0).toUpperCase() +
          XPEnvironment.sdkKey.slice(1) +
          " Frame:"
      );
      console.log.apply(console, log);
    }
  };
  this.error = function () {
    var log = Array.prototype.slice.call(arguments);
    log.unshift(
      XPEnvironment.sdkKey.charAt(0).toUpperCase() +
        XPEnvironment.sdkKey.slice(1) +
        " Frame:"
    );
    console.error.apply(console, log);
  };
  this.getParam = function (name) {
    if (
      (name = new RegExp("[?&]" + encodeURIComponent(name) + "=([^&]*)").exec(
        location.search
      ))
    ) {
      return decodeURIComponent(name[1]);
    } else {
      return null;
    }
  };
  return this;
};
var XPStore = function () {
  this.data = null;
  this.launch = function () {
    this.fetchCookies();
    this.saveCookies();
  };
  this.set = function (key, value) {
    if (this.data === null) {
      this.loadData();
    }
    this.data[key] = value;
    this.saveData();
    if (key == "id" || key == "key") {
      this.saveCookies();
    }
  };
  this.get = function (key) {
    if (this.data === null) {
      this.loadData();
    }
    return this.data[key];
  };
  this.checkDebugKey = function () {
    try {
      if (localStorage.getItem(XPEnvironment.localStorageDebugKey) === "1")
        return true;
    } catch (e) {}
    return false;
  };
  this.remove = function (key) {
    if (this.data === null) {
      this.loadData();
    }
    delete this.data[key];
    this.saveData();
    if (key == "id" || key == "key") {
      this.saveCookies();
    }
  };
  this.loadData = function () {
    this.data = JSON.parse(localStorage.getItem(XPEnvironment.localStorageKey));
    if (!this.data) this.data = {};
  };
  this.saveData = function () {
    try {
      localStorage.setItem(
        XPEnvironment.localStorageKey,
        JSON.stringify(this.data)
      );
    } catch (e) {}
  };
  this.clearData = function () {
    this.data = null;
    localStorage.removeItem(XPEnvironment.localStorageKey);
  };
  this.fetchCookies = function () {
    var cookieID = this.getCookie(XPEnvironment.cookieKey);
    var cookieAuth = this.getCookie(XPEnvironment.cookieAuthKey);
    if (cookieID && cookieAuth) {
      this.data["id"] = cookieID;
      this.data["key"] = cookieAuth;
      this.saveData();
    }
  };
  this.saveCookies = function () {
    var storageID = this.data["id"];
    var storageAuth = this.data["key"];
    if (storageID && storageAuth && XPConfig.cookie.domain) {
      this.setCookie(XPEnvironment.cookieKey, storageID, 180);
      this.setCookie(XPEnvironment.cookieAuthKey, storageAuth, 180);
    } else {
      this.removeCookie(XPEnvironment.cookieKey);
      this.removeCookie(XPEnvironment.cookieAuthKey);
    }
  };
  this.setCookie = function (name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1e3);
      expires = "; expires=" + date.toGMTString();
    }
    var domain = "";
    if (XPConfig.cookie.domain) {
      domain = "; domain=" + XPConfig.cookie.domain;
    }
    document.cookie = name + "=" + value + expires + domain + "; path=/";
  };
  this.getCookie = function (name) {
    if (document.cookie.length > 0) {
      var start = document.cookie.indexOf(name + "=");
      if (start != -1) {
        start = start + name.length + 1;
        var end = document.cookie.indexOf(";", start);
        if (end == -1) {
          end = document.cookie.length;
        }
        var value = document.cookie.substring(start, end);
        return value;
      }
    }
    return undefined;
  };
  this.removeCookie = function (name, domain) {
    if (!this.getCookie(name)) return;
    var domain = "";
    if (XPConfig.cookie.domain) {
      domain = "; domain=" + XPConfig.cookie.domain;
    }
    document.cookie =
      name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT" + domain + "; path=/";
  };
};
var XPStoreDetectPrivateMode = function (callback) {
  function retry(isDone, next) {
    var current_trial = 0,
      max_retry = 50,
      interval = 10,
      is_timeout = false;
    var id = window.setInterval(function () {
      if (isDone()) {
        window.clearInterval(id);
        next(is_timeout);
      }
      if (current_trial++ > max_retry) {
        window.clearInterval(id);
        is_timeout = true;
        next(is_timeout);
      }
    }, 10);
  }
  function isIE10OrLater(user_agent) {
    var ua = user_agent.toLowerCase();
    if (ua.indexOf("msie") === 0 && ua.indexOf("trident") === 0) {
      return false;
    }
    var match = /(?:msie|rv:)\s?([\d\.]+)/.exec(ua);
    if (match && parseInt(match[1], 10) >= 10) {
      return true;
    }
    return false;
  }
  var is_private;
  if (window.webkitRequestFileSystem) {
    window.webkitRequestFileSystem(
      window.TEMPORARY,
      1,
      function () {
        is_private = false;
      },
      function (e) {
        is_private = true;
      }
    );
  } else if (window.indexedDB && /Firefox/.test(window.navigator.userAgent)) {
    var db;
    try {
      db = window.indexedDB.open(XPEnvironment.localStorageKey + ".test");
      db.onerror = function (e) {
        e.preventDefault();
      };
    } catch (e) {
      is_private = true;
    }
    if (typeof is_private === "undefined") {
      retry(
        function isDone() {
          return db.readyState === "done";
        },
        function next(is_timeout) {
          if (!is_timeout) {
            is_private = db.result ? false : true;
          }
        }
      );
    }
  } else if (isIE10OrLater(window.navigator.userAgent)) {
    is_private = false;
    try {
      if (!window.indexedDB) {
        is_private = true;
      }
    } catch (e) {
      is_private = true;
    }
  } else if (window.localStorage && /Safari/.test(window.navigator.userAgent)) {
    try {
      window.localStorage.setItem(XPEnvironment.localStorageKey + ".test", 1);
    } catch (e) {
      is_private = true;
    }
    if (typeof is_private === "undefined") {
      is_private = false;
      window.localStorage.removeItem(XPEnvironment.localStorageKey + ".test");
    }
  }
  retry(
    function isDone() {
      return typeof is_private !== "undefined";
    },
    function next(is_timeout) {
      callback(is_private);
    }
  );
};
var XPApi = function () {
  var self = this;
  this.launch = function () {
    if (XPStoreInstance.get("id") && XPStoreInstance.get("appkey")) {
      if (XPStoreInstance.get("appkey") != XPConfig.appKey) {
        XPStoreInstance.remove("id");
        XPStoreInstance.remove("key");
        if (XPStoreInstance.get("user_id")) XPStoreInstance.remove("user_id");
      }
    }
    XPStoreInstance.set("appkey", XPConfig.appKey);
    if (XPStoreInstance.get("id")) {
      setTimeout(function () {
        XPCoreInstance.deviceReady();
      }, 0);
      this.deviceUpdate();
    } else {
      this.deviceCreate();
    }
  };
  this.deviceCreate = function () {
    var data = XPUpdateManagerInstance.currentParams();
    XPUpdateManagerInstance.updateParams(data);
    data["auth"] = 2;
    this.request("/push/api/deviceCreate", data, function (response_data) {
      XPUpdateManagerInstance.saveParams(data);
      XPStoreInstance.set("id", response_data["id"]);
      XPStoreInstance.set("key", response_data["key"]);
      XPStoreInstance.set("device_id", response_data["device_id"]);
      XPCoreInstance.deviceReady();
      self.deviceUpdate();
    });
  };
  this.deviceUpdate = function (success, error) {
    if (XPStoreInstance.get("id")) {
      var data = XPUpdateManagerInstance.changedParams();
      XPUpdateManagerInstance.updateParams(data);
      if (Object.keys(data).length) {
        this.request(
          "/push/api/deviceUpdate",
          data,
          function () {
            XPUpdateManagerInstance.saveParams(data);
            if (typeof success == "function") {
              success();
            }
          },
          error
        );
      } else {
        if (typeof success == "function") {
          success();
        }
      }
    }
  };
  this.sessionStart = function () {
    if (XPStoreInstance.get("id")) {
      this.request("/push/api/sessionStart", {});
    }
  };
  this.actionHit = function (id, button, open, context, success) {
    button = typeof button !== "undefined" ? button : false;
    open = typeof open !== "undefined" ? open : 1;
    success = typeof success === "function" ? success : null;
    if (XPStoreInstance.get("id")) {
      var params = { action_id: id, open: open };
      if (button) {
        params.button = button;
      }
      if (context) {
        params.context = context;
      }
      this.request("/push/api/actionHit", params, success);
    }
  };
  this.actionDelivered = function (id, context) {
    button = typeof button !== "undefined" ? button : false;
    open = typeof open !== "undefined" ? open : 1;
    if (XPStoreInstance.get("id")) {
      var params = { action_id: id };
      if (context) {
        params.context = context;
      }
      this.request("/push/api/actionDelivered", params);
    }
  };
  this.inboxBadge = function (params, success, error) {
    if (XPStoreInstance.get("id")) {
      this.request(
        "/push/api/inboxBadge",
        params || {},
        function (response_data) {
          success({ badge: response_data.badge });
        },
        function (err) {
          if (typeof error == "function") {
            error(err);
          }
        }
      );
    } else {
      if (typeof error == "function") {
        error({ message: "Device is not registered yet" });
      }
    }
  };
  this.inboxList = function (params, success, error) {
    if (XPStoreInstance.get("id")) {
      this.request(
        "/push/api/inboxList",
        params || {},
        function (response_data) {
          if (typeof success == "function") {
            success({
              items: response_data.result,
              more: response_data.more || false,
              badge: response_data.badge,
            });
          }
        },
        function (err) {
          if (typeof error == "function") {
            error(err);
          }
        }
      );
    } else {
      if (typeof error == "function") {
        error({ message: "Device is not registered yet" });
      }
    }
  };
  this.inboxMessageList = function (params, success, error) {
    if (XPStoreInstance.get("id")) {
      this.request(
        "/push/api/inboxMessageList",
        params || {},
        function (response_data) {
          if (typeof success == "function") {
            success({
              items: response_data.result,
              more: response_data.more || false,
              badge: response_data.badge,
            });
          }
        },
        function (err) {
          if (typeof error == "function") {
            error(err);
          }
        }
      );
    } else {
      if (typeof error == "function") {
        error({ message: "Device is not registered yet" });
      }
    }
  };
  this.inboxMessageCount = function (params, success, error) {
    if (XPStoreInstance.get("id")) {
      this.request(
        "/push/api/inboxMessageCount",
        params || {},
        function (response_data) {
          if (typeof success == "function") {
            success({ count: response_data.count });
          }
        },
        function (err) {
          if (typeof error == "function") {
            error(err);
          }
        }
      );
    } else {
      if (typeof error == "function") {
        error({ message: "Device is not registered yet" });
      }
    }
  };
  this.inboxMessageActionsHit = function (actions, success, error) {
    if (XPStoreInstance.get("id")) {
      this.request(
        "/push/api/inboxMessageActionsHit",
        { actions: actions },
        function (response_data) {
          success({ badge: response_data.badge });
        },
        function (err) {
          if (error) {
            error(err);
          }
        }
      );
    } else {
      if (typeof error == "function") {
        error({ message: "Device is not registered yet" });
      }
    }
  };
  this.eventHit = function (event, title, value) {
    if (XPStoreInstance.get("id")) {
      var params = {
        event: event,
        title: title,
        value: value === undefined ? null : value,
      };
      this.request("/push/api/eventHit", params, function (response_data) {
        if (response_data.pushes) {
          for (var i = 0; i < response_data.pushes.length; i++) {
            if (
              response_data.pushes[i].hasOwnProperty("onsite_native") &&
              response_data.pushes[i].onsite_native == "1"
            )
              XPCustomMessageHandlerInstance.callNativeCallback(
                response_data.pushes[i]
              );
            else if (response_data.pushes[i].popup)
              XPCoreInstance.showPopupMessage(response_data.pushes[i]);
            else XPCoreInstance.showLocalNotification(response_data.pushes[i]);
          }
        }
      });
    }
  };
  this.tagHit = function (title, value) {
    if (XPStoreInstance.get("id")) {
      var params = {
        tags: [{ tag: title, value: value === undefined ? null : value }],
      };
      this.request("/push/api/tagsHit", params);
    }
  };
  this.import = function (profile, success, error) {
    if (XPStoreInstance.get("id")) {
      this.request("/push/api/profileImport", profile, success, error);
    }
  };
  this.updateUser = function (userData, success, error) {
    if (XPStoreInstance.get("id")) {
      this.request("/push/api/userUpdate", userData, success, error);
    }
  };
  this.impressionHit = function (title) {
    if (XPStoreInstance.get("id")) {
      var params = { impressions: [{ impression: title }] };
      this.request("/push/api/impressionsHit", params);
    }
  };
  this.request = function (action, data, success, error) {
    data["appkey"] = XPConfig.appKey;
    if (XPStoreInstance.get("id")) data["id"] = XPStoreInstance.get("id");
    if (XPStoreInstance.get("key")) data["key"] = XPStoreInstance.get("key");
    if (XPStoreInstance.get("user_id"))
      data["user_id"] = XPStoreInstance.get("user_id");
    if (action != "/push/api/deviceCreate" && !data["id"]) return;
    XPApiRequest(action, data, success, function (e) {
      if (e.code == 901) {
        XPCoreInstance.deviceUnregistered();
      }
      if (typeof error == "function") {
        error(e);
      }
    });
  };
  return this;
};
var XPApiRequest = function (action, data, success, error) {
  var request = null;
  this.init = function () {
    var url = XPConfig.backendUrl + action;
    var json_data = this.buildRequestData(data);
    XPCoreInstance.log("Requesting " + url + " with data: " + json_data);
    request = new XMLHttpRequest();
    if (!request) {
      XPCoreInstance.log("Cannot create HTTP request");
      return false;
    }
    request.withCredentials = true;
    request.onreadystatechange = this.requestStateChanged;
    request.open("POST", url, true);
    request.setRequestHeader("Accept", "application/json");
    request.send(json_data);
    return this;
  };
  this.buildRequestData = function (data) {
    var requestData = {};
    for (var i in data) {
      if (data.hasOwnProperty(i) && data[i] !== undefined) {
        requestData[i] = data[i];
      }
    }
    return JSON.stringify(requestData);
  };
  this.requestStateChanged = function () {
    try {
      if (request.readyState === 4) {
        var status = request.status;
        if (
          (status >= 200 && status < 300) ||
          [400, 401, 403, 404].indexOf(status) !== -1
        ) {
          XPCoreInstance.log(request.responseText);
          var response_data = JSON.parse(request.responseText);
          if (!response_data)
            throw { message: "Failed to parse response data" };
          if (!response_data.success)
            throw {
              message:
                "Request failed with success = false. Message: " +
                response_data.message,
              code: response_data.code,
            };
          if (typeof success == "function") {
            success(response_data);
          }
        } else {
          throw {
            message: "Request failed with status: " + status,
            code: status,
          };
        }
      }
    } catch (e) {
      XPCoreInstance.log(e.message);
      if (typeof error == "function") {
        error(e);
      }
    }
  };
  return this.init();
};
var XPSessionManager = function () {
  this.launch = function () {
    var currentTimestamp = Math.round(new Date().getTime() / 1e3);
    var lastTimestamp = XPStoreInstance.get("page_views_last");
    XPStoreInstance.set("page_views_last", currentTimestamp);
    XPStoreInstance.set(
      "page_views",
      (XPStoreInstance.get("page_views") || 0) + 1
    );
    if (XPConfig.session.enabled) {
      if (
        !lastTimestamp ||
        currentTimestamp - lastTimestamp > XPConfig.session.interval
      ) {
        this.startSession();
      }
    }
  };
  this.startSession = function () {
    XPApiInstance.sessionStart();
  };
};
var XPUpdateManager = function () {
  this.savedParams = {};
  this.updatedParams = {};
  this.params = function () {
    return {
      type: this.getType,
      environment: this.getEnvironment,
      email: this.getEmail,
      external_id: this.getExternalID,
      user_id: this.getUserID,
      ga_id: this.getGAID,
      token: this.getToken,
      push_sender_id: this.getPushSenderId,
      subscription: this.getSubscription,
      language: this.getLanguage,
      language_app: this.getAppLanguage,
      timezone: this.getTimezone,
      app_version: this.getAppVersion,
      lib_version: this.getLibVersion,
      user_agent: this.getUserAgent,
      push_keys: this.getPushKeys,
    };
  };
  this.launch = function () {
    var params = XPStoreInstance.get("params");
    if (params) {
      for (var i in params) {
        this.savedParams[i] = params[i];
        this.updatedParams[i] = params[i];
      }
    }
  };
  this.currentParams = function () {
    var params = {};
    var params_list = this.params();
    for (var i in params_list) {
      var value = params_list[i]();
      if (value === null || value === undefined) value = "";
      params[i] = value;
    }
    return params;
  };
  this.changedParams = function () {
    var params = {};
    var params_list = this.params();
    for (var i in params_list) {
      var old_value = this.updatedParams[i];
      var new_value = params_list[i]();
      if (old_value === null) old_value = "";
      if (new_value === null) new_value = "";
      if (JSON.stringify(old_value) != JSON.stringify(new_value)) {
        params[i] = new_value;
      }
    }
    return params;
  };
  this.saveParams = function (updatedParams) {
    for (var i in updatedParams) {
      this.savedParams[i] = updatedParams[i];
    }
    XPStoreInstance.set("params", this.savedParams);
  };
  this.updateParams = function (currentParams) {
    for (var i in currentParams) {
      this.updatedParams[i] = currentParams[i];
    }
  };
  this.getType = function () {
    return "web";
  };
  this.getEnvironment = function () {
    if (window.safari) {
      return "safari";
    }
    if (window.chrome) {
      return "chrome";
    }
    if (typeof InstallTrigger !== "undefined") {
      return "firefox";
    }
    return "";
  };
  this.getEmail = function () {
    return XPStoreInstance.get("email");
  };
  this.getExternalID = function () {
    return XPStoreInstance.get("external_id");
  };
  this.getUserID = function () {
    return XPStoreInstance.get("user_id");
  };
  this.getGAID = function () {
    return XPStoreInstance.get("ga_id");
  };
  this.getToken = function () {
    return XPStoreInstance.get("token");
  };
  this.getPushSenderId = function () {
    return XPStoreInstance.get("push_sender_id");
  };
  this.getSubscription = function () {
    return XPStoreInstance.get("subscription");
  };
  this.getLanguage = function () {
    return navigator.language || navigator.userLanguage;
  };
  this.getTimezone = function () {
    return new Date().getTimezoneOffset().toString();
  };
  this.getAppLanguage = function () {
    return XPStoreInstance.get("app_language");
  };
  this.getAppVersion = function () {
    return XPStoreInstance.get("app_version");
  };
  this.getLibVersion = function () {
    return XPEnvironment.version;
  };
  this.getUserAgent = function () {
    return navigator.userAgent;
  };
  this.getPushKeys = function () {
    return XPStoreInstance.get("push_keys");
  };
  return this;
};
var XPGaManager = function () {
  var self = this;
  this.init = function () {};
  this.launch = function () {
    if (!XPConfig.ga || !XPConfig.ga.enabled) {
      XPCoreInstance.log("Google Analytics is not enabled.");
      return false;
    }
    if (!XPConfig.ga.trackingID) {
      XPCoreInstance.error("Google Analytics tracking ID is not set.");
      return false;
    }
    if (!XPConfig.ga.trackingID) {
      XPCoreInstance.error("Google Analytics dimension is not set.");
      return false;
    }
    if (!XPConfig.ga.function || !XPConfig.ga.tracker) {
      XPCoreInstance.error("Google Analytics parameters are not set.");
      return false;
    }
    this.waitForGa(5e3, function () {
      self.track();
    });
  };
  this.waitForGa = function (timeout, callback) {
    if (window[XPConfig.ga.function]) {
      callback();
      return;
    }
    var waiting = 0;
    var interval = setInterval(function () {
      if (window[XPConfig.ga.function]) {
        clearInterval(interval);
        callback();
      } else {
        waiting += 250;
        if (waiting >= timeout && document.readyState === "complete") {
          clearInterval(interval);
          XPCoreInstance.error("Google Analytics waiting timed out");
        }
      }
    }, 250);
  };
  this.track = function () {
    window[XPConfig.ga.function](
      "create",
      XPConfig.ga.trackingID,
      "auto",
      XPConfig.ga.tracker
    );
    window[XPConfig.ga.function](function () {
      var clientId = ga.getByName(XPConfig.ga.tracker).get("clientId");
      XPCoreInstance.log("Google Analytics client ID: " + clientId);
      if (!XPConfig.ga.dimensionReadonly) {
        if (XPCoreInstance.getGaId() !== clientId) {
          XPCoreInstance.log(
            "Google Analytics setting dimension " + XPConfig.ga.dimension
          );
          window[XPConfig.ga.function](
            XPConfig.ga.tracker + ".set",
            "dimension" + XPConfig.ga.dimension,
            clientId
          );
          window[XPConfig.ga.function](
            XPConfig.ga.tracker + ".send",
            "event",
            XPEnvironment.sdkKey,
            "register",
            {
              nonInteraction: true,
              hitCallback: function () {
                XPCoreInstance.setGaId(clientId);
              },
            }
          );
        }
      } else {
        XPCoreInstance.setGaId(clientId);
      }
    });
  };
};
var XPPushManager = function () {
  var self = this;
  this.currentInstance = null;
  this.isPrompted = false;
  this.isChecked = false;
  this.isLaunched = false;
  this.init = function () {
    switch (XPUpdateManagerInstance.getEnvironment()) {
      case "chrome":
        this.currentInstance = new XPPushWebManager("chrome");
        break;
      case "firefox":
        this.currentInstance = new XPPushWebManager("firefox");
        break;
      case "safari":
        this.currentInstance = new XPPushSafariManager();
        break;
    }
    if (XPStoreInstance.get("subscription") === undefined) {
      XPStoreInstance.set("subscription", true);
    }
  };
  this.launch = function () {
    if (this.currentInstance) {
      this.isLaunched = this.currentInstance.launch();
    }
    this.isChecked = true;
    return this.isLaunched;
  };
  this.getPermission = function () {
    if (!this.isChecked) {
      return undefined;
    } else if (!this.isLaunched) {
      return "unavailable";
    } else {
      return this.currentInstance.getPermission();
    }
  };
  this.prompt = function (callbacks, custom) {
    if (!this.isChecked) {
      XPCoreInstance.error("Push notifications manager is not ready yet");
    } else if (!this.isLaunched) {
      XPCoreInstance.error("Push notifications are not available");
    } else {
      this.isPrompted = true;
      if (custom) {
        this.customPrompt(callbacks);
      } else {
        this.systemPrompt(callbacks);
      }
    }
  };
  this.systemPrompt = function (callbacks) {
    this.hideCustomPrompt();
    this.currentInstance.prompt(callbacks);
  };
  this.customPrompt = function (callbacks) {
    if (document.readyState === "complete") {
      self.showCustomPrompt(callbacks);
    } else {
      window.addEventListener("load", function () {
        self.showCustomPrompt(callbacks);
      });
    }
  };
  this.autoPrompt = function () {
    var callbacks = {};
    if (XPConfig.promptParams.autoPromptAllowRedirect) {
      callbacks.allowCallback = function () {
        setTimeout(function () {
          window.location = XPConfig.promptParams.autoPromptAllowRedirect;
        }, 500);
      };
    }
    if (XPConfig.promptParams.autoPromptBlockRedirect) {
      callbacks.blockCallback = function () {
        setTimeout(function () {
          window.location = XPConfig.promptParams.autoPromptBlockRedirect;
        }, 500);
      };
    }
    if (XPConfig.promptParams.autoPromptDismissRedirect) {
      callbacks.dismissCallback = function () {
        setTimeout(function () {
          window.location = XPConfig.promptParams.autoPromptDismissRedirect;
        }, 500);
      };
    }
    if (!XPCoreInstance.isWindow && this.currentInstance.requiresWindow()) {
      this.prompt(callbacks, true);
    } else {
      this.prompt(callbacks);
    }
  };
  this.shouldAutoPrompt = function () {
    if (XPCoreInstance.isWindow) return true;
    if (!XPConfig.promptParams.autoPrompt) return false;
    if (
      this.getPermission() != "default" &&
      this.getPermission() != "deregistered"
    )
      return false;
    if (this.isPrompted) return false;
    var autoPromptStart = XPConfig.promptParams.autoPromptStart || 1;
    var pageViews = XPStoreInstance.get("page_views") || 1;
    if (pageViews < autoPromptStart) return false;
    var promptDismiss;
    var autoPromptRepeat = XPConfig.promptParams.autoPromptRepeat || 0;
    if (this.currentInstance.requiresWindow()) {
      promptDismiss = XPStoreInstance.get("custom_prompt_deny") || 0;
    } else {
      promptDismiss = XPStoreInstance.get("system_prompt_dismiss") || 0;
    }
    if (
      promptDismiss &&
      (!autoPromptRepeat || pageViews < promptDismiss + autoPromptRepeat)
    )
      return false;
    return true;
  };
  this.showCustomPrompt = function (callbacks) {
    var text = XPConfig.webPushDescription
      ? XPConfig.webPushDescription.replace("\n", "<br>")
      : XPTranslationInstance.t("custom_prompt_text");
    var el = document.createElement("div");
    el.style.display = "none";
    el.id = "webpush-custom-prompt";
    el.className = "webpush-reset";
    el.innerHTML =
      '<img id="webpush-custom-prompt-image">' +
      '<div id="webpush-custom-prompt-title">' +
      XPTranslationInstance.t("custom_prompt_title") +
      "</div>" +
      '<div id="webpush-custom-prompt-text">' +
      text +
      "</div>" +
      '<div id="webpush-custom-prompt-buttons">' +
      '<div id="webpush-custom-prompt-button1">' +
      XPTranslationInstance.t("custom_prompt_deny") +
      "</div>" +
      '<div id="webpush-custom-prompt-button2">' +
      XPTranslationInstance.t("custom_prompt_allow") +
      "</div>" +
      "</div>";
    document.getElementsByTagName("body")[0].appendChild(el);
    document
      .getElementById("webpush-custom-prompt-image")
      .addEventListener("load", function () {
        document.getElementById("webpush-custom-prompt").style.display =
          "block";
      });
    document.getElementById("webpush-custom-prompt-image").src =
      XPConfig.iconLarge;
    document
      .getElementById("webpush-custom-prompt-button1")
      .addEventListener("click", function () {
        XPStoreInstance.set(
          "custom_prompt_deny",
          XPStoreInstance.get("page_views")
        );
        self.hideCustomPrompt();
        if (callbacks && callbacks.dismissCallback) {
          callbacks.dismissCallback();
        }
      });
    document
      .getElementById("webpush-custom-prompt-button2")
      .addEventListener("click", function () {
        self.hideCustomPrompt();
        self.prompt(callbacks);
      });
  };
  this.hideCustomPrompt = function () {
    var el = document.getElementById("webpush-custom-prompt");
    if (el) el.remove();
  };
  return this.init();
};
var XPPushWebManager = function (type) {
  var self = this;
  this.serviceWorkerRegistration = null;
  this.subscription = null;
  this.isLaunched = false;
  this.type = type;
  this.launch = function () {
    switch (this.type) {
      case "chrome":
        if (!XPConfig.chromePush) return false;
        break;
      case "firefox":
        if (!XPConfig.firefoxPush) return false;
        break;
      default:
        return false;
    }
    if (!this.checkRequirements()) {
      XPCoreInstance.log("Push messaging requirements check failed.");
      return false;
    }
    this.isLaunched = true;
    if (!this.requiresWindow()) {
      if (this.type == "chrome" && !XPConfig.vapidPublicKey) {
        this.linkManifest();
      }
      this.registerServiceWorker(function () {
        if (self.serviceWorkerRegistration) {
          XPCoreInstance.log(
            "Service worker is successfully registered: ",
            self.serviceWorkerRegistration
          );
          self.getSubscription(
            self.serviceWorkerRegistration.pushManager,
            function (subscription) {
              if (subscription) {
                XPCoreInstance.log(
                  "Existing subscription detected: ",
                  subscription
                );
                self.shouldResubscribe(
                  self.serviceWorkerRegistration.pushManager,
                  function (should) {
                    if (should) {
                      self.resubscribe(
                        self.serviceWorkerRegistration.pushManager,
                        subscription,
                        function (subscription) {
                          XPCoreInstance.log(
                            "Successfully resubscribed",
                            subscription
                          );
                          self.subscription = subscription;
                          self.processSubscription(subscription);
                        }
                      );
                    } else {
                      self.subscription = subscription;
                      self.processSubscription(subscription);
                    }
                  }
                );
              } else {
                self.subscription = null;
                if (self.getPermission() == "granted") {
                  self.subscribe();
                } else {
                  if (XPCoreInstance.isFrame) {
                    self.processSubscription(null);
                  } else {
                    if (XPPushManagerInstance.shouldAutoPrompt()) {
                      XPPushManagerInstance.autoPrompt();
                    }
                  }
                }
              }
            }
          );
        }
      });
    } else {
      if (this.requiresFrame()) {
        XPFrameManagerInstance.attach(function () {
          if (XPPushManagerInstance.shouldAutoPrompt()) {
            XPPushManagerInstance.autoPrompt();
          }
        });
      } else {
        setTimeout(function () {
          if (XPPushManagerInstance.shouldAutoPrompt()) {
            XPPushManagerInstance.autoPrompt();
          }
        }, 0);
      }
    }
    return true;
  };
  this.prompt = function (callbacks) {
    if (!this.requiresWindow()) {
      this.subscribe(callbacks);
    } else if (this.requiresFrame() && self.type == "firefox") {
      XPFrameManagerInstance.subscribe(callbacks);
    } else {
      this.openWindow(callbacks);
    }
  };
  this.requiresWindow = function () {
    if (XPCoreInstance.isWindow || XPCoreInstance.isFrame) {
      return false;
    } else if (location.protocol == "https:") {
      return XPConfig.webPushHttpsWindow;
    } else if (location.protocol == "http:") {
      return XPConfig.webPushHttpWindow;
    } else {
      return true;
    }
  };
  this.requiresFrame = function () {
    if (
      location.protocol == "https:" &&
      XPConfig.webPushHttpsWindow &&
      XPConfig.webPushFrame
    ) {
      return true;
    } else {
      return false;
    }
  };
  this.subscribe = function (callbacks) {
    self.waitUntilServiceWorkerActivated(function () {
      self.addSubscription(
        self.serviceWorkerRegistration.pushManager,
        function (subscription) {
          self.subscription = subscription;
          if (self.subscription) {
            XPCoreInstance.log(
              "Successfully subscribed for push notifications: ",
              self.subscription
            );
          }
          self.processSubscription(subscription);
          if (self.subscription) {
            if (self.getPermission() == "granted") {
              if (callbacks && callbacks.allowCallback) {
                callbacks.allowCallback();
              }
            }
          } else {
            if (self.getPermission() == "denied") {
              XPStoreInstance.set(
                "system_prompt_denied",
                XPStoreInstance.get("page_views") || 1
              );
              if (callbacks && callbacks.blockCallback) {
                callbacks.blockCallback();
              }
            }
            if (self.getPermission() == "default") {
              XPStoreInstance.set(
                "system_prompt_dismiss",
                XPStoreInstance.get("page_views") || 1
              );
              if (callbacks && callbacks.dismissCallback) {
                callbacks.dismissCallback();
              }
            }
          }
        }
      );
    });
  };
  this.linkManifest = function () {
    var link = document.createElement("link");
    link.rel = "manifest";
    link.href = this.getConfigManifestUrl();
    document.getElementsByTagName("head")[0].appendChild(link);
  };
  this.registerServiceWorker = function (callback) {
    navigator.serviceWorker
      .register(this.generateServiceWorkerLink())
      .then(function (serviceWorkerRegistration) {
        self.serviceWorkerRegistration = serviceWorkerRegistration;
        if (typeof callback == "function") {
          self.waitUntilServiceWorkerActivated(callback);
        }
      })
      .catch(function (e) {
        self.serviceWorkerRegistration = null;
        XPCoreInstance.log("Failed to register service worker: ", e);
        if (typeof callback == "function") {
          callback();
        }
      });
  };
  this.waitUntilServiceWorkerActivated = function (callback) {
    if (
      !self.serviceWorkerRegistration ||
      !self.serviceWorkerRegistration.active ||
      self.serviceWorkerRegistration.installing ||
      self.serviceWorkerRegistration.waiting
    ) {
      setTimeout(function () {
        self.waitUntilServiceWorkerActivated(callback);
      }, 200);
    } else {
      callback();
    }
  };
  this.generateServiceWorkerLink = function () {
    var ref = this.getConfigServiceWorkerUrl();
    ref += "?v=" + encodeURIComponent(XPEnvironment.version);
    ref += "&id=" + encodeURIComponent(XPStoreInstance.get("id"));
    ref += "&key=" + encodeURIComponent(XPStoreInstance.get("key"));
    ref += "&app_key=" + encodeURIComponent(XPConfig.appKey);
    ref += "&backend_url=" + encodeURIComponent(XPConfig.backendUrl);
    if (XPCoreInstance.debugLogsEnabled) ref += "&debug_logs=1";
    if (XPConfig.serviceWorkerSourceUrl)
      ref +=
        "&ref=" +
        encodeURIComponent(
          XPConfig.serviceWorkerSourceUrl + "?v=" + XPEnvironment.version
        );
    return ref;
  };
  this.getSubscription = function (pushManager, callback) {
    pushManager
      .getSubscription()
      .then(function (subscription) {
        if (typeof callback == "function") {
          callback(subscription);
        }
      })
      .catch(function (e) {
        XPCoreInstance.log(
          "Failed to retrieve subscription for push notifications: ",
          e
        );
        if (typeof callback == "function") {
          callback(null);
        }
      });
  };
  this.addSubscription = function (pushManager, callback) {
    pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: XPConfig.vapidPublicKey,
      })
      .then(function (subscription) {
        if (typeof callback == "function") {
          callback(subscription);
        }
      })
      .catch(function (e) {
        if (Notification.permission === "denied") {
          XPCoreInstance.log("User denied receiving push notifications.");
        } else {
          XPCoreInstance.log("Failed to subscribe for push notifications: ", e);
        }
        if (typeof callback == "function") {
          callback(null);
        }
      });
  };
  this.shouldResubscribe = function (pushManager, callback) {
    pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: XPConfig.vapidPublicKey,
      })
      .then(function () {
        callback(false);
      })
      .catch(function (e) {
        XPCoreInstance.log("Error when checking subscription: ", e);
        if (
          e.toString().indexOf("unsubscribe") >= 0 ||
          e.toString().indexOf("different application server key") >= 0 ||
          e.toString().indexOf("different applicationServerKey") >= 0
        ) {
          callback(true);
        } else {
          callback(false);
        }
      });
  };
  this.resubscribe = function (pushManager, subscription, callback) {
    subscription
      .unsubscribe()
      .then(function () {
        pushManager
          .subscribe({
            userVisibleOnly: true,
            applicationServerKey: XPConfig.vapidPublicKey,
          })
          .then(function (newSubscription) {
            callback(newSubscription);
          })
          .catch(function (e) {
            XPCoreInstance.log("Error when resubscribing: ", e);
            callback(null);
          });
      })
      .catch(function (e) {
        XPCoreInstance.log("Failed to unsubscribe: ", e);
        callback(subscription);
      });
  };
  this.processSubscription = function (subscription) {
    var token = "";
    var pushSenderId = "";
    var keys = "";
    if (subscription) {
      if (subscription.subscriptionId) {
        token = subscription.subscriptionId;
      } else {
        var matches = subscription.endpoint.match(/([^\/]+)$/);
        token = matches[0];
      }
      var subJson = JSON.parse(JSON.stringify(subscription));
      if (subJson.keys) {
        keys = subJson.keys;
      }
      if (!subscription.options.applicationServerKey) {
        pushSenderId = "";
      } else if (subscription.options.applicationServerKey.byteLength > 30) {
        pushSenderId = "vapid";
      } else {
        if ("TextDecoder" in window) {
          var enc = new TextDecoder("utf-8");
          pushSenderId = enc.decode(subscription.options.applicationServerKey);
        } else {
          pushSenderId = "";
        }
      }
    }
    XPCoreInstance.tokenUpdated(
      token,
      this.getPermission(),
      pushSenderId,
      keys
    );
  };
  this.getPermission = function () {
    if (XPCoreInstance.isFrame) {
      var permission = Notification.permission;
      if (
        permission == "denied" &&
        !XPStoreInstance.get("system_prompt_denied")
      ) {
        return "default";
      } else {
        return permission;
      }
    } else if (!this.requiresWindow()) {
      return Notification.permission;
    } else {
      return XPStoreInstance.get("permission") || "default";
    }
  };
  this.openWindow = function (callbacks) {
    XPWindowManagerInstance.open(callbacks);
  };
  this.checkRequirements = function () {
    if (!("serviceWorker" in navigator)) {
      XPCoreInstance.log("Service worker is not supported.");
      return false;
    }
    if (!("PushManager" in window)) {
      XPCoreInstance.log("Push manager is not supported.");
      return false;
    }
    if (!("showNotification" in ServiceWorkerRegistration.prototype)) {
      XPCoreInstance.log("Notifications are not supported in service worker.");
      return false;
    }
    if (!this.getConfigServiceWorkerUrl()) {
      XPCoreInstance.error("Service worker url is not set.");
      return false;
    }
    if (!this.getConfigManifestUrl() && !XPConfig.vapidPublicKey) {
      XPCoreInstance.error("Manifest url is not set.");
      return false;
    }
    if (this.requiresWindow() && !XPConfig.windowUrl) {
      XPCoreInstance.error("Window url is not set.");
      return false;
    }
    if (!this.requiresWindow() && location.protocol != "https:") {
      XPCoreInstance.error("Http should require window mode");
      return false;
    }
    return true;
  };
  this.getConfigServiceWorkerUrl = function () {
    if (
      this.requiresWindow() ||
      XPCoreInstance.isWindow ||
      XPCoreInstance.isFrame
    ) {
      return XPConfig.serviceWorkerWindowUrl;
    } else {
      return XPConfig.serviceWorkerWebsiteUrl;
    }
  };
  this.getConfigManifestUrl = function () {
    if (
      this.requiresWindow() ||
      XPCoreInstance.isWindow ||
      XPCoreInstance.isFrame
    ) {
      return XPConfig.manifestWindowUrl;
    } else {
      return XPConfig.manifestWebsiteUrl;
    }
  };
  return this;
};
var XPPushSafariManager = function () {
  var self = this;
  this.isLaunched = false;
  this.launch = function () {
    if (!XPConfig.safariPush) {
      return false;
    }
    if (!this.checkRequirements()) {
      XPCoreInstance.log("Safari push messaging requirements check failed.");
      return false;
    }
    var permission = window.safari.pushNotification.permission(
      XPConfig.safariPushID
    );
    this.isLaunched = true;
    if (permission.permission === "default") {
      setTimeout(function () {
        if (XPPushManagerInstance.shouldAutoPrompt()) {
          XPPushManagerInstance.autoPrompt();
        }
      }, 0);
    } else {
      this.processPermission(permission);
    }
    return true;
  };
  this.prompt = function (callbacks) {
    this.requestPermission(callbacks);
  };
  this.requiresWindow = function () {
    return false;
  };
  this.requestPermission = function (callbacks) {
    window.safari.pushNotification.requestPermission(
      XPConfig.backendUrl + "/push/api/safari/" + XPConfig.appKey,
      XPConfig.safariPushID,
      { id: XPStoreInstance.get("id") },
      function () {
        var permission = window.safari.pushNotification.permission(
          XPConfig.safariPushID
        );
        self.processPermission(permission);
        if (permission.permission === "granted" && callbacks.allowCallback) {
          callbacks.allowCallback();
        }
        if (permission.permission === "denied" && callbacks.blockCallback) {
          callbacks.blockCallback();
        }
      }
    );
  };
  this.processPermission = function (permission) {
    if (permission.permission === "denied") {
      XPCoreInstance.tokenUpdated("", permission.permission, null);
    } else if (permission.permission === "granted") {
      XPCoreInstance.tokenUpdated(
        permission.deviceToken,
        permission.permission,
        null
      );
    }
  };
  this.getPermission = function () {
    return window.safari.pushNotification.permission(XPConfig.safariPushID)
      .permission;
  };
  this.checkRequirements = function () {
    if (!("safari" in window)) {
      XPCoreInstance.log("Safari is not supported.");
      return false;
    }
    if (!("pushNotification" in window.safari)) {
      XPCoreInstance.log("PushNotification is not supported.");
      return false;
    }
    if (!XPConfig.safariPushID) {
      XPCoreInstance.error("Safari push ID is not set.");
      return false;
    }
    return true;
  };
  return this;
};
var XPWindowManager = function () {
  this.open = function (callbacks) {
    if (!XPConfig.windowUrl) {
      XPCoreInstance.error("Window URL is not set");
      return;
    }
    var width = 500;
    var height = 400;
    var dualScreenLeft =
      window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop =
      window.screenTop != undefined ? window.screenTop : screen.top;
    var fullWidth = window.innerWidth
      ? window.innerWidth
      : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : screen.width;
    var fullHeight = window.innerHeight
      ? window.innerHeight
      : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : screen.height;
    var left = fullWidth / 2 - width / 2 + dualScreenLeft;
    var top = fullHeight / 2 - height / 2 + dualScreenTop;
    var ref = XPConfig.windowUrl;
    ref += "?id=" + encodeURIComponent(XPStoreInstance.get("id"));
    ref += "&key=" + encodeURIComponent(XPStoreInstance.get("key"));
    var newWindow = window.open(
      ref,
      false,
      "width=" +
        width +
        ", height=" +
        height +
        ", top=" +
        top +
        ", left=" +
        left
    );
    if (!newWindow) {
      XPCoreInstance.error(
        "The attempt to open a window is blocked. Make sure to prompt user in a response for a click event"
      );
      return;
    }
    if (window.focus) {
      newWindow.focus();
    }
    window.addEventListener("message", function (event) {
      if (event.data) {
        try {
          var data = JSON.parse(event.data);
        } catch (e) {}
        if (data) {
          var scope = data[XPEnvironment.sdkKey];
          if (scope && scope.window) {
            XPCoreInstance.log("Received message from the window: ", scope);
            if (scope.token !== undefined && scope.permission !== undefined) {
              XPCoreInstance.tokenUpdated(
                scope.token,
                scope.permission,
                scope.pushSenderId,
                scope.pushKeys
              );
            }
            if (scope.close) {
              XPNotificationCenterInstance.updateSubscriptionControls();
              if (callbacks) {
                setTimeout(function () {
                  var permission = XPPushManagerInstance.getPermission();
                  if (permission == "granted" && callbacks.allowCallback) {
                    callbacks.allowCallback();
                  }
                  if (permission == "denied" && callbacks.blockCallback) {
                    callbacks.blockCallback();
                  }
                  if (permission == "default" && callbacks.dismissCallback) {
                    callbacks.dismissCallback();
                  }
                }, 0);
              }
            }
          }
        }
      }
    });
    window.addEventListener("beforeunload", function () {
      newWindow.close();
    });
  };
  return this;
};
var XPFrameManager = function () {
  var self = this;
  this.messageReceived = false;
  this.iframe = null;
  this.attach = function (callback) {
    if (!XPConfig.frameUrl) {
      XPCoreInstance.error("Frame URL is not set");
      return;
    }
    window.addEventListener("message", function (event) {
      if (event.data) {
        try {
          var data = JSON.parse(event.data);
        } catch (e) {}
        if (data) {
          var scope = data[XPEnvironment.sdkKey];
          if (scope && scope.frame) {
            self.messageReceived = true;
            XPCoreInstance.log("Received message from the frame: ", scope);
            if (scope.token !== undefined && scope.permission !== undefined) {
              XPCoreInstance.tokenUpdated(
                scope.token,
                scope.permission,
                scope.pushSenderId,
                scope.pushKeys
              );
            }
            if (typeof callback == "function") {
              callback();
            }
          }
        }
      }
    });
    var ref = XPConfig.frameUrl;
    ref += "?id=" + encodeURIComponent(XPStoreInstance.get("id"));
    ref += "&key=" + encodeURIComponent(XPStoreInstance.get("key"));
    this.iframe = document.createElement("iframe");
    this.iframe.src = ref;
    this.iframe.style =
      "width:0; height:0; border:0; border:none; visibility: none;";
    this.iframe.setAttribute("id", "webpush-subscription-iframe");
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(this.iframe);
    setTimeout(function () {
      if (!self.messageReceived) {
        XPCoreInstance.log("Waiting for a message from the frame timed out");
        if (typeof callback == "function") {
          callback();
        }
      }
    }, 2500);
  };
  this.subscribe = function (callbacks) {
    var data = {};
    data[XPEnvironment.sdkKey] = { page: true, subscribe: true };
    this.iframe.contentWindow.postMessage(JSON.stringify(data), "*");
  };
  return this;
};
var XPNotificationCenter = function () {
  var self = this;
  this.newestNotificationId = null;
  this.oldestNotificationId = null;
  this.notifications = [];
  this.badge = null;
  this.messageClickCallbacks = [];
  this.badgeUpdateCallbacks = [];
  this.hideInboxButton = false;
  this.init = function () {};
  this.launch = function () {
    if (!XPConfig.notificationCenter || !XPConfig.notificationCenter.enabled) {
      return false;
    }
    if (
      XPConfig.notificationCenter.button != "custom" &&
      this.hideInboxButton != true
    ) {
      this.initButton();
      this.initBadge();
    }
    this.initContent();
    if (XPConfig.notificationCenter.switch) {
      this.initSubscriptionControls();
    } else {
      this.initTitle();
    }
    this.initClose();
    return true;
  };
  this.initButton = function () {
    var el = document.createElement("div");
    el.id = "webpush-notification-center-open";
    el.className =
      "webpush-balloon " +
      "webpush-balloon-" +
      (XPConfig.notificationCenter.color || "light") +
      " " +
      "webpush-notification-center-color-" +
      (XPConfig.notificationCenter.color || "light") +
      " " +
      "webpush-notification-center-position-" +
      (XPConfig.notificationCenter.position || "right");
    document.getElementsByTagName("body")[0].appendChild(el);
    document
      .getElementById("webpush-notification-center-open")
      .addEventListener("click", function () {
        self.open();
      });
  };
  this.addButton = function () {
    this.hideInboxButton = false;
    if (
      !document.contains(
        document.getElementById("webpush-notification-center-open")
      )
    ) {
      this.initButton();
    }
  };
  this.removeButton = function () {
    this.hideInboxButton = true;
    if (
      document.contains(
        document.getElementById("webpush-notification-center-open")
      )
    ) {
      document.getElementById("webpush-notification-center-open").remove();
    }
  };
  this.initContent = function () {
    var el = document.createElement("div");
    el.id = "webpush-notification-center";
    el.className =
      "webpush-reset " +
      "webpush-notification-center-layout-" +
      (XPConfig.notificationCenter.layout || "panel") +
      " " +
      "webpush-notification-center-color-" +
      (XPConfig.notificationCenter.color || "light") +
      " " +
      "webpush-notification-center-position-" +
      (XPConfig.notificationCenter.position || "right");
    el.innerHTML =
      '<div id="webpush-notification-center-header"></div>' +
      '<div id="webpush-notification-center-list"></div>';
    document.getElementsByTagName("body")[0].appendChild(el);
  };
  this.initTitle = function () {
    document.getElementById("webpush-notification-center-header").innerHTML =
      '<div id="webpush-notification-center-icon" class="webpush-notification-center-icon-bell"></div>' +
      '<div id="webpush-notification-center-title"></div>';
  };
  this.updateTitle = function (title) {
    var el = document.getElementById("webpush-notification-center-title");
    if (el) {
      el.innerHTML =
        title !== undefined
          ? title
          : XPTranslationInstance.t("notification_center_title");
    }
  };
  this.clearTitle = function () {
    this.updateTitle("");
  };
  this.initClose = function () {
    var el = document.createElement("div");
    el.id = "webpush-notification-center-close";
    el.className = "webpush-notification-center-icon-close";
    document
      .getElementById("webpush-notification-center-header")
      .appendChild(el);
    document
      .getElementById("webpush-notification-center-close")
      .addEventListener("click", function () {
        self.close();
      });
  };
  this.initSubscriptionControls = function () {
    document.getElementById("webpush-notification-center-header").innerHTML =
      '<div id="webpush-notification-center-subscription"></div>';
    var el = document.createElement("div");
    el.id = "webpush-notification-center-subscription-switch-container";
    el.className = "webpush-onoffswitch-container";
    el.innerHTML =
      "" +
      '<div class="webpush-onoffswitch-tooltip"></div>' +
      '<div class="webpush-onoffswitch">' +
      '<input type="checkbox" class="webpush-onoffswitch-checkbox" id="webpush-notification-center-subscription-switch">' +
      '<label class="webpush-onoffswitch-label" for="webpush-notification-center-subscription-switch"></label>' +
      "</div>";
    document
      .getElementById("webpush-notification-center-subscription")
      .appendChild(el);
    var elToolip = document.querySelector(
      ".webpush-onoffswitch-container .webpush-onoffswitch-tooltip"
    );
    el.addEventListener("mouseover", function () {
      elToolip.style.display = "block";
    });
    el.addEventListener("mouseout", function () {
      elToolip.style.display = "none";
    });
    var el2 = document.createElement("div");
    el2.id = "webpush-notification-center-subscription-status";
    document
      .getElementById("webpush-notification-center-subscription")
      .appendChild(el2);
    this.updateSubscriptionControls();
    document
      .getElementById("webpush-notification-center-subscription-switch")
      .addEventListener("change", function () {
        if (this.checked) {
          switch (XPPushManagerInstance.getPermission()) {
            case "default":
            case "deregistered":
              XPCoreInstance.setSubscription(true);
              XPPushManagerInstance.prompt();
              self.updateSubscriptionControls(true);
              break;
            case "granted":
              XPCoreInstance.setSubscription(true);
              self.updateSubscriptionControls(true);
              break;
            case "denied":
              alert(
                XPTranslationInstance.t(
                  "notification_center_turn_on_push_in_browser"
                )
              );
              self.updateSubscriptionControls(false);
              break;
            case "unavailable":
              alert(
                XPTranslationInstance.t(
                  "notification_center_error_no_push_in_browser"
                )
              );
              self.updateSubscriptionControls(false);
              break;
          }
        } else {
          XPCoreInstance.setSubscription(false);
          self.updateSubscriptionControls(false);
        }
      });
  };
  this.updateSubscriptionControls = function (on) {
    var elSwitch = document.getElementById(
      "webpush-notification-center-subscription-switch"
    );
    var elStatus = document.getElementById(
      "webpush-notification-center-subscription-status"
    );
    var elToolip = document.querySelector(
      ".webpush-onoffswitch-container .webpush-onoffswitch-tooltip"
    );
    if (elSwitch && elStatus) {
      if (on === undefined)
        on =
          XPPushManagerInstance.getPermission() == "granted" &&
          XPStoreInstance.get("subscription");
      if (on) {
        elSwitch.checked = true;
        elStatus.innerHTML = XPTranslationInstance.t(
          "notification_center_title"
        );
        elStatus.className =
          "webpush-notification-center-subscription-status-on";
        elToolip.innerHTML = XPTranslationInstance.t(
          "notification_center_status_push_on"
        );
      } else {
        elSwitch.checked = false;
        elStatus.innerHTML = XPTranslationInstance.t(
          "notification_center_title"
        );
        elStatus.className =
          "webpush-notification-center-subscription-status-off";
        elToolip.innerHTML = XPTranslationInstance.t(
          "notification_center_status_push_off"
        );
      }
    }
  };
  this.addNotification = function (notification) {
    if (
      notification.expiration_time &&
      notification.expiration_time < Math.round(new Date().getTime() / 1e3)
    ) {
      return;
    }
    notification.message.id = parseInt(notification.message.id);
    if (
      this.newestNotificationId === null ||
      notification.message.id > this.newestNotificationId
    ) {
      this.newestNotificationId = notification.message.id;
    }
    if (
      this.oldestNotificationId === null ||
      notification.message.id < this.oldestNotificationId
    ) {
      this.oldestNotificationId = notification.message.id;
    }
    var insertBefore;
    for (var i = 0; i < this.notifications.length; i++) {
      if (this.notifications[i].message.id == notification.message.id) {
        return;
      }
      if (this.notifications[i].message.id < notification.message.id) {
        insertBefore = this.notifications[i].message.id;
        this.notifications.splice(i, 0, notification);
        break;
      }
    }
    if (!insertBefore) {
      this.notifications.push(notification);
    }
    var el = document.createElement("div");
    var itemClass = "webpush-notification-center-item";
    var cardStyle = "";
    var titleStyle = "";
    if (
      notification.message.style !== undefined &&
      notification.message.style.type !== undefined
    ) {
      itemClass +=
        " " +
        itemClass +
        "-webinbox-" +
        (notification.message.style.type == 1 ? "card" : "alert");
      cardStyle =
        notification.message.style.bg && notification.message.style.type == 1
          ? "background: " + notification.message.style.bg + ";"
          : "";
      titleStyle =
        notification.message.style.title_bg &&
        notification.message.style.type == 1
          ? "background: " + notification.message.style.title_bg + ";"
          : "";
    }
    el.className =
      itemClass +
      " webpush-notification-center-item-" +
      notification.message.id;
    el.setAttribute("style", cardStyle);
    el.innerHTML =
      '<img class="webpush-notification-center-item-image" src="' +
      (notification.message.icon || XPConfig.iconLarge) +
      '">' +
      '<div class="webpush-notification-center-item-title" style="' +
      titleStyle +
      '">' +
      notification.message.title +
      "</div>" +
      '<div class="webpush-notification-center-item-text-container">' +
      '<div class="webpush-notification-center-item-text">' +
      notification.message.alert +
      "</div>" +
      '<div class="webpush-notification-center-item-date">' +
      new Date(notification.create_time * 1e3).toLocaleString() +
      "</div>" +
      "</div>" +
      '<div class="webpush-clearfix"></div>';
    el.addEventListener("click", function () {
      self.processMessageClickCallbacks(notification);
      var url = undefined;
      if (notification.message.url) {
        url = notification.message.url;
      } else if (notification.message["url-args"]) {
        url =
          XPConfig.backendUrl +
          "/push/api/actionPage" +
          notification.message["url-args"][0];
      }
      if (url) {
        var urlBlank = notification.message.url_blank;
        window.open(
          url,
          urlBlank || urlBlank === undefined ? "_blank" : "_self"
        );
      } else {
        XPApiInstance.inboxMessageActionsHit(
          [{ id: notification.id, open: 1, click: 1 }],
          function (result) {
            if (result.badge !== undefined) {
              self.updateBadge(result.badge);
            }
          }
        );
      }
    });
    this.hidePlaceholder();
    if (insertBefore) {
      document
        .getElementById("webpush-notification-center-list")
        .insertBefore(
          el,
          document.getElementsByClassName(
            "webpush-notification-center-item-" + insertBefore
          )[0]
        );
    } else {
      document
        .getElementById("webpush-notification-center-list")
        .appendChild(el);
    }
  };
  this.removeNotification = function (i) {
    if (this.notifications[i]) {
      var elements = document.getElementsByClassName(
        "webpush-notification-center-item-" + this.notifications[i].message.id
      );
      if (elements[0]) {
        elements[0].remove();
      }
    }
  };
  this.cleanInbox = function () {
    if (this.notifications) {
      for (var i = 0; i < this.notifications.length; i++) {
        this.removeNotification(i);
      }
    }
    this.newestNotificationId = null;
    this.oldestNotificationId = null;
    this.notifications = [];
    this.badge = null;
  };
  this.removeExpiredNotifications = function () {
    var timestamp = Math.round(new Date().getTime() / 1e3);
    for (var i = 0; i < this.notifications.length; i++) {
      if (
        this.notifications[i].expiration_time &&
        this.notifications[i].expiration_time <= timestamp
      ) {
        this.removeNotification(i);
      }
    }
  };
  this.open = function () {
    this.clearTitle();
    this.removeExpiredNotifications();
    if (document.getElementById("webpush-notification-center-open")) {
      document.getElementById(
        "webpush-notification-center-open"
      ).style.display = "none";
    }
    document.getElementById("webpush-notification-center").style.display =
      "block";
    if (!this.notifications.length) {
      this.load();
    } else {
      this.load("new");
    }
  };
  this.close = function () {
    document.getElementById("webpush-notification-center").style.display =
      "none";
    if (document.getElementById("webpush-notification-center-open")) {
      document.getElementById(
        "webpush-notification-center-open"
      ).style.display = "block";
    }
  };
  this.load = function (direction) {
    this.hidePlaceholder();
    var slTimeout = setTimeout(function () {
      self.showLoading(direction == "more" ? "bottom" : "top");
    }, 500);
    var params;
    switch (direction) {
      case "new":
        params = { min_id: this.newestNotificationId };
        break;
      case "more":
        params = {
          max_id: this.oldestNotificationId,
          limit: XPConfig.notificationCenter.pagination,
        };
        break;
      default:
        params = { limit: XPConfig.notificationCenter.pagination };
        break;
    }
    XPApiInstance.inboxList(
      params,
      function (result) {
        clearTimeout(slTimeout);
        self.hideLoading();
        self.updateTitle();
        if (result.badge !== undefined) {
          self.updateBadge(result.badge);
        }
        for (var i = 0; i < result.items.length; i++) {
          self.addNotification(result.items[i]);
        }
        if (direction != "new") {
          if (result.more) {
            self.showLoadMore();
          } else {
            self.hideLoadMore();
          }
        }
        if (!self.notifications.length) {
          self.showPlaceholder();
        }
      },
      function () {
        clearTimeout(slTimeout);
        self.hideLoading();
      }
    );
  };
  this.showLoading = function (position) {
    if (!document.getElementById("webpush-notification-center-title-loader")) {
      var titleLoader = document.createElement("div");
      titleLoader.id = "webpush-notification-center-title-loader";
      titleLoader.innerHTML = '<div class="webpush-loader"><div></div></div>';
      document.getElementById("webpush-notification-center-title").innerHTML =
        titleLoader.outerHTML;
    }
    if (!document.getElementById("webpush-notification-center-loader")) {
      var contentLoader = document.createElement("div");
      contentLoader.id = "webpush-notification-center-loader";
      contentLoader.innerHTML = '<div class="webpush-loader"><div></div></div>';
      if (position == "bottom" || !this.notifications.length) {
        document
          .getElementById("webpush-notification-center-list")
          .appendChild(contentLoader);
      } else {
        document
          .getElementById("webpush-notification-center-list")
          .insertBefore(
            contentLoader,
            document.getElementsByClassName(
              "webpush-notification-center-item"
            )[0]
          );
      }
    }
  };
  this.hideLoading = function () {
    var titleLoader = document.getElementById(
      "webpush-notification-center-title-loader"
    );
    if (titleLoader) titleLoader.remove();
    var contentLoader = document.getElementById(
      "webpush-notification-center-loader"
    );
    if (contentLoader) contentLoader.remove();
  };
  this.showLoadMore = function () {
    if (!document.getElementById("webpush-notification-center-load-more")) {
      var el = document.createElement("div");
      el.id = "webpush-notification-center-load-more";
      el.innerHTML = XPTranslationInstance.t("notification_center_show_more");
      el.addEventListener("click", function () {
        self.hideLoadMore();
        self.load("more");
      });
      document
        .getElementById("webpush-notification-center-list")
        .appendChild(el);
    }
  };
  this.hideLoadMore = function () {
    var el = document.getElementById("webpush-notification-center-load-more");
    if (el) el.remove();
  };
  this.showPlaceholder = function () {
    if (!document.getElementById("webpush-notification-center-placeholder")) {
      var el = document.createElement("div");
      el.id = "webpush-notification-center-placeholder";
      el.innerHTML = XPTranslationInstance.t(
        "notification_center_no_notifications"
      );
      document
        .getElementById("webpush-notification-center-list")
        .appendChild(el);
    }
  };
  this.hidePlaceholder = function () {
    var el = document.getElementById("webpush-notification-center-placeholder");
    if (el) el.remove();
  };
  this.initBadge = function () {
    XPApiInstance.inboxBadge(null, function (result) {
      if (result.badge !== undefined) {
        self.updateButtonBadge(result.badge);
      }
    });
  };
  this.updateButtonBadge = function (badge) {
    var el = document.getElementById("webpush-notification-center-open");
    if (!el) return;
    if (+badge > 0) {
      el.setAttribute("badge-count", badge);
    } else {
      el.removeAttribute("badge-count");
    }
  };
  this.updateBadge = function (badge) {
    if (
      XPConfig.notificationCenter.button != "custom" &&
      this.hideInboxButton != true
    ) {
      self.updateButtonBadge(badge);
    }
    this.badge = badge;
    this.processBadgeUpdateCallbacks(badge);
  };
  this.getPublicMessage = function (notification) {
    return {
      id: notification.id.toString(),
      campaign_id: notification.message.cid.toString(),
      title: notification.message.title,
      text: notification.message.alert,
      icon: notification.message.icon,
      data: notification.message.payload_map || {},
    };
  };
  this.processMessageClickCallbacks = function (notification) {
    var message = self.getPublicMessage(notification);
    for (var i = 0; i < self.messageClickCallbacks.length; i++) {
      setTimeout(
        (function (callback) {
          if (typeof callback == "function") {
            callback(message);
          }
        })(self.messageClickCallbacks[i]),
        0
      );
    }
  };
  this.processBadgeUpdateCallbacks = function (badge) {
    for (var i = 0; i < self.badgeUpdateCallbacks.length; i++) {
      setTimeout(
        (function (callback) {
          if (typeof callback == "function") {
            callback(badge);
          }
        })(self.badgeUpdateCallbacks[i]),
        0
      );
    }
  };
  this.addMessageClickCallback = function (callback) {
    this.messageClickCallbacks.push(callback);
  };
  this.addBadgeUpdateCallback = function (callback) {
    this.badgeUpdateCallbacks.push(callback);
  };
  return this.init();
};
var XPLocalNotification = function (notification) {
  var self = this;
  this.el = null;
  this.init = function () {
    this.el = this.render();
    return this;
  };
  this.render = function () {
    var el = document.createElement("div");
    el.style.opacity = 0;
    el.className = "webpush-local-notification";
    el.innerHTML =
      '<img class="webpush-local-notification-image">' +
      '<div class="webpush-local-notification-title">' +
      notification.title +
      "</div>" +
      '<div class="webpush-local-notification-text">' +
      notification.alert +
      "</div>" +
      '<div class="webpush-local-notification-close">x</div>';
    var elStack = document.getElementById("webpush-local-notification-stack");
    if (!elStack) elStack = this.renderStack();
    elStack.appendChild(el);
    el.getElementsByClassName(
      "webpush-local-notification-image"
    )[0].addEventListener("load", function () {
      self.show();
    });
    el.getElementsByClassName("webpush-local-notification-image")[0].src =
      notification.icon ? notification.icon : XPConfig.iconLarge;
    el.getElementsByClassName(
      "webpush-local-notification-close"
    )[0].addEventListener("click", function (event) {
      event.stopPropagation();
      self.close();
    });
    var url = undefined;
    var javascript = undefined;
    if (notification.url) {
      url = notification.url;
    } else if (notification["url-args"]) {
      url =
        XPConfig.backendUrl +
        "/push/api/actionPage" +
        notification["url-args"][0];
    } else if (notification.javascript) {
      javascript = notification.javascript;
    }
    if (url) {
      el.addEventListener("click", function () {
        window.open(url);
      });
    } else if (javascript) {
      el.addEventListener("click", function () {
        setTimeout(function () {
          eval(javascript);
        }, 0);
      });
    }
    return el;
  };
  this.renderStack = function () {
    var el = document.createElement("div");
    el.id = "webpush-local-notification-stack";
    el.className = "webpush-reset";
    document.getElementsByTagName("body")[0].appendChild(el);
    return el;
  };
  this.show = function () {
    setTimeout(function () {
      self.el.style.opacity = 1;
    }, 0);
    setTimeout(function () {
      self.close();
    }, 2e4);
  };
  this.close = function () {
    if (self.el) {
      self.el.style.opacity = 0;
      setTimeout(function () {
        self.el.remove();
        self.el = null;
      }, 200);
    }
  };
  return this.init();
};
var XPPageHelper = function () {
  var self = this;
  this.scrollCallbacks = [];
  this.mouseoutCallbacks = [];
  this.init = function () {
    this.addEvent(document, "mouseout", this.mouseoutHandler);
    this.addEvent(window, "scroll", this.scrollHandler);
    return this;
  };
  this.addMouseoutCallback = function (callback) {
    this.mouseoutCallbacks.push(callback);
  };
  this.addScrollCallback = function (callback) {
    this.scrollCallbacks.push(callback);
  };
  this.addEvent = function (obj, evt, fn) {
    if (obj.addEventListener) {
      obj.addEventListener(evt, fn, false);
    } else if (obj.attachEvent) {
      obj.attachEvent("on" + evt, fn);
    }
  };
  this.removeEvent = function (obj, evt, fn) {
    if (obj.addEventListener) {
      obj.removeEventListener(evt, fn, false);
    } else if (obj.attachEvent) {
      obj.detachEvent("on" + evt, fn);
    }
  };
  this.mouseoutHandler = function (e) {
    e = e ? e : window.event;
    var from = e.relatedTarget || e.toElement;
    if (!from) {
      XPCoreInstance.log("webpush-mouseout event triggered");
      self.removeEvent(document, "mouseout", self.mouseoutHandler);
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "webpush-mouseout" });
      if (typeof self.mouseoutCallbacks != "undefined") {
        for (var i = 0; i < self.mouseoutCallbacks.length; i++) {
          setTimeout(
            (function (callback) {
              if (typeof callback == "function") {
                callback();
              }
            })(self.mouseoutCallbacks[i]),
            0
          );
        }
      }
      self.mouseoutCallbacks = [];
    }
  };
  this.scrollHandler = function () {
    var scrolled = window.pageYOffset || document.documentElement.scrollTop;
    var checkScroll = scrolled > self.lastScrollTop;
    self.lastScrollTop = scrolled;
    var check = scrolled >= 600;
    if (checkScroll) {
      if (check) {
        XPCoreInstance.log("webpush-scrolled event triggered");
        self.removeEvent(window, "scroll", self.scrollHandler);
        window.dataLayer = window.dataLayer || [];
        dataLayer.push({ event: "webpush-scrolled" });
        if (typeof self.scrollCallbacks != "undefined") {
          for (var i = 0; i < self.scrollCallbacks.length; i++) {
            setTimeout(
              (function (callback) {
                if (typeof callback == "function") {
                  callback();
                }
              })(self.scrollCallbacks[i]),
              0
            );
          }
        }
        self.scrollCallbacks = [];
      }
    }
  };
  return this.init();
};
var XPPopupMessage = function (popupMessage) {
  var self = this;
  this.delay = 300;
  this.init = function () {
    this.config = popupMessage;
    this.renderPopup();
    return this;
  };
  this.submitEmail = function (inputData, button) {
    if (inputData && inputData.value && typeof inputData.value === "string") {
      var email = inputData.value;
      if (email.indexOf("@") > -1 && email.indexOf(".") > -1) {
        var importOptions;
        if (
          self.config.email_subscription === undefined ||
          self.config.email_subscription
        ) {
          importOptions = { email: email, email_subscription: 1 };
        } else {
          importOptions = { email: email };
        }
        XPCoreInstance.import(importOptions, function () {
          XPApiInstance.actionHit(self.config.id, button);
          var submitOptions = self.config.email_submit;
          if (submitOptions) {
            switch (submitOptions.action) {
              case "standard":
                self.renderEmailConfirmation(email);
                break;
              case "javascript":
                setTimeout(function () {
                  eval(submitOptions.javascript);
                }, 0);
                break;
              case "dismiss":
                break;
            }
          } else {
            self.renderEmailConfirmation(email);
          }
        });
      } else {
        self.renderPopup(true, email);
      }
    } else {
      self.renderPopup(true, null);
    }
  };
  this.renderEmailConfirmation = function (email) {
    var successConfig = {};
    successConfig.type = "success";
    successConfig.title = "Success";
    successConfig.html = "Submitted email: " + email;
    successConfig.customClass = "webpush-scroll-content";
    if (self.config.style && self.config.style.width)
      successConfig.width = self.config.style.width + "px";
    webpushSwal(successConfig);
  };
  this.renderPopup = function (showError, incorrectEmail) {
    showError = typeof showError !== "undefined" ? showError : false;
    incorrectEmail =
      typeof incorrectEmail !== "undefined" ? incorrectEmail : null;
    if (self.config) {
      var swalConfig = {};
      if (self.config.image) {
        if (self.config.image.type) {
          swalConfig.type = self.config.image.type;
        } else {
          if (self.config.image.url)
            swalConfig.imageUrl = self.config.image.url;
          if (self.config.image.width)
            swalConfig.imageWidth = self.config.image.width + "px";
          if (self.config.image.height)
            swalConfig.imageHeight = self.config.image.height + "px";
          if (self.config.image.alt)
            swalConfig.imageAlt = self.config.image.alt;
          if (self.config.image.link) {
            swalConfig.onBeforeOpen = function () {
              var image = document
                .getElementsByClassName("webpush-swal2-modal")[0]
                .getElementsByClassName("webpush-swal2-image")[0];
              if (image) {
                image.style.cursor = "pointer";
                image.onclick = function () {
                  XPApiInstance.actionHit(
                    self.config.id,
                    "image",
                    1,
                    null,
                    function () {
                      location.href = self.config.image.link;
                    }
                  );
                };
              }
            };
          }
        }
      }
      if (self.config.title) swalConfig.title = self.config.title;
      if (self.config.html) swalConfig.html = self.config.html;
      if (self.config.footer) swalConfig.footer = self.config.footer;
      var cancelButton = -1;
      var confirmButton = -1;
      if (self.config.buttons) {
        if (self.config.buttons[0]) {
          var button1 = self.config.buttons[0];
          var flag1 = button1.action === "dismiss";
          var text1;
          if (button1.text) {
            if (button1.text_color)
              text1 =
                '<span style="color: ' +
                button1.text_color +
                '">' +
                button1.text +
                "</span>";
            else text1 = button1.text;
          }
          if (
            self.config.buttons[1] &&
            self.config.buttons[1].action &&
            self.config.buttons[1].action !== "none"
          ) {
            var button2 = self.config.buttons[1];
            var flag2 = button2.action === "dismiss";
            swalConfig.showCancelButton = true;
            var text2;
            if (button2.text) {
              if (button2.text_color)
                text2 =
                  '<span style="color: ' +
                  button2.text_color +
                  '">' +
                  button2.text +
                  "</span>";
              else text2 = button2.text;
            }
            if (flag1 && !flag2) {
              swalConfig.reverseButtons = true;
            } else if (!flag1 && flag2) {
            } else if (flag1) {
            } else {
              if (button1.action === "submit" && button2.action !== "submit") {
              } else if (
                button1.action !== "submit" &&
                button2.action === "submit"
              ) {
                swalConfig.reverseButtons = true;
              } else {
              }
            }
            if (swalConfig.reverseButtons) {
              cancelButton = 0;
              confirmButton = 1;
              if (text1) swalConfig.cancelButtonText = text1;
              if (button1.color) swalConfig.cancelButtonColor = button1.color;
              if (text2) swalConfig.confirmButtonText = text2;
              if (button2.color) swalConfig.confirmButtonColor = button2.color;
            } else {
              cancelButton = 1;
              confirmButton = 0;
              if (text1) swalConfig.confirmButtonText = text1;
              if (button1.color) swalConfig.confirmButtonColor = button1.color;
              if (text2) swalConfig.cancelButtonText = text2;
              if (button2.color) swalConfig.cancelButtonColor = button2.color;
            }
          } else {
            if (flag1) {
              swalConfig.showConfirmButton = false;
              swalConfig.showCancelButton = true;
              if (text1) swalConfig.cancelButtonText = text1;
              if (button1.color) swalConfig.cancelButtonColor = button1.color;
              cancelButton = 0;
            } else {
              if (text1) swalConfig.confirmButtonText = text1;
              if (button1.color) swalConfig.confirmButtonColor = button1.color;
              confirmButton = 0;
            }
          }
        } else {
          swalConfig.showConfirmButton = false;
        }
      } else {
        swalConfig.showConfirmButton = false;
      }
      if (
        confirmButton > -1 &&
        self.config.buttons[confirmButton] &&
        self.config.buttons[confirmButton].action !== "submit"
      ) {
        swalConfig.inputValidator = function (value) {
          return new Promise(function (resolve, reject) {
            resolve();
          });
        };
      }
      if (self.config.email === 1) {
        swalConfig.input = "email";
        swalConfig.inputPlaceholder = "info@example.com";
        swalConfig.showLoaderOnConfirm = true;
        if (showError && incorrectEmail) swalConfig.inputValue = incorrectEmail;
      }
      if (self.config.style) {
        if (self.config.style.background)
          swalConfig.background = self.config.style.background;
        if (self.config.style.backdrop)
          swalConfig.backdrop = self.config.style.backdrop;
        if (self.config.style.width)
          swalConfig.width = self.config.style.width + "px";
        if (self.config.style.padding)
          swalConfig.padding = self.config.style.padding;
        if (self.config.style.scroll) {
          if (self.config.style.scroll === "content")
            swalConfig.customClass = "webpush-scroll-content";
        }
      }
      if (showError) swalConfig.animation = false;
      swalConfig.showCloseButton = true;
      if (self.config.options) {
        if (self.config.options.close === 0) swalConfig.showCloseButton = false;
        if (self.config.options.esc === 0) swalConfig.allowEscapeKey = false;
        if (self.config.options.outside === 0)
          swalConfig.allowOutsideClick = false;
        if (self.config.options.focus_confirm === 0)
          swalConfig.focusConfirm = false;
      }
      webpushSwal(swalConfig).then(function (result) {
        if (!result.dismiss) {
          if (confirmButton > -1 && self.config.buttons[confirmButton]) {
            if (self.config.buttons[confirmButton].action === "submit") {
              self.submitEmail(result, "button_" + confirmButton);
            } else if (self.config.buttons[confirmButton].action === "url") {
              XPApiInstance.actionHit(
                self.config.id,
                "button_" + confirmButton
              );
              if (self.config.buttons[confirmButton].url) {
                if (self.config.buttons[confirmButton].url_blank) {
                  window.open(self.config.buttons[confirmButton].url, "_blank");
                } else {
                  setTimeout(function () {
                    location.href = self.config.buttons[confirmButton].url;
                  }, self.delay);
                }
              }
            } else if (
              self.config.buttons[confirmButton].action === "javascript"
            ) {
              XPApiInstance.actionHit(
                self.config.id,
                "button_" + confirmButton
              );
              if (self.config.buttons[confirmButton].javascript) {
                setTimeout(function () {
                  eval(self.config.buttons[confirmButton].javascript);
                }, 0);
              }
            } else {
              XPApiInstance.actionHit(
                self.config.id,
                "button_" + confirmButton,
                0
              );
            }
          } else {
            XPApiInstance.actionHit(self.config.id, "confirm", 0);
          }
        } else {
          var dismissButton;
          if (result.dismiss === "cancel") {
            if (cancelButton > -1 && self.config.buttons[cancelButton]) {
              if (self.config.buttons[cancelButton].action === "submit") {
                var tempContent = {};
                tempContent.value = webpushSwal.getInput().value;
                self.submitEmail(tempContent, "button_" + cancelButton);
              } else if (self.config.buttons[cancelButton].action === "url") {
                XPApiInstance.actionHit(
                  self.config.id,
                  "button_" + cancelButton
                );
                if (self.config.buttons[cancelButton].url) {
                  if (self.config.buttons[cancelButton].url_blank) {
                    window.open(
                      self.config.buttons[cancelButton].url,
                      "_blank"
                    );
                  } else {
                    setTimeout(function () {
                      location.href = self.config.buttons[cancelButton].url;
                    }, self.delay);
                  }
                }
              } else if (
                self.config.buttons[cancelButton].action === "javascript"
              ) {
                XPApiInstance.actionHit(
                  self.config.id,
                  "button_" + cancelButton
                );
                if (self.config.buttons[cancelButton].javascript) {
                  setTimeout(function () {
                    eval(self.config.buttons[cancelButton].javascript);
                  }, 0);
                }
              } else {
                dismissButton = "button_" + cancelButton;
              }
            } else {
              dismissButton = "cancel";
            }
          } else {
            if (
              result.dismiss === "close" ||
              result.dismiss === "esc" ||
              result.dismiss === "overlay" ||
              result.dismiss === "timer"
            ) {
              dismissButton = result.dismiss;
            }
          }
          if (dismissButton) {
            XPApiInstance.actionHit(self.config.id, dismissButton, 0);
          }
        }
        self.clearImage();
      });
      if (self.config.style.footer && self.config.style.footer.separator) {
        document.getElementsByClassName(
          "webpush-swal2-footer"
        )[0].style.borderTopColor = self.config.style.footer.separator;
      }
      if (showError) webpushSwal.showValidationError("Invalid email address");
    }
  };
  this.clearImage = function () {
    try {
      document
        .getElementsByClassName("webpush-swal2-modal")[0]
        .getElementsByClassName("webpush-swal2-image")[0].src = "#";
    } catch (err) {}
  };
  return this.init();
};
var XPInterface = function () {
  this.call = function (args) {
    if (!args[0]) return null;
    if (!this[args[0]]) {
      console.error(args[0] + " method is undefined");
      return null;
    }
    return this[args[0]].apply(this, Array.prototype.slice.call(args, 1));
  };
  this.ready = function (callback) {
    XPCoreInstance.addReadyCallback(callback);
  };
  this.config = function (key, value) {
    XPCoreInstance.setConfig(key, value);
  };
  this.debug_logs = function (value) {
    XPCoreInstance.setDebugLogsEnabled(value);
  };
  this.on = function (key, callback) {
    switch (key) {
      case "mouseout":
        XPPageHelperInstance.addMouseoutCallback(callback);
        break;
      case "scroll":
        XPPageHelperInstance.addScrollCallback(callback);
        break;
      case "native_onsite":
        XPCustomMessageHandlerInstance.setNativeOnsiteSubscription(callback);
        break;
    }
  };
  this.set = function (key, value, success, error) {
    switch (key) {
      case "app_language":
        XPCoreInstance.setAppLanguage(value, success, error);
        break;
      case "app_version":
        XPCoreInstance.setAppVersion(value, success, error);
        break;
      case "external_id":
        XPCoreInstance.setExternalID(value, success, error);
        break;
      case "user_id":
        XPCoreInstance.setUserID(value, success, error);
        break;
      case "email":
        XPCoreInstance.setEmail(value, success, error);
        break;
      case "subscription":
        XPCoreInstance.setSubscription(value, success, error);
        break;
      default:
        console.error(key + " is undefined in set scope");
        break;
    }
  };
  this.message = function (key, action_id, context) {
    switch (key) {
      case "delivered":
        XPApiInstance.actionDelivered(action_id, context);
        break;
      case "opened":
        XPApiInstance.actionHit(action_id, null, 1, context);
        break;
      default:
        console.error(key + " is undefined in set scope");
        break;
    }
  };
  this.get = function (key) {
    switch (key) {
      case "device_info":
        return XPCoreInstance.deviceInfo();
      default:
        console.error(key + " is undefined in get scope");
        break;
    }
  };
  this.import = function (profile, success, error) {
    XPCoreInstance.import(profile, success, error);
  };
  this.user = function (key, value, success, error) {
    switch (key) {
      case "update":
        XPCoreInstance.updateUser(value, success, error);
        break;
      case "import":
        XPCoreInstance.import(value, success, error);
        break;
      default:
        console.error(key + " is undefined in set scope");
        break;
    }
  };
  this.event = function (title, value) {
    this.ready(function () {
      XPCoreInstance.eventHit(title, value);
    });
  };
  this.tag = function (title, value) {
    this.ready(function () {
      XPCoreInstance.tagHit(title, value);
    });
  };
  this.impression = function (title) {
    this.ready(function () {
      XPCoreInstance.impressionHit(title);
    });
  };
  this.ga = function (value) {
    XPCoreInstance.setGaId(value);
  };
  this.push = function (action, param1, param2) {
    switch (action) {
      case "prompt":
        this.prompt(param1);
        break;
      case "auto_prompt":
        this.auto_prompt(param1, param2);
        break;
      case "permission":
        return XPCoreInstance.pushPermission();
      default:
        console.error(action + " is undefined in push scope");
        break;
    }
  };
  this.prompt = function (callbacks) {
    XPCoreInstance.prompt(callbacks);
  };
  this.auto_prompt = function (action, value) {
    if (action === true) {
      XPConfig.promptParams.autoPrompt = true;
    } else if (action === false) {
      XPConfig.promptParams.autoPrompt = false;
    } else if (action == "start") {
      XPConfig.promptParams.autoPromptStart = value;
    } else if (action == "repeat") {
      XPConfig.promptParams.autoPromptRepeat = value;
    } else if (action === undefined) {
      XPCoreInstance.autoPrompt();
    } else {
      console.error(action + " is undefined in push.auto_prompt scope");
    }
  };
  this.inbox = function (action, options, success, error) {
    if (options) {
      if (success === undefined) {
        success = options.success;
      }
      if (error === undefined) {
        error = options.error;
      }
    }
    switch (action) {
      case "open":
        XPNotificationCenterInstance.open();
        break;
      case "close":
        XPNotificationCenterInstance.close();
        break;
      case "badge":
        XPApiInstance.inboxBadge(options, success, error);
        break;
      case "message.count":
        XPApiInstance.inboxMessageCount(options, success, error);
        break;
      case "message.list":
        XPApiInstance.inboxMessageList(options, success, error);
        break;
      case "message.action":
        XPApiInstance.inboxMessageActionsHit([options], success, error);
        break;
      case "message.actions":
        XPApiInstance.inboxMessageActionsHit(options, success, error);
        break;
      case "on.message.click":
        XPNotificationCenterInstance.addMessageClickCallback(options);
        break;
      case "on.badge.update":
        XPNotificationCenterInstance.addBadgeUpdateCallback(options);
        break;
      case "button.show":
        XPNotificationCenterInstance.addButton();
        break;
      case "button.hide":
        XPNotificationCenterInstance.removeButton();
        break;
      default:
        console.error(action + " is undefined in the inbox scope");
        break;
    }
  };
  this.translate = function (message, params) {
    return XPTranslationInstance.t(message, params);
  };
};
var XPTranslation = function () {
  this.navigatorLanguage = null;
  this.defaultLanguage = "en";
  this.init = function () {
    this.navigatorLanguage = navigator.language.substring(0, 2);
    return this;
  };
  this.getLanguage = function () {
    if (XPStoreInstance.get("app_language")) {
      return XPStoreInstance.get("app_language");
    } else if (this.navigatorLanguage) {
      return this.navigatorLanguage;
    } else {
      return this.defaultLanguage;
    }
  };
  this.t = function (message, params) {
    return this.translate(this.getLanguage(), message, params);
  };
  this.translate = function (language, message, params) {
    if (!XPTranslations[language] || !XPTranslations[language][message]) {
      if (language != this.defaultLanguage) {
        return this.translate(this.defaultLanguage, message, params);
      } else {
        return null;
      }
    }
    return this.adjust(XPTranslations[language][message], params);
  };
  this.adjust = function (message, params) {
    params = params || { website_name: XPConfig.websiteName };
    for (var i in params) {
      var re = new RegExp("{" + i + "}", "g");
      message = message.replace(re, params[i]);
    }
    return message;
  };
  return this.init();
};
var XPCustomMessageHandler = function () {
  var self = this;
  this.native_onsite_callback = null;
  this.setNativeOnsiteSubscription = function (nativeOnsiteCallback) {
    self.native_onsite_callback = nativeOnsiteCallback;
    XPCoreInstance.log("registered inline callback");
  };
  this.callNativeCallback = function (data) {
    if (
      self.native_onsite_callback &&
      typeof self.native_onsite_callback == "function"
    )
      self.native_onsite_callback(data);
  };
  return this;
};
var XPStyle =
  " .webpush-window-body { height: 100%; min-height: 100%; padding: 0; margin: 0;}#webpush-window { position: absolute; text-align: center; width: 100%; left: 0; top: 50%; opacity: 0;}#webpush-window-image { height: 128px; margin-bottom: 10px;}#webpush-window-title { font-size: 22px; padding: 0 5px;}#webpush-window-text { color: #333333; margin-top: 15px; padding: 0 5px; line-height: 22px;}#webpush-custom-prompt { position: fixed; z-index: 9999999; width: 320px; max-width: 100%; padding: 10px; top: 0; left: 50%; margin-left: -170px; background-color: rgb(231,232,233); box-shadow: 0px 0px 6px #888888; color: #000000; font-family: 'Trebuchet MS', Helvetica, sans-serif;}#webpush-custom-prompt-image { width: 64px; position: absolute; top: 15px; left: 15px;}#webpush-custom-prompt-title { margin-left: 90px; margin-top: 4px; font-size: 13px; font-weight: bold; line-height: 18px;}#webpush-custom-prompt-text { font-size: 10px; margin-left: 90px; margin-top: 5px; line-height: 15px;}#webpush-custom-prompt-buttons { padding-top: 10px; padding-right: 10px; padding-bottom: 10px; float: right;}#webpush-custom-prompt-button1 { background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #ffffff), color-stop(1, #f6f6f6)); background:-moz-linear-gradient(top, #ffffff 5%, #f6f6f6 100%); background:-webkit-linear-gradient(top, #ffffff 5%, #f6f6f6 100%); background:-o-linear-gradient(top, #ffffff 5%, #f6f6f6 100%); background:-ms-linear-gradient(top, #ffffff 5%, #f6f6f6 100%); background:linear-gradient(to bottom, #ffffff 5%, #f6f6f6 100%); filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffff', endColorstr='#f6f6f6',GradientType=0); background-color:#ffffff; -moz-border-radius:6px; -webkit-border-radius:6px; border-radius:6px; border:1px solid #dcdcdc; display:inline-block; color:#666666; font-size:12px; padding:4px 24px; margin-right: 6px; cursor: default;}#webpush-custom-prompt-button2 { background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #33bdef), color-stop(1, #019ad2)); background:-moz-linear-gradient(top, #33bdef 5%, #019ad2 100%); background:-webkit-linear-gradient(top, #33bdef 5%, #019ad2 100%); background:-o-linear-gradient(top, #33bdef 5%, #019ad2 100%); background:-ms-linear-gradient(top, #33bdef 5%, #019ad2 100%); background:linear-gradient(to bottom, #33bdef 5%, #019ad2 100%); filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#33bdef', endColorstr='#019ad2',GradientType=0); background-color:#33bdef; -moz-border-radius:6px; -webkit-border-radius:6px; border-radius:6px; border:1px solid #057fd0; display:inline-block; color:#ffffff; font-size:12px; padding:4px 24px; cursor: default;}#webpush-notification-center-open.webpush-notification-center-position-left { left: 16px;}#webpush-notification-center-open.webpush-notification-center-position-right { right: 16px;}#webpush-notification-center { position: fixed; z-index: 9999999; font-family: 'Trebuchet MS', Helvetica, sans-serif; display: none; overflow-y: auto;}#webpush-notification-center.webpush-notification-center-layout-panel { top: 0; bottom: 0; width: 300px; max-width: 90%;}#webpush-notification-center.webpush-notification-center-layout-popup { top: 20px; height: 400px; width: 300px; max-width: 90%; margin-right: 20px; margin-left: 20px;}#webpush-notification-center.webpush-notification-center-position-left { left: 0;}#webpush-notification-center.webpush-notification-center-position-right { right: 0;}#webpush-notification-center.webpush-notification-center-color-light { background: #ffffff; box-shadow: 0px 0px 6px #888888; color: #666666;}#webpush-notification-center.webpush-notification-center-color-dark { background: #555555; box-shadow: 0px 0px 6px #888888; color: #ffffff;}#webpush-notification-center-header { height: 40px; border-bottom: 1px solid #d9d9d9; position: relative;}#webpush-notification-center-subscription { padding: 0 50px 0 8px;}#webpush-notification-center-subscription-switch-container { float: left; padding-top: 15px;}#webpush-notification-center-subscription-status { float: left; font-size: 12px; line-height: 40px; letter-spacing: 0.1em;}#webpush-notification-center-subscription .webpush-onoffswitch { display: inline-block; margin-right: 16px; margin-left: 8px;}#webpush-notification-center-icon { position: absolute; top: 10px; left: 10px; width: 20px; height: 20px; background-repeat: no-repeat; background-position: center center; background-size: 20px 20px;}#webpush-notification-center-title { font-size: 13px; line-height: 40px; letter-spacing: 0.1em; text-align: center;}#webpush-notification-center-close { position: absolute; top: 14px; right: 8px; height: 12px; width: 12px; font-size: 12px; background-repeat: no-repeat; background-position: center center; background-size: 12px 12px; cursor: pointer;}#webpush-notification-center-list { overflow-x: hidden; overflow-y: auto; position: absolute; top: 41px; left: 0; right: 0; bottom: 0;}.webpush-notification-center-item { padding: 8px 8px; position: relative; font-size: 12px; min-height: 48px; cursor: pointer;}.webpush-notification-center-color-light .webpush-notification-center-item { border-bottom: 1px solid #f3f3f3;}.webpush-notification-center-color-dark .webpush-notification-center-item { border-bottom: 1px solid #808080;}.webpush-notification-center-color-light .webpush-notification-center-item:hover { background-color: #f3f3f3;}.webpush-notification-center-color-dark .webpush-notification-center-item:hover { background-color: #808080;}.webpush-notification-center-item-image { width: 48px; height: 48px; float: left;}.webpush-notification-center-item-title { padding-left: 58px; font-weight: bold;}.webpush-notification-center-item-title p { margin: 0px;}.webpush-notification-center-item-text { padding-left: 58px; margin-top: 4px;}.webpush-notification-center-item-text p { margin: 0px;}.webpush-notification-center-item-date { padding-left: 58px; margin-top: 3px; font-size: 11px; color: #b7b7b7;}.webpush-notification-center-item-webinbox-card { padding: 0;}.webpush-notification-center-item-webinbox-card .webpush-notification-center-item-image { width: 100%; height: auto; float: none; margin: 0px; padding: 0px;}.webpush-notification-center-item-webinbox-card .webpush-notification-center-item-title { padding: 5px 7px; font-weight: bold;}.webpush-notification-center-item-webinbox-card .webpush-notification-center-item-text-container { padding: 0px 7px 5px 7px; margin: 0px;}.webpush-notification-center-item-webinbox-card .webpush-notification-center-item-text { padding: 5px 0px 0px 0px; margin-top: 0px;}.webpush-notification-center-item-webinbox-card .webpush-notification-center-item-date { display: none;}#webpush-notification-center-loader { text-align: center; padding: 8px; height: 15px;}#webpush-notification-center-title-loader { text-align: center; padding-top: 14px; height: 40px;}#webpush-notification-center-placeholder { font-size: 12px; line-height: 30px; padding: 5px 16px;}#webpush-notification-center-load-more { font-size: 12px; line-height: 30px; text-align: center; cursor: pointer;}.webpush-notification-center-color-light #webpush-notification-center-load-more { border-bottom: 1px solid #f3f3f3;}.webpush-notification-center-color-dark #webpush-notification-center-load-more { border-bottom: 1px solid #808080;}.webpush-notification-center-color-light #webpush-notification-center-load-more:hover { background-color: #f3f3f3;}.webpush-notification-center-color-dark #webpush-notification-center-load-more:hover { background-color: #808080;}#webpush-notification-center-open { position: fixed; z-index: 9999999; top: 20px; height: 60px; width: 60px; border-radius: 50%; cursor: pointer; text-align: center; line-height: 60px; background-size: 30px 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.16), 0 2px 4px rgba(0,0,0,0.2); transition: 0.7s ease;}#webpush-notification-center-open:hover { box-shadow: 0 7px 14px rgba(0,0,0,0.16), 0 5px 10px rgba(0,0,0,0.2); transition: 0.7s ease; transform-origin: center;}#webpush-notification-center-open[badge-count]:after { position: absolute; right: -3px; top: -3px; content: attr(badge-count); font-size: 12px; padding: 5px; border-radius: 50%; line-height: 12px; color: #ffffff; background: #ed1c25; text-align: center; min-width: 12px; font-weight: bold;}#webpush-notification-center-open.webpush-notification-center-color-light { background-color: #1d87c8;}#webpush-notification-center-open.webpush-notification-center-color-light:hover { background-color: #2298e1;}#webpush-notification-center-open.webpush-notification-center-color-dark { background-color: #555555;}#webpush-notification-center-open.webpush-notification-center-color-dark:hover { background-color: #5a606e;}#webpush-notification-center-open.webpush-notification-center-color-custom { background-color: #1d87c8;}#webpush-notification-center-open.webpush-notification-center-color-custom:hover { background-color: #2298e1;}#webpush-local-notification-stack { position: fixed; top: 20px; right: 20px; z-index: 9999999; margin-left: 20px;}.webpush-local-notification { background: #ffffff; max-width: 370px; width: 100%; min-width: 250px; box-shadow: 0px 0px 6px #888888; position: relative; -webkit-transition: opacity 0.2s ease-in-out; -moz-transition: opacity 0.2s ease-in-out; -ms-transition: opacity 0.2s ease-in-out; -o-transition: opacity 0.2s ease-in-out; transition: opacity 0.2s ease-in-out; font-family: 'Trebuchet MS', Helvetica, sans-serif; color: #666666; margin-bottom: 10px; min-height: 80px; cursor: default;}.webpush-local-notification-close { position: absolute; top: 8px; right: 8px; cursor: pointer;}.webpush-local-notification-image { width: 80px; height: 80px; float: left;}.webpush-local-notification-title { padding-left: 95px; padding-top: 10px; padding-right: 35px; font-size: 14px; line-height: 20px; color: #444444;}.webpush-local-notification-text { padding-left: 95px; padding-top: 8px; padding-right: 10px; padding-bottom: 10px; font-size: 13px; line-height: 18px;}.webpush-onoffswitch-container { line-height: 10px;}.webpush-onoffswitch { position: relative; width: 30px; -webkit-user-select:none; -moz-user-select:none; -ms-user-select: none;}.webpush-onoffswitch-checkbox { display: none;}.webpush-onoffswitch-label { display: block; overflow: hidden; cursor: pointer; height: 10px; padding: 0; line-height: 10px; border-radius: 16px; background-color: rgba(158,158,158,0.5);}.webpush-onoffswitch-label:before { content: ''; display: block; width: 16px; margin: -3px; background-color: rgb(158,158,158); position: absolute; top: 0; bottom: 0; right: 18px; border-radius: 16px;}.webpush-onoffswitch-checkbox:checked + .webpush-onoffswitch-label { background-color: rgba(47,169,214,0.5);}.webpush-onoffswitch-checkbox:checked + .webpush-onoffswitch-label .webpush-onoffswitch-inner { margin-left: 0;}.webpush-onoffswitch-checkbox:checked + .webpush-onoffswitch-label:before { right: 0; background-color: rgb(47,169,214); box-shadow: none;}.webpush-onoffswitch-tooltip { display: none; position: absolute; min-width: 50px; max-width: 200px; min-height: 16px; max-height: 200px; background: rgba(0, 0, 0, .8); color: #fff; padding: 8px; border-radius: 2px; z-index: 3000; line-height: 16px; font-size: 12px; opacity: 0.9; -webkit-transition: opacity 75ms linear; -moz-transition: opacity 75ms linear; -ms-transition: opacity 75ms linear; transition: opacity 75ms linear; top: 32px; left: 15px;}.webpush-reset { animation: none; animation-delay: 0s; animation-direction: normal; animation-duration: 0s; animation-fill-mode: none; animation-iteration-count: 1; animation-name: none; animation-play-state: running; animation-timing-function: ease; backface-visibility: visible; background: 0; background-attachment: scroll; background-clip: border-box; background-color: transparent; background-image: none; background-origin: padding-box; background-position: 0 0; background-position-x: 0; background-position-y: 0; background-repeat: repeat; background-size: auto auto; border: 0; border-style: none; border-width: medium; border-color: inherit; border-bottom: 0; border-bottom-color: inherit; border-bottom-left-radius: 0; border-bottom-right-radius: 0; border-bottom-style: none; border-bottom-width: medium; border-collapse: separate; border-image: none; border-left: 0; border-left-color: inherit; border-left-style: none; border-left-width: medium; border-radius: 0; border-right: 0; border-right-color: inherit; border-right-style: none; border-right-width: medium; border-spacing: 0; border-top: 0; border-top-color: inherit; border-top-left-radius: 0; border-top-right-radius: 0; border-top-style: none; border-top-width: medium; bottom: auto; box-shadow: none; box-sizing: content-box; caption-side: top; clear: none; clip: auto; color: inherit; columns: auto; column-count: auto; column-fill: balance; column-gap: normal; column-rule: medium none currentColor; column-rule-color: currentColor; column-rule-style: none; column-rule-width: 0; column-span: 1; column-width: auto; content: normal; counter-increment: none; counter-reset: none; cursor: auto; direction: ltr; display: inline; empty-cells: show; float: none; /*font: normal;*/ font-family: inherit; font-size: medium; font-style: normal; font-variant: normal; font-weight: normal; height: auto; hyphens: none; left: auto; letter-spacing: normal; line-height: normal; list-style: none; list-style-image: none; list-style-position: outside; list-style-type: disc; margin: 0; margin-bottom: 0; margin-left: 0; margin-right: 0; margin-top: 0; max-height: none; max-width: none; min-height: 0; min-width: 0; opacity: 1; orphans: 0; outline: 0; outline-color: invert; outline-style: none; outline-width: medium; overflow: visible; overflow-x: visible; overflow-y: visible; padding: 0; padding-bottom: 0; padding-left: 0; padding-right: 0; padding-top: 0; page-break-after: auto; page-break-before: auto; page-break-inside: auto; perspective: none; perspective-origin: 50% 50%; position: static; right: auto; tab-size: 8; table-layout: auto; text-align: inherit; text-align-last: auto; text-decoration: none; text-decoration-line: none; text-decoration-style: solid; text-indent: 0; text-shadow: none; text-transform: none; top: auto; transform: none; transform-style: flat; transition: none; transition-delay: 0s; transition-duration: 0s; transition-property: none; transition-timing-function: ease; unicode-bidi: normal; vertical-align: baseline; visibility: visible; white-space: normal; widows: 0; width: auto; word-spacing: normal; z-index: auto;}.webpush-loader { display: inline-block; position: relative; vertical-align: middle; width: 48px; height: 16px;}.webpush-loader div { position: absolute; top: 3px; left: 21px; width: 4px; height: 4px; background-color: #666666; -webkit-border-radius: 2px; border-radius: 2px; background-clip: padding-box; -webkit-animation: growDot 1s linear .15s infinite; -moz-animation: growDot 1s linear .15s infinite; -ms-animation: growDot 1s linear .15s infinite; -o-animation: growDot 1s linear .15s infinite; animation: growDot 1s linear .15s infinite;}.webpush-loader div:before { content: ''; position: absolute; top: 0; left: -15px; width: 4px; height: 4px; background-color: #666666; -webkit-border-radius: 2px; border-radius: 2px; background-clip: padding-box; -webkit-animation: growDot 1s linear 0s infinite; -moz-animation: growDot 1s linear 0s infinite; -ms-animation: growDot 1s linear 0s infinite; -o-animation: growDot 1s linear 0s infinite; animation: growDot 1s linear 0s infinite;}.webpush-loader div:after { content: ''; position: absolute; top: 0; left: 15px; width: 4px; height: 4px; background-color: #666666; -webkit-border-radius: 2px; border-radius: 2px; background-clip: padding-box; -webkit-animation: growDot 1s linear .3s infinite; -moz-animation: growDot 1s linear .3s infinite; -ms-animation: growDot 1s linear .3s infinite; -o-animation: growDot 1s linear .3s infinite; animation: growDot 1s linear .3s infinite;}@-webkit-keyframes growDot { 0% {  -ms-filter: 'progid:DXImageTransform.Microsoft.Alpha(Opacity=70)';  filter: alpha(opacity=70);  opacity: 0.7;  -webkit-box-shadow: 0px 0px 0px 0px #666666;  box-shadow: 0px 0px 0px 0px #666666; } 25% {  -ms-filter: 'progid:DXImageTransform.Microsoft.Alpha(Opacity=100)';  filter: alpha(opacity=100);  opacity: 1;  -webkit-box-shadow: 0px 0px 0px 2px #666666;  box-shadow: 0px 0px 0px 2px #666666; } 50% {  -ms-filter: 'progid:DXImageTransform.Microsoft.Alpha(Opacity=70)';  filter: alpha(opacity=70);  opacity: 0.7;  -webkit-box-shadow: 0px 0px 0px 0px #666666;  box-shadow: 0px 0px 0px 0px #666666; } 100% {  -ms-filter: 'progid:DXImageTransform.Microsoft.Alpha(Opacity=60)';  filter: alpha(opacity=60);  opacity: 0.6;  -webkit-box-shadow: 0px 0px 0px 0px #666666;  box-shadow: 0px 0px 0px 0px #666666; }}@keyframes growDot { 0% {  -ms-filter: 'progid:DXImageTransform.Microsoft.Alpha(Opacity=70)';  filter: alpha(opacity=70);  opacity: 0.7;  -webkit-box-shadow: 0px 0px 0px 0px #666666;  box-shadow: 0px 0px 0px 0px #666666; } 25% {  -ms-filter: 'progid:DXImageTransform.Microsoft.Alpha(Opacity=100)';  filter: alpha(opacity=100);  opacity: 1;  -webkit-box-shadow: 0px 0px 0px 2px #666666;  box-shadow: 0px 0px 0px 2px #666666; } 50% {  -ms-filter: 'progid:DXImageTransform.Microsoft.Alpha(Opacity=70)';  filter: alpha(opacity=70);  opacity: 0.7;  -webkit-box-shadow: 0px 0px 0px 0px #666666;  box-shadow: 0px 0px 0px 0px #666666; } 100% {  -ms-filter: 'progid:DXImageTransform.Microsoft.Alpha(Opacity=60)';  filter: alpha(opacity=60);  opacity: 0.6;  -webkit-box-shadow: 0px 0px 0px 0px #666666;  box-shadow: 0px 0px 0px 0px #666666; }}.webpush-balloon { background-repeat: no-repeat; background-position: center center; background-size: 100% 100%;}.webpush-balloon-light, .webpush-balloon-dark, .webpush-balloon-custom { background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDE1MCAxNTAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxLjQxNDIxOyI+CiAgICA8ZyBpZD0iWE1MSURfNDZfIiB0cmFuc2Zvcm09Im1hdHJpeCgxLjEyOTEyLDAsMCwxLjEyOTEyLDQ3OS43ODgsLTI0Mi4yODIpIj4KICAgICAgICA8cGF0aCBkPSJNLTM1OCwzNDFDLTM1MSwzNDEgLTM0Ni4yLDMzNSAtMzQ2LjIsMzI4TC0zNzAuMywzMjhDLTM3MC4zLDMzNSAtMzY0LDM0MSAtMzU4LDM0MVoiIHN0eWxlPSJmaWxsOndoaXRlO2ZpbGwtcnVsZTpub256ZXJvOyIvPgogICAgPC9nPgogICAgPGcgaWQ9IlhNTElEXzQ3XyIgdHJhbnNmb3JtPSJtYXRyaXgoMS4xMjkxMiwwLDAsMS4xMjkxMiw0NzkuNzg4LC0yNDIuMjgyKSI+CiAgICAgICAgPHBhdGggZD0iTS0zMTguOSwzMDUuOEMtMzE4LjYsMzA1LjggLTMxOCwzMDUuNiAtMzE4LDMwNS4zTC0zMTgsMjczLjhDLTMxOCwyNTQuNyAtMzMyLDIzOC43IC0zNDksMjM0LjdMLTM0OSwyMjkuOEMtMzQ5LDIyNSAtMzUzLjEsMjIxIC0zNTgsMjIxQy0zNjIuOSwyMjEgLTM2NywyMjUgLTM2NywyMjkuOEwtMzY3LDIzNC42Qy0zODUsMjM4LjYgLTM5OCwyNTQuNiAtMzk4LDI3My43TC0zOTgsMzA1LjJDLTM5OCwzMDUuNSAtMzk3LjksMzA1LjcgLTM5Ny42LDMwNS43TC00MTAsMzE3TC00MTAsMzI0TC0zMDcsMzI0TC0zMDcsMzE3TC0zMTguOSwzMDUuOFoiIHN0eWxlPSJmaWxsOndoaXRlO2ZpbGwtcnVsZTpub256ZXJvOyIvPgogICAgPC9nPgo8L3N2Zz4K');}.webpush-clearfix { clear: both;}.webpush-swal2-title p { margin: 0;} ";
(function (w) {
  if (!w.XPEnvironment) {
    w.XPEnvironment = {
      sdkKey: "xtremepush",
      objectKey: "XtremePushObject",
      localStorageKey: "xtremepush.data",
      localStorageDebugKey: "xtremepush.debug",
      cookieKey: "_xpid",
      cookieAuthKey: "_xpkey",
      version: "2.1.6",
    };
    w.XPApiInstance = null;
    w.XPStoreInstance = null;
    w.XPSessionManagerInstance = null;
    w.XPUpdateManagerInstance = null;
    w.XPGaManagerInstance = null;
    w.XPPushManagerInstance = null;
    w.XPTranslationInstance = null;
    w.XPNotificationCenterInstance = null;
    w.XPWindowManagerInstance = null;
    w.XPFrameManagerInstance = null;
    w.XPCustomMessageHandlerInstance = null;
    var isWindow = XPConfig.windowUrl == location.origin + location.pathname;
    var isFrame = XPConfig.frameUrl == location.origin + location.pathname;
    if (isWindow) {
      w.XPCoreInstance = new XPCoreWindow().init();
    } else if (isFrame) {
      w.XPCoreInstance = new XPCoreFrame().init();
    } else {
      w.XPCoreInstance = new XPCore().init();
    }
    var queue = w[w[w.XPEnvironment.objectKey]].q || [];
    w.XPInterfaceInstance = new XPInterface();
    w[w[w.XPEnvironment.objectKey]] = function () {
      return w.XPInterfaceInstance.call(arguments);
    };
    for (var i in queue) {
      w.XPInterfaceInstance.call(queue[i]);
    }
    w.XPCoreInstance.launch();
  }
})(window);
(function (e, t) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = t())
    : "function" == typeof define && define.amd
    ? (e.WebpushSweetalert2 = t())
    : (e.WebpushSweetalert2 = t());
})(this, function () {
  "use strict";
  function e(e) {
    var t = function e() {
      for (var t = arguments.length, n = Array(t), o = 0; o < t; o++)
        n[o] = arguments[o];
      return this instanceof e
        ? void Object.getPrototypeOf(e).apply(this, n)
        : new (Function.prototype.bind.apply(e, [null].concat(n)))();
    };
    return (
      (t.prototype = s(Object.create(e.prototype), { constructor: t })),
      "function" == typeof Object.setPrototypeOf
        ? Object.setPrototypeOf(t, e)
        : (t.__proto__ = e),
      t
    );
  }
  function t() {
    var e = Ae.innerParams.get(this),
      t = Ae.domCache.get(this);
    e.showConfirmButton ||
      (V(t.confirmButton), !e.showCancelButton && V(t.actions)),
      O([t.popup, t.actions], k.loading),
      t.popup.removeAttribute("aria-busy"),
      t.popup.removeAttribute("data-loading"),
      (t.confirmButton.disabled = !1),
      (t.cancelButton.disabled = !1);
  }
  function n(e) {
    e.inputValidator ||
      Object.keys(Ee).forEach(function (t) {
        e.input === t &&
          (e.inputValidator = e.expectRejections
            ? Ee[t]
            : Oe.adaptInputValidator(Ee[t]));
      }),
      (e.target &&
        ("string" != typeof e.target || document.querySelector(e.target)) &&
        ("string" == typeof e.target || e.target.appendChild)) ||
        (g('Target parameter is not valid, defaulting to "body"'),
        (e.target = "body"));
    var t,
      n = N(),
      o =
        "string" == typeof e.target
          ? document.querySelector(e.target)
          : e.target;
    (t = n && o && n.parentNode !== o.parentNode ? oe(e) : n || oe(e)),
      e.width &&
        (t.style.width = "number" == typeof e.width ? e.width + "px" : e.width),
      e.padding &&
        (t.style.padding =
          "number" == typeof e.padding ? e.padding + "px" : e.padding),
      e.background && (t.style.background = e.background);
    for (
      var a = window.getComputedStyle(t).getPropertyValue("background-color"),
        r = t.querySelectorAll(
          "[class^=webpush-swal2-success-circular-line], .webpush-swal2-success-fix"
        ),
        s = 0;
      s < r.length;
      s++
    )
      r[s].style.backgroundColor = a;
    var i = M(),
      l = W(),
      d = U().querySelector("#" + k.content),
      u = J(),
      c = Q(),
      p = Y(),
      m = G(),
      f = X();
    if (
      (e.titleText
        ? (l.innerText = e.titleText)
        : e.title && (l.innerHTML = e.title.split("\n").join("<br />")),
      "string" == typeof e.backdrop
        ? (M().style.background = e.backdrop)
        : !e.backdrop &&
          L([document.documentElement, document.body], k["no-backdrop"]),
      e.html ? ie(e.html, d) : e.text ? ((d.textContent = e.text), T(d)) : V(d),
      e.position in k
        ? L(i, k[e.position])
        : (g('The "position" parameter is not valid, defaulting to "center"'),
          L(i, k.center)),
      e.grow && "string" == typeof e.grow)
    ) {
      var b = "grow-" + e.grow;
      b in k && L(i, k[b]);
    }
    "function" == typeof e.animation && (e.animation = e.animation.call()),
      e.showCloseButton
        ? (m.setAttribute("aria-label", e.closeButtonAriaLabel), T(m))
        : V(m),
      (t.className = k.popup),
      e.toast
        ? (L([document.documentElement, document.body], k["toast-shown"]),
          L(t, k.toast))
        : L(t, k.modal),
      e.customClass && L(t, e.customClass);
    var y = z(),
      v = parseInt(
        null === e.currentProgressStep
          ? Oe.getQueueStep()
          : e.currentProgressStep,
        10
      );
    e.progressSteps && e.progressSteps.length
      ? (T(y),
        q(y),
        v >= e.progressSteps.length &&
          g(
            "Invalid currentProgressStep parameter, it should be less than progressSteps.length (currentProgressStep like JS arrays starts from 0)"
          ),
        e.progressSteps.forEach(function (t, n) {
          var o = document.createElement("li");
          if (
            (L(o, k.progresscircle),
            (o.innerHTML = t),
            n === v && L(o, k.activeprogressstep),
            y.appendChild(o),
            n !== e.progressSteps.length - 1)
          ) {
            var i = document.createElement("li");
            L(i, k.progressline),
              e.progressStepsDistance &&
                (i.style.width = e.progressStepsDistance),
              y.appendChild(i);
          }
        }))
      : V(y);
    for (var w = H(), C = 0; C < w.length; C++) V(w[C]);
    if (e.type) {
      var x = !1;
      for (var A in B)
        if (e.type === A) {
          x = !0;
          break;
        }
      if (!x) return h("Unknown alert type: " + e.type), !1;
      var E = t.querySelector("." + k.icon + "." + B[e.type]);
      T(E), e.animation && L(E, "webpush-swal2-animate-" + e.type + "-icon");
    }
    var S = K();
    if (
      (e.imageUrl
        ? (S.setAttribute("src", e.imageUrl),
          S.setAttribute("alt", e.imageAlt),
          T(S),
          e.imageWidth
            ? S.setAttribute("width", e.imageWidth)
            : S.removeAttribute("width"),
          e.imageHeight
            ? S.setAttribute("height", e.imageHeight)
            : S.removeAttribute("height"),
          (S.className = k.image),
          e.imageClass && L(S, e.imageClass))
        : V(S),
      e.showCancelButton ? (p.style.display = "inline-block") : V(p),
      e.showConfirmButton ? j(c, "display") : V(c),
      e.showConfirmButton || e.showCancelButton ? T(u) : V(u),
      (c.innerHTML = e.confirmButtonText),
      (p.innerHTML = e.cancelButtonText),
      c.setAttribute("aria-label", e.confirmButtonAriaLabel),
      p.setAttribute("aria-label", e.cancelButtonAriaLabel),
      (c.className = k.confirm),
      L(c, e.confirmButtonClass),
      (p.className = k.cancel),
      L(p, e.cancelButtonClass),
      e.buttonsStyling)
    ) {
      L([c, p], k.styled),
        e.confirmButtonColor &&
          (c.style.backgroundColor = e.confirmButtonColor),
        e.cancelButtonColor && (p.style.backgroundColor = e.cancelButtonColor);
      var P = window.getComputedStyle(c).getPropertyValue("background-color");
      (c.style.borderLeftColor = P), (c.style.borderRightColor = P);
    } else O([c, p], k.styled), (c.style.backgroundColor = c.style.borderLeftColor = c.style.borderRightColor = ""), (p.style.backgroundColor = p.style.borderLeftColor = p.style.borderRightColor = "");
    ie(e.footer, f),
      !0 === e.animation ? O(t, k.noanimation) : L(t, k.noanimation),
      e.showLoaderOnConfirm &&
        !e.preConfirm &&
        g(
          "showLoaderOnConfirm is set to true, but preConfirm is not defined.\nshowLoaderOnConfirm should be used together with preConfirm, see usage example:\nhttps://sweetalert2.github.io/#ajax-request"
        );
  }
  function o() {
    if ("undefined" != typeof window) {
      "undefined" == typeof Promise &&
        h(
          "This package requires a Promise library, please include a shim to enable it in this browser (See: https://github.com/sweetalert2/sweetalert2/wiki/Migration-from-SweetAlert-to-SweetAlert2#1-ie-support)"
        );
      for (var e = arguments.length, t = Array(e), n = 0; n < e; n++)
        t[n] = arguments[n];
      if ("undefined" == typeof t[0])
        return h("WebpushSweetAlert2 expects at least 1 attribute!"), !1;
      Le = this;
      var o = Object.freeze(this.constructor.argsToParams(t));
      Object.defineProperties(this, {
        params: { value: o, writable: !1, enumerable: !0 },
      });
      var i = this._main(this.params);
      Ae.promise.set(this, i);
    }
  }
  var a =
      "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              "function" == typeof Symbol &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? "symbol"
              : typeof e;
          },
    i = function (e, t) {
      if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function");
    },
    r = (function () {
      function e(e, t) {
        for (var n, o = 0; o < t.length; o++)
          (n = t[o]),
            (n.enumerable = n.enumerable || !1),
            (n.configurable = !0),
            "value" in n && (n.writable = !0),
            Object.defineProperty(e, n.key, n);
      }
      return function (t, n, o) {
        return n && e(t.prototype, n), o && e(t, o), t;
      };
    })(),
    s =
      Object.assign ||
      function (e) {
        for (var t, n = 1; n < arguments.length; n++)
          for (var o in ((t = arguments[n]), t))
            Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
        return e;
      },
    l = function e(t, n, o) {
      null === t && (t = Function.prototype);
      var i = Object.getOwnPropertyDescriptor(t, n);
      if (void 0 === i) {
        var a = Object.getPrototypeOf(t);
        return null === a ? void 0 : e(a, n, o);
      }
      if ("value" in i) return i.value;
      var r = i.get;
      return void 0 === r ? void 0 : r.call(o);
    },
    d = function (e, t) {
      if ("function" != typeof t && null !== t)
        throw new TypeError(
          "Super expression must either be null or a function, not " + typeof t
        );
      (e.prototype = Object.create(t && t.prototype, {
        constructor: {
          value: e,
          enumerable: !1,
          writable: !0,
          configurable: !0,
        },
      })),
        t &&
          (Object.setPrototypeOf
            ? Object.setPrototypeOf(e, t)
            : (e.__proto__ = t));
    },
    u = function (e, t) {
      if (!e)
        throw new ReferenceError(
          "this hasn't been initialised - super() hasn't been called"
        );
      return t && ("object" == typeof t || "function" == typeof t) ? t : e;
    },
    c = (function () {
      function e(e, t) {
        var n = [],
          o = !0,
          i = !1,
          a = void 0;
        try {
          for (
            var r, s = e[Symbol.iterator]();
            !(o = (r = s.next()).done) &&
            (n.push(r.value), !(t && n.length === t));
            o = !0
          );
        } catch (e) {
          (i = !0), (a = e);
        } finally {
          try {
            !o && s["return"] && s["return"]();
          } finally {
            if (i) throw a;
          }
        }
        return n;
      }
      return function (t, n) {
        if (Array.isArray(t)) return t;
        if (Symbol.iterator in Object(t)) return e(t, n);
        throw new TypeError(
          "Invalid attempt to destructure non-iterable instance"
        );
      };
    })(),
    p = "WebpushSweetAlert2:",
    m = function (e) {
      for (var t = [], n = 0; n < e.length; n++)
        -1 === t.indexOf(e[n]) && t.push(e[n]);
      return t;
    },
    f = function (e) {
      var t = [];
      return (
        "undefined" != typeof Map && e instanceof Map
          ? e.forEach(function (e, n) {
              t.push([n, e]);
            })
          : Object.keys(e).forEach(function (n) {
              t.push([n, e[n]]);
            }),
        t
      );
    },
    g = function (e) {
      console.warn(p + " " + e);
    },
    h = function (e) {
      console.error(p + " " + e);
    },
    b = [],
    y = function (e) {
      -1 !== b.indexOf(e) || (b.push(e), g(e));
    },
    v = function (e) {
      return "function" == typeof e ? e() : e;
    },
    w = function (e) {
      return (
        "object" === ("undefined" == typeof e ? "undefined" : a(e)) &&
        "function" == typeof e.then
      );
    },
    C = Object.freeze({
      cancel: "cancel",
      backdrop: "overlay",
      close: "close",
      esc: "esc",
      timer: "timer",
    }),
    x = function (e) {
      var t = {};
      for (var n in e) t[e[n]] = "webpush-swal2-" + e[n];
      return t;
    },
    k = x([
      "container",
      "shown",
      "iosfix",
      "popup",
      "modal",
      "no-backdrop",
      "toast",
      "toast-shown",
      "fade",
      "show",
      "hide",
      "noanimation",
      "close",
      "title",
      "header",
      "content",
      "actions",
      "confirm",
      "cancel",
      "footer",
      "icon",
      "icon-text",
      "image",
      "input",
      "has-input",
      "file",
      "range",
      "select",
      "radio",
      "checkbox",
      "textarea",
      "inputerror",
      "validationerror",
      "progresssteps",
      "activeprogressstep",
      "progresscircle",
      "progressline",
      "loading",
      "styled",
      "top",
      "top-start",
      "top-end",
      "top-left",
      "top-right",
      "center",
      "center-start",
      "center-end",
      "center-left",
      "center-right",
      "bottom",
      "bottom-start",
      "bottom-end",
      "bottom-left",
      "bottom-right",
      "grow-row",
      "grow-column",
      "grow-fullscreen",
    ]),
    B = x(["success", "warning", "info", "question", "error"]),
    A = { previousActiveElement: null, previousBodyPadding: null },
    E = function (e, t) {
      return !!e.classList && e.classList.contains(t);
    },
    S = function (e) {
      if ((e.focus(), "file" !== e.type)) {
        var t = e.value;
        (e.value = ""), (e.value = t);
      }
    },
    P = function (e, t, n) {
      e &&
        t &&
        ("string" == typeof t && (t = t.split(/\s+/).filter(Boolean)),
        t.forEach(function (t) {
          e.forEach
            ? e.forEach(function (e) {
                n ? e.classList.add(t) : e.classList.remove(t);
              })
            : n
            ? e.classList.add(t)
            : e.classList.remove(t);
        }));
    },
    L = function (e, t) {
      P(e, t, !0);
    },
    O = function (e, t) {
      P(e, t, !1);
    },
    _ = function (e, t) {
      for (var n = 0; n < e.childNodes.length; n++)
        if (E(e.childNodes[n], t)) return e.childNodes[n];
    },
    T = function (e) {
      (e.style.opacity = ""),
        (e.style.display = e.id === k.content ? "block" : "flex");
    },
    V = function (e) {
      (e.style.opacity = ""), (e.style.display = "none");
    },
    q = function (e) {
      for (; e.firstChild; ) e.removeChild(e.firstChild);
    },
    D = function (e) {
      return (
        e && (e.offsetWidth || e.offsetHeight || e.getClientRects().length)
      );
    },
    j = function (e, t) {
      e.style.removeProperty
        ? e.style.removeProperty(t)
        : e.style.removeAttribute(t);
    },
    R = function () {
      if (A.previousActiveElement && A.previousActiveElement.focus) {
        var e = window.scrollX,
          t = window.scrollY;
        A.previousActiveElement.focus(),
          "undefined" != typeof e &&
            "undefined" != typeof t &&
            window.scrollTo(e, t);
      }
    },
    M = function () {
      return document.body.querySelector("." + k.container);
    },
    I = function (e) {
      var t = M();
      return t ? t.querySelector("." + e) : null;
    },
    N = function () {
      return I(k.popup);
    },
    H = function () {
      var e = N();
      return e.querySelectorAll("." + k.icon);
    },
    W = function () {
      return I(k.title);
    },
    U = function () {
      return I(k.content);
    },
    K = function () {
      return I(k.image);
    },
    z = function () {
      return I(k.progresssteps);
    },
    F = function () {
      return I(k.validationerror);
    },
    Q = function () {
      return I(k.confirm);
    },
    Y = function () {
      return I(k.cancel);
    },
    J = function () {
      return I(k.actions);
    },
    X = function () {
      return I(k.footer);
    },
    G = function () {
      return I(k.close);
    },
    Z = function () {
      var e = Array.prototype.slice
          .call(
            N().querySelectorAll(
              '[tabindex]:not([tabindex="-1"]):not([tabindex="0"])'
            )
          )
          .sort(function (e, t) {
            return ((e = parseInt(e.getAttribute("tabindex"))),
            (t = parseInt(t.getAttribute("tabindex"))),
            e > t)
              ? 1
              : e < t
              ? -1
              : 0;
          }),
        t = Array.prototype.slice.call(
          N().querySelectorAll(
            'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable], audio[controls], video[controls]'
          )
        );
      return m(e.concat(t));
    },
    $ = function () {
      return !document.body.classList.contains(k["toast-shown"]);
    },
    ee = function () {
      return document.body.classList.contains(k["toast-shown"]);
    },
    te = function () {
      return "undefined" == typeof window || "undefined" == typeof document;
    },
    ne = (
      '\n <div aria-labelledby="' +
      k.title +
      '" aria-describedby="' +
      k.content +
      '" class="' +
      k.popup +
      '" tabindex="-1">\n   <div class="' +
      k.header +
      '">\n     <ul class="' +
      k.progresssteps +
      '"></ul>\n     <div class="' +
      k.icon +
      " " +
      B.error +
      '">\n       <span class="webpush-swal2-x-mark"><span class="webpush-swal2-x-mark-line-left"></span><span class="webpush-swal2-x-mark-line-right"></span></span>\n     </div>\n     <div class="' +
      k.icon +
      " " +
      B.question +
      '">\n       <span class="' +
      k["icon-text"] +
      '">?</span>\n      </div>\n     <div class="' +
      k.icon +
      " " +
      B.warning +
      '">\n       <span class="' +
      k["icon-text"] +
      '">!</span>\n      </div>\n     <div class="' +
      k.icon +
      " " +
      B.info +
      '">\n       <span class="' +
      k["icon-text"] +
      '">i</span>\n      </div>\n     <div class="' +
      k.icon +
      " " +
      B.success +
      '">\n       <div class="webpush-swal2-success-circular-line-left"></div>\n       <span class="webpush-swal2-success-line-tip"></span> <span class="webpush-swal2-success-line-long"></span>\n       <div class="webpush-swal2-success-ring"></div> <div class="webpush-swal2-success-fix"></div>\n       <div class="webpush-swal2-success-circular-line-right"></div>\n     </div>\n     <img class="' +
      k.image +
      '" />\n     <h2 class="' +
      k.title +
      '" id="' +
      k.title +
      '"></h2>\n     <button type="button" class="' +
      k.close +
      '">\xD7</button>\n   </div>\n   <div class="' +
      k.content +
      '">\n     <div id="' +
      k.content +
      '"></div>\n     <input class="' +
      k.input +
      '" />\n     <input type="file" class="' +
      k.file +
      '" />\n     <div class="' +
      k.range +
      '">\n       <input type="range" />\n       <output></output>\n     </div>\n     <select class="' +
      k.select +
      '"></select>\n     <div class="' +
      k.radio +
      '"></div>\n     <label for="' +
      k.checkbox +
      '" class="' +
      k.checkbox +
      '">\n       <input type="checkbox" />\n     </label>\n     <textarea class="' +
      k.textarea +
      '"></textarea>\n     <div class="' +
      k.validationerror +
      '" id="' +
      k.validationerror +
      '"></div>\n   </div>\n   <div class="' +
      k.actions +
      '">\n     <button type="button" class="' +
      k.confirm +
      '">OK</button>\n     <button type="button" class="' +
      k.cancel +
      '">Cancel</button>\n   </div>\n   <div class="' +
      k.footer +
      '">\n   </div>\n </div>\n'
    ).replace(/(^|\n)\s*/g, ""),
    oe = function (e) {
      var t = M();
      if (
        (t &&
          (t.parentNode.removeChild(t),
          O(
            [document.documentElement, document.body],
            [k["no-backdrop"], k["has-input"], k["toast-shown"]]
          )),
        te())
      )
        return void h("WebpushSweetAlert2 requires document to initialize");
      var n = document.createElement("div");
      (n.className = k.container), (n.innerHTML = ne);
      var o =
        "string" == typeof e.target
          ? document.querySelector(e.target)
          : e.target;
      o.appendChild(n);
      var i = N(),
        a = U(),
        r = _(a, k.input),
        s = _(a, k.file),
        l = a.querySelector("." + k.range + " input"),
        d = a.querySelector("." + k.range + " output"),
        u = _(a, k.select),
        c = a.querySelector("." + k.checkbox + " input"),
        p = _(a, k.textarea);
      i.setAttribute("role", e.toast ? "alert" : "dialog"),
        i.setAttribute("aria-live", e.toast ? "polite" : "assertive"),
        e.toast || i.setAttribute("aria-modal", "true");
      var m = function () {
        Oe.isVisible() && Oe.resetValidationError();
      };
      return (
        (r.oninput = m),
        (s.onchange = m),
        (u.onchange = m),
        (c.onchange = m),
        (p.oninput = m),
        (l.oninput = function () {
          m(), (d.value = l.value);
        }),
        (l.onchange = function () {
          m(), (l.nextSibling.value = l.value);
        }),
        i
      );
    },
    ie = function (e, t) {
      if (!e) return V(t);
      if ("object" === ("undefined" == typeof e ? "undefined" : a(e))) {
        if (((t.innerHTML = ""), 0 in e))
          for (var n = 0; n in e; n++) t.appendChild(e[n].cloneNode(!0));
        else t.appendChild(e.cloneNode(!0));
      } else if (e) t.innerHTML = e;
      else;
      T(t);
    },
    ae = (function () {
      if (te()) return !1;
      var e = document.createElement("div"),
        t = {
          WebkitAnimation: "webkitAnimationEnd",
          OAnimation: "oAnimationEnd oanimationend",
          animation: "animationend",
        };
      for (var n in t)
        if (t.hasOwnProperty(n) && "undefined" != typeof e.style[n])
          return t[n];
      return !1;
    })(),
    re = function () {
      var e = "ontouchstart" in window || navigator.msMaxTouchPoints;
      if (e) return 0;
      var t = document.createElement("div");
      (t.style.width = "50px"),
        (t.style.height = "50px"),
        (t.style.overflow = "scroll"),
        document.body.appendChild(t);
      var n = t.offsetWidth - t.clientWidth;
      return document.body.removeChild(t), n;
    },
    se = function () {
      null !== A.previousBodyPadding ||
        (document.body.scrollHeight > window.innerHeight &&
          ((A.previousBodyPadding = document.body.style.paddingRight),
          (document.body.style.paddingRight = re() + "px")));
    },
    le = function () {
      null !== A.previousBodyPadding &&
        ((document.body.style.paddingRight = A.previousBodyPadding),
        (A.previousBodyPadding = null));
    },
    de = function () {
      var e = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (e && !E(document.body, k.iosfix)) {
        var t = document.body.scrollTop;
        (document.body.style.top = -1 * t + "px"), L(document.body, k.iosfix);
      }
    },
    ue = function () {
      if (E(document.body, k.iosfix)) {
        var e = parseInt(document.body.style.top, 10);
        O(document.body, k.iosfix),
          (document.body.style.top = ""),
          (document.body.scrollTop = -1 * e);
      }
    },
    ce = {},
    pe = function (e, t) {
      var n = M(),
        o = N();
      if (o) {
        null !== e && "function" == typeof e && e(o),
          O(o, k.show),
          L(o, k.hide),
          clearTimeout(o.timeout),
          ee() ||
            (R(),
            (window.onkeydown = ce.previousWindowKeyDown),
            (ce.windowOnkeydownOverridden = !1));
        var i = function () {
          n.parentNode && n.parentNode.removeChild(n),
            O(
              [document.documentElement, document.body],
              [k.shown, k["no-backdrop"], k["has-input"], k["toast-shown"]]
            ),
            $() && (le(), ue()),
            null !== t &&
              "function" == typeof t &&
              setTimeout(function () {
                t();
              });
        };
        ae && !E(o, k.noanimation)
          ? o.addEventListener(ae, function e() {
              o.removeEventListener(ae, e), E(o, k.hide) && i();
            })
          : i();
      }
    },
    me = {
      title: "",
      titleText: "",
      text: "",
      html: "",
      footer: "",
      type: null,
      toast: !1,
      customClass: "",
      target: "body",
      backdrop: !0,
      animation: !0,
      allowOutsideClick: !0,
      allowEscapeKey: !0,
      allowEnterKey: !0,
      showConfirmButton: !0,
      showCancelButton: !1,
      preConfirm: null,
      confirmButtonText: "OK",
      confirmButtonAriaLabel: "",
      confirmButtonColor: null,
      confirmButtonClass: null,
      cancelButtonText: "Cancel",
      cancelButtonAriaLabel: "",
      cancelButtonColor: null,
      cancelButtonClass: null,
      buttonsStyling: !0,
      reverseButtons: !1,
      focusConfirm: !0,
      focusCancel: !1,
      showCloseButton: !1,
      closeButtonAriaLabel: "Close this dialog",
      showLoaderOnConfirm: !1,
      imageUrl: null,
      imageWidth: null,
      imageHeight: null,
      imageAlt: "",
      imageClass: null,
      timer: null,
      width: null,
      padding: null,
      background: null,
      input: null,
      inputPlaceholder: "",
      inputValue: "",
      inputOptions: {},
      inputAutoTrim: !0,
      inputClass: null,
      inputAttributes: {},
      inputValidator: null,
      grow: !1,
      position: "center",
      progressSteps: [],
      currentProgressStep: null,
      progressStepsDistance: null,
      onBeforeOpen: null,
      onAfterClose: null,
      onOpen: null,
      onClose: null,
      useRejections: !1,
      expectRejections: !1,
    },
    fe = ["useRejections", "expectRejections"],
    ge = function (e) {
      return me.hasOwnProperty(e) || "extraParams" === e;
    },
    he = function (e) {
      return -1 !== fe.indexOf(e);
    },
    be = function (e) {
      for (var t in e)
        ge(t) || g('Unknown parameter "' + t + '"'),
          he(t) &&
            y(
              'The parameter "' +
                t +
                '" is deprecated and will be removed in the next major release.'
            );
    },
    ye = {},
    ve = [],
    we = function (e, t) {
      return t && t < ve.length ? ve.splice(t, 0, e) : ve.push(e);
    },
    Ce = function (e) {
      "undefined" != typeof ve[e] && ve.splice(e, 1);
    },
    xe = function () {
      var e = N();
      e || Oe(""), (e = N());
      var t = J(),
        n = Q(),
        o = Y();
      T(t),
        T(n),
        L([e, t], k.loading),
        (n.disabled = !0),
        (o.disabled = !0),
        e.setAttribute("data-loading", !0),
        e.setAttribute("aria-busy", !0),
        e.focus();
    },
    ke = Object.freeze({
      isValidParameter: ge,
      isDeprecatedParameter: he,
      argsToParams: function (e) {
        var t = {};
        switch (a(e[0])) {
          case "string":
            ["title", "html", "type"].forEach(function (n, o) {
              void 0 !== e[o] && (t[n] = e[o]);
            });
            break;
          case "object":
            s(t, e[0]);
            break;
          default:
            return (
              h(
                'Unexpected type of argument! Expected "string" or "object", got ' +
                  a(e[0])
              ),
              !1
            );
        }
        return t;
      },
      adaptInputValidator: function (e) {
        return function (t, n) {
          return e.call(this, t, n).then(
            function () {},
            function (e) {
              return e;
            }
          );
        };
      },
      close: pe,
      closePopup: pe,
      closeModal: pe,
      closeToast: pe,
      isVisible: function () {
        return !!N();
      },
      clickConfirm: function () {
        return Q().click();
      },
      clickCancel: function () {
        return Y().click();
      },
      getPopup: N,
      getTitle: W,
      getContent: U,
      getImage: K,
      getButtonsWrapper: function () {
        return (
          y(
            "webpushSwal.getButtonsWrapper() is deprecated and will be removed in the next major release, use webpushSwal.getActions() instead"
          ),
          I(k.actions)
        );
      },
      getActions: J,
      getConfirmButton: Q,
      getCancelButton: Y,
      getFooter: X,
      isLoading: function () {
        return N().hasAttribute("data-loading");
      },
      mixin: function (t) {
        var n = this;
        return e(
          (function (e) {
            function n() {
              return (
                i(this, n),
                u(
                  this,
                  (n.__proto__ || Object.getPrototypeOf(n)).apply(
                    this,
                    arguments
                  )
                )
              );
            }
            return (
              d(n, e),
              r(n, [
                {
                  key: "_main",
                  value: function (e) {
                    return l(
                      n.prototype.__proto__ ||
                        Object.getPrototypeOf(n.prototype),
                      "_main",
                      this
                    ).call(this, s({}, t, e));
                  },
                },
              ]),
              n
            );
          })(n)
        );
      },
      queue: function (e) {
        var t = this;
        ve = e;
        var n = function () {
            (ve = []),
              document.body.removeAttribute("data-webpush-swal2-queue-step");
          },
          o = [];
        return new Promise(function (e) {
          (function a(r, i) {
            r < ve.length
              ? (document.body.setAttribute("data-webpush-swal2-queue-step", r),
                t(ve[r]).then(function (t) {
                  "undefined" == typeof t.value
                    ? (n(), e({ dismiss: t.dismiss }))
                    : (o.push(t.value), a(r + 1, i));
                }))
              : (n(), e({ value: o }));
          })(0);
        });
      },
      getQueueStep: function () {
        return document.body.getAttribute("data-webpush-swal2-queue-step");
      },
      insertQueueStep: we,
      deleteQueueStep: Ce,
      showLoading: xe,
      enableLoading: xe,
      fire: function () {
        for (
          var e = this, t = arguments.length, n = Array(t), o = 0;
          o < t;
          o++
        )
          n[o] = arguments[o];
        return new (Function.prototype.bind.apply(e, [null].concat(n)))();
      },
    });
  if ("undefined" != typeof window && "function" != typeof window.WeakMap) {
    var Be = 0;
    (window.Symbol = function (e) {
      return (
        "__" + e + "_" + Math.floor(1e9 * Math.random()) + "_" + ++Be + "__"
      );
    }),
      (Symbol.iterator = Symbol("Symbol.iterator")),
      (window.WeakMap = (function (e, t, n) {
        function o() {
          t(this, e, { value: Symbol("WeakMap") });
        }
        return (
          (o.prototype = {
            delete: function (t) {
              delete t[this[e]];
            },
            get: function (t) {
              return t[this[e]];
            },
            has: function (t) {
              return n.call(t, this[e]);
            },
            set: function (n, o) {
              t(n, this[e], { configurable: !0, value: o });
            },
          }),
          o
        );
      })(Symbol("WeakMap"), Object.defineProperty, {}.hasOwnProperty));
  }
  var Ae = {
      promise: new WeakMap(),
      innerParams: new WeakMap(),
      domCache: new WeakMap(),
    },
    Ee = {
      email: function (e) {
        return /^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9-]{2,24}$/.test(e)
          ? Promise.resolve()
          : Promise.reject("Invalid email address");
      },
      url: function (e) {
        return /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/.test(
          e
        )
          ? Promise.resolve()
          : Promise.reject("Invalid URL");
      },
    },
    Se = function (e, t, n) {
      var o = M(),
        i = N();
      null !== t && "function" == typeof t && t(i),
        e ? (L(i, k.show), L(o, k.fade), O(i, k.hide)) : O(i, k.fade),
        T(i),
        (o.style.overflowY = "hidden"),
        ae && !E(i, k.noanimation)
          ? i.addEventListener(ae, function e() {
              i.removeEventListener(ae, e), (o.style.overflowY = "auto");
            })
          : (o.style.overflowY = "auto"),
        L([document.documentElement, document.body, o], k.shown),
        $() && (se(), de()),
        (A.previousActiveElement = document.activeElement),
        null !== n &&
          "function" == typeof n &&
          setTimeout(function () {
            n(i);
          });
    },
    Pe = Object.freeze({
      hideLoading: t,
      disableLoading: t,
      getInput: function (e) {
        var t = Ae.innerParams.get(this),
          n = Ae.domCache.get(this);
        return ((e = e || t.input), !e)
          ? null
          : "select" === e || "textarea" === e || "file" === e
          ? _(n.content, k[e])
          : "checkbox" === e
          ? n.popup.querySelector("." + k.checkbox + " input")
          : "radio" === e
          ? n.popup.querySelector("." + k.radio + " input:checked") ||
            n.popup.querySelector("." + k.radio + " input:first-child")
          : "range" === e
          ? n.popup.querySelector("." + k.range + " input")
          : _(n.content, k.input);
      },
      enableButtons: function () {
        var e = Ae.domCache.get(this);
        (e.confirmButton.disabled = !1), (e.cancelButton.disabled = !1);
      },
      disableButtons: function () {
        var e = Ae.domCache.get(this);
        (e.confirmButton.disabled = !0), (e.cancelButton.disabled = !0);
      },
      enableConfirmButton: function () {
        var e = Ae.domCache.get(this);
        e.confirmButton.disabled = !1;
      },
      disableConfirmButton: function () {
        var e = Ae.domCache.get(this);
        e.confirmButton.disabled = !0;
      },
      enableInput: function () {
        var e = this.getInput();
        if (!e) return !1;
        if ("radio" === e.type)
          for (
            var t = e.parentNode.parentNode,
              n = t.querySelectorAll("input"),
              o = 0;
            o < n.length;
            o++
          )
            n[o].disabled = !1;
        else e.disabled = !1;
      },
      disableInput: function () {
        var e = this.getInput();
        if (!e) return !1;
        if (e && "radio" === e.type)
          for (
            var t = e.parentNode.parentNode,
              n = t.querySelectorAll("input"),
              o = 0;
            o < n.length;
            o++
          )
            n[o].disabled = !0;
        else e.disabled = !0;
      },
      showValidationError: function (e) {
        var t = Ae.domCache.get(this);
        t.validationError.innerHTML = e;
        var n = window.getComputedStyle(t.popup);
        (t.validationError.style.marginLeft =
          "-" + n.getPropertyValue("padding-left")),
          (t.validationError.style.marginRight =
            "-" + n.getPropertyValue("padding-right")),
          T(t.validationError);
        var o = this.getInput();
        o &&
          (o.setAttribute("aria-invalid", !0),
          o.setAttribute("aria-describedBy", k.validationerror),
          S(o),
          L(o, k.inputerror));
      },
      resetValidationError: function () {
        var e = Ae.domCache.get(this);
        e.validationError && V(e.validationError);
        var t = this.getInput();
        t &&
          (t.removeAttribute("aria-invalid"),
          t.removeAttribute("aria-describedBy"),
          O(t, k.inputerror));
      },
      _main: function (e) {
        var t = this;
        be(e);
        var o = s({}, me, e);
        n(o), Object.freeze(o), Ae.innerParams.set(this, o);
        var r = {
          popup: N(),
          container: M(),
          content: U(),
          actions: J(),
          confirmButton: Q(),
          cancelButton: Y(),
          closeButton: G(),
          validationError: F(),
          progressSteps: z(),
        };
        Ae.domCache.set(this, r);
        var l = this.constructor;
        return new Promise(function (e, n) {
          var s = function (t) {
              l.closePopup(o.onClose, o.onAfterClose),
                o.useRejections ? e(t) : e({ value: t });
            },
            d = function (t) {
              l.closePopup(o.onClose, o.onAfterClose),
                o.useRejections ? n(t) : e({ dismiss: t });
            },
            u = function (e) {
              l.closePopup(o.onClose, o.onAfterClose), n(e);
            };
          o.timer &&
            (r.popup.timeout = setTimeout(function () {
              return d("timer");
            }, o.timer));
          var p = function () {
            var e = t.getInput();
            if (!e) return null;
            switch (o.input) {
              case "checkbox":
                return e.checked ? 1 : 0;
              case "radio":
                return e.checked ? e.value : null;
              case "file":
                return e.files.length ? e.files[0] : null;
              default:
                return o.inputAutoTrim ? e.value.trim() : e.value;
            }
          };
          o.input &&
            setTimeout(function () {
              var e = t.getInput();
              e && S(e);
            }, 0);
          for (
            var m = function (e) {
                if ((o.showLoaderOnConfirm && l.showLoading(), o.preConfirm)) {
                  t.resetValidationError();
                  var n = Promise.resolve().then(function () {
                    return o.preConfirm(e, o.extraParams);
                  });
                  o.expectRejections
                    ? n.then(
                        function (t) {
                          return s(t || e);
                        },
                        function (e) {
                          t.hideLoading(), e && t.showValidationError(e);
                        }
                      )
                    : n.then(
                        function (n) {
                          D(r.validationError) || !1 === n
                            ? t.hideLoading()
                            : s(n || e);
                        },
                        function (e) {
                          return u(e);
                        }
                      );
                } else s(e);
              },
              g = function (n) {
                var i = n || window.event,
                  e = i.target || i.srcElement,
                  a = r.confirmButton,
                  s = r.cancelButton,
                  c = a && (a === e || a.contains(e)),
                  f = s && (s === e || s.contains(e));
                switch (i.type) {
                  case "click":
                    if (!(c && l.isVisible()))
                      f &&
                        l.isVisible() &&
                        (t.disableButtons(), d(l.DismissReason.cancel));
                    else if ((t.disableButtons(), o.input)) {
                      var g = p();
                      if (o.inputValidator) {
                        t.disableInput();
                        var h = Promise.resolve().then(function () {
                          return o.inputValidator(g, o.extraParams);
                        });
                        o.expectRejections
                          ? h.then(
                              function () {
                                t.enableButtons(), t.enableInput(), m(g);
                              },
                              function (e) {
                                t.enableButtons(),
                                  t.enableInput(),
                                  e && t.showValidationError(e);
                              }
                            )
                          : h.then(
                              function (e) {
                                t.enableButtons(),
                                  t.enableInput(),
                                  e ? t.showValidationError(e) : m(g);
                              },
                              function (e) {
                                return u(e);
                              }
                            );
                      } else m(g);
                    } else m(!0);
                    break;
                  default:
                }
              },
              b = r.popup.querySelectorAll("button"),
              y = 0;
            y < b.length;
            y++
          )
            (b[y].onclick = g),
              (b[y].onmouseover = g),
              (b[y].onmouseout = g),
              (b[y].onmousedown = g);
          if (
            ((r.closeButton.onclick = function () {
              d(l.DismissReason.close);
            }),
            o.toast)
          )
            r.popup.onclick = function () {
              o.showConfirmButton ||
                o.showCancelButton ||
                o.showCloseButton ||
                o.input ||
                (l.closePopup(o.onClose, o.onAfterClose),
                d(l.DismissReason.close));
            };
          else {
            var i = !1;
            (r.popup.onmousedown = function () {
              r.container.onmouseup = function (t) {
                (r.container.onmouseup = void 0),
                  t.target === r.container && (i = !0);
              };
            }),
              (r.container.onmousedown = function () {
                r.popup.onmouseup = function (t) {
                  (r.popup.onmouseup = void 0),
                    (t.target === r.popup || r.popup.contains(t.target)) &&
                      (i = !0);
                };
              }),
              (r.container.onclick = function (t) {
                return i
                  ? void (i = !1)
                  : void (
                      t.target !== r.container ||
                      (v(o.allowOutsideClick) && d(l.DismissReason.backdrop))
                    );
              });
          }
          o.reverseButtons
            ? r.confirmButton.parentNode.insertBefore(
                r.cancelButton,
                r.confirmButton
              )
            : r.confirmButton.parentNode.insertBefore(
                r.confirmButton,
                r.cancelButton
              );
          var C = function (e, t) {
            for (var n = Z(o.focusCancel), i = 0; i < n.length; i++) {
              (e += t),
                e === n.length ? (e = 0) : -1 === e && (e = n.length - 1);
              var a = n[e];
              if (D(a)) return a.focus();
            }
          };
          o.toast &&
            ce.windowOnkeydownOverridden &&
            ((window.onkeydown = ce.previousWindowKeyDown),
            (ce.windowOnkeydownOverridden = !1)),
            o.toast ||
              ce.windowOnkeydownOverridden ||
              ((ce.previousWindowKeyDown = window.onkeydown),
              (ce.windowOnkeydownOverridden = !0),
              (window.onkeydown = function (n) {
                var i = n || window.event;
                if ("Enter" === i.key && !i.isComposing) {
                  if (i.target === t.getInput()) {
                    if (-1 !== ["textarea", "file"].indexOf(o.input)) return;
                    l.clickConfirm(), i.preventDefault();
                  }
                } else if ("Tab" === i.key) {
                  for (
                    var e = i.target || i.srcElement,
                      a = Z(o.focusCancel),
                      s = -1,
                      u = 0;
                    u < a.length;
                    u++
                  )
                    if (e === a[u]) {
                      s = u;
                      break;
                    }
                  i.shiftKey ? C(s, -1) : C(s, 1),
                    i.stopPropagation(),
                    i.preventDefault();
                } else
                  -1 ===
                  [
                    "ArrowLeft",
                    "ArrowRight",
                    "ArrowUp",
                    "ArrowDown",
                    "Left",
                    "Right",
                    "Up",
                    "Down",
                  ].indexOf(i.key)
                    ? ("Escape" === i.key || "Esc" === i.key) &&
                      !0 === v(o.allowEscapeKey) &&
                      d(l.DismissReason.esc)
                    : document.activeElement === r.confirmButton &&
                      D(r.cancelButton)
                    ? r.cancelButton.focus()
                    : document.activeElement === r.cancelButton &&
                      D(r.confirmButton) &&
                      r.confirmButton.focus();
              })),
            t.enableButtons(),
            t.hideLoading(),
            t.resetValidationError(),
            o.input && L(document.body, k["has-input"]);
          for (
            var x = [
                "input",
                "file",
                "range",
                "select",
                "radio",
                "checkbox",
                "textarea",
              ],
              B = void 0,
              A = 0;
            A < x.length;
            A++
          ) {
            var E = k[x[A]],
              P = _(r.content, E);
            if (((B = t.getInput(x[A])), B)) {
              for (var O in B.attributes)
                if (B.attributes.hasOwnProperty(O)) {
                  var q = B.attributes[O].name;
                  "type" !== q && "value" !== q && B.removeAttribute(q);
                }
              for (var j in o.inputAttributes)
                B.setAttribute(j, o.inputAttributes[j]);
            }
            (P.className = E), o.inputClass && L(P, o.inputClass), V(P);
          }
          var R;
          switch (o.input) {
            case "text":
            case "email":
            case "password":
            case "number":
            case "tel":
            case "url":
              (B = _(r.content, k.input)),
                (B.value = o.inputValue),
                (B.placeholder = o.inputPlaceholder),
                (B.type = o.input),
                T(B);
              break;
            case "file":
              (B = _(r.content, k.file)),
                (B.placeholder = o.inputPlaceholder),
                (B.type = o.input),
                T(B);
              break;
            case "range":
              var M = _(r.content, k.range),
                I = M.querySelector("input"),
                N = M.querySelector("output");
              (I.value = o.inputValue),
                (I.type = o.input),
                (N.value = o.inputValue),
                T(M);
              break;
            case "select":
              var H = _(r.content, k.select);
              if (((H.innerHTML = ""), o.inputPlaceholder)) {
                var W = document.createElement("option");
                (W.innerHTML = o.inputPlaceholder),
                  (W.value = ""),
                  (W.disabled = !0),
                  (W.selected = !0),
                  H.appendChild(W);
              }
              R = function (e) {
                e.forEach(function (e) {
                  var t = c(e, 2),
                    n = t[0],
                    i = t[1],
                    a = document.createElement("option");
                  (a.value = n),
                    (a.innerHTML = i),
                    o.inputValue.toString() === n.toString() &&
                      (a.selected = !0),
                    H.appendChild(a);
                }),
                  T(H),
                  H.focus();
              };
              break;
            case "radio":
              var U = _(r.content, k.radio);
              (U.innerHTML = ""),
                (R = function (e) {
                  e.forEach(function (e) {
                    var t = c(e, 2),
                      n = t[0],
                      i = t[1],
                      a = document.createElement("input"),
                      r = document.createElement("label");
                    (a.type = "radio"),
                      (a.name = k.radio),
                      (a.value = n),
                      o.inputValue.toString() === n.toString() &&
                        (a.checked = !0),
                      (r.innerHTML = i),
                      r.insertBefore(a, r.firstChild),
                      U.appendChild(r);
                  }),
                    T(U);
                  var t = U.querySelectorAll("input");
                  t.length && t[0].focus();
                });
              break;
            case "checkbox":
              var K = _(r.content, k.checkbox),
                z = t.getInput("checkbox");
              (z.type = "checkbox"),
                (z.value = 1),
                (z.id = k.checkbox),
                (z.checked = !!o.inputValue);
              var F = K.getElementsByTagName("span");
              F.length && K.removeChild(F[0]),
                (F = document.createElement("span")),
                (F.innerHTML = o.inputPlaceholder),
                K.appendChild(F),
                T(K);
              break;
            case "textarea":
              var Q = _(r.content, k.textarea);
              (Q.value = o.inputValue),
                (Q.placeholder = o.inputPlaceholder),
                T(Q);
              break;
            case null:
              break;
            default:
              h(
                'Unexpected type of input! Expected "text", "email", "password", "number", "tel", "select", "radio", "checkbox", "textarea", "file" or "url", got "' +
                  o.input +
                  '"'
              );
          }
          if ("select" === o.input || "radio" === o.input) {
            var Y = function (e) {
              return R(f(e));
            };
            w(o.inputOptions)
              ? (l.showLoading(),
                o.inputOptions.then(function (e) {
                  t.hideLoading(), Y(e);
                }))
              : "object" === a(o.inputOptions)
              ? Y(o.inputOptions)
              : h(
                  "Unexpected type of inputOptions! Expected object, Map or Promise, got " +
                    a(o.inputOptions)
                );
          } else
            -1 !==
              ["text", "email", "number", "tel", "textarea"].indexOf(o.input) &&
              w(o.inputValue) &&
              (l.showLoading(),
              V(B),
              o.inputValue
                .then(function (e) {
                  (B.value =
                    "number" === o.input ? parseFloat(e) || 0 : e + ""),
                    T(B),
                    t.hideLoading();
                })
                .catch(function (e) {
                  h("Error in inputValue promise: " + e),
                    (B.value = ""),
                    T(B),
                    t.hideLoading();
                }));
          Se(o.animation, o.onBeforeOpen, o.onOpen),
            o.toast ||
              (v(o.allowEnterKey)
                ? o.focusCancel && D(r.cancelButton)
                  ? r.cancelButton.focus()
                  : o.focusConfirm && D(r.confirmButton)
                  ? r.confirmButton.focus()
                  : C(-1, 1)
                : document.activeElement && document.activeElement.blur()),
            (r.container.scrollTop = 0);
        });
      },
    }),
    Le = void 0;
  (o.prototype.then = function (e, t) {
    var n = Ae.promise.get(this);
    return n.then(e, t);
  }),
    (o.prototype.catch = function (e) {
      var t = Ae.promise.get(this);
      return t.catch(e);
    }),
    (o.prototype.finally = function (e) {
      var t = Ae.promise.get(this);
      return t.finally(e);
    }),
    s(o.prototype, Pe),
    s(o, ke),
    Object.keys(Pe).forEach(function (e) {
      o[e] = function () {
        if (Le) {
          var t;
          return (t = Le)[e].apply(t, arguments);
        }
      };
    }),
    (o.DismissReason = C),
    (o.noop = function () {}),
    (o.version = "7.19.3");
  var Oe = e(
    (function (e) {
      var t = (function (t) {
        function n() {
          return (
            i(this, n),
            u(
              this,
              (n.__proto__ || Object.getPrototypeOf(n)).apply(this, arguments)
            )
          );
        }
        return (
          d(n, t),
          r(
            n,
            [
              {
                key: "_main",
                value: function (e) {
                  return l(
                    n.prototype.__proto__ || Object.getPrototypeOf(n.prototype),
                    "_main",
                    this
                  ).call(this, s({}, ye, e));
                },
              },
            ],
            [
              {
                key: "setDefaults",
                value: function (t) {
                  if (
                    (y(
                      '"setDefaults" & "resetDefaults" methods are deprecated in favor of "mixin" method and will be removed in the next major release. For new projects, use "mixin". For past projects already using "setDefaults", support will be provided through an additional package.'
                    ),
                    !t ||
                      "object" !==
                        ("undefined" == typeof t ? "undefined" : a(t)))
                  )
                    throw new TypeError(
                      "WebpushSweetAlert2: The argument for setDefaults() is required and has to be a object"
                    );
                  be(t),
                    Object.keys(t).forEach(function (n) {
                      e.isValidParameter(n) && (ye[n] = t[n]);
                    });
                },
              },
              {
                key: "resetDefaults",
                value: function () {
                  y(
                    '"setDefaults" & "resetDefaults" methods are deprecated in favor of "mixin" method and will be removed in the next major release. For new projects, use "mixin". For past projects already using "setDefaults", support will be provided through an additional package.'
                  ),
                    (ye = {});
                },
              },
            ]
          ),
          n
        );
      })(e);
      return (
        "undefined" != typeof window &&
          "object" === a(window._webpushSwalDefaults) &&
          t.setDefaults(window._webpushSwalDefaults),
        t
      );
    })(o)
  );
  return (Oe.default = Oe), Oe;
}),
  "undefined" != typeof window &&
    window.WebpushSweetalert2 &&
    (window.webpushSwal =
      window.webpushSweetAlert =
      window.WebpushSwal =
      window.WebpushSweetAlert =
        window.WebpushSweetalert2);

!(function (e, t) {
  "object" == typeof exports && "undefined" != typeof module
    ? t()
    : "function" == typeof define && define.amd
    ? define(t)
    : t();
})(0, function () {
  "use strict";
  function e(e) {
    var t = this.constructor;
    return this.then(
      function (n) {
        return t.resolve(e()).then(function () {
          return n;
        });
      },
      function (n) {
        return t.resolve(e()).then(function () {
          return t.reject(n);
        });
      }
    );
  }
  function t(e) {
    return new this(function (t, n) {
      function o(e, n) {
        if (n && ("object" == typeof n || "function" == typeof n)) {
          var f = n.then;
          if ("function" == typeof f)
            return void f.call(
              n,
              function (t) {
                o(e, t);
              },
              function (n) {
                (r[e] = { status: "rejected", reason: n }), 0 == --i && t(r);
              }
            );
        }
        (r[e] = { status: "fulfilled", value: n }), 0 == --i && t(r);
      }
      if (!e || "undefined" == typeof e.length)
        return n(
          new TypeError(
            typeof e +
              " " +
              e +
              " is not iterable(cannot read property Symbol(Symbol.iterator))"
          )
        );
      var r = Array.prototype.slice.call(e);
      if (0 === r.length) return t([]);
      for (var i = r.length, f = 0; r.length > f; f++) o(f, r[f]);
    });
  }
  function n(e) {
    return !(!e || "undefined" == typeof e.length);
  }
  function o() {}
  function r(e) {
    if (!(this instanceof r))
      throw new TypeError("Promises must be constructed via new");
    if ("function" != typeof e) throw new TypeError("not a function");
    (this._state = 0),
      (this._handled = !1),
      (this._value = undefined),
      (this._deferreds = []),
      l(e, this);
  }
  function i(e, t) {
    for (; 3 === e._state; ) e = e._value;
    0 !== e._state
      ? ((e._handled = !0),
        r._immediateFn(function () {
          var n = 1 === e._state ? t.onFulfilled : t.onRejected;
          if (null !== n) {
            var o;
            try {
              o = n(e._value);
            } catch (r) {
              return void u(t.promise, r);
            }
            f(t.promise, o);
          } else (1 === e._state ? f : u)(t.promise, e._value);
        }))
      : e._deferreds.push(t);
  }
  function f(e, t) {
    try {
      if (t === e)
        throw new TypeError("A promise cannot be resolved with itself.");
      if (t && ("object" == typeof t || "function" == typeof t)) {
        var n = t.then;
        if (t instanceof r) return (e._state = 3), (e._value = t), void c(e);
        if ("function" == typeof n)
          return void l(
            (function (e, t) {
              return function () {
                e.apply(t, arguments);
              };
            })(n, t),
            e
          );
      }
      (e._state = 1), (e._value = t), c(e);
    } catch (o) {
      u(e, o);
    }
  }
  function u(e, t) {
    (e._state = 2), (e._value = t), c(e);
  }
  function c(e) {
    2 === e._state &&
      0 === e._deferreds.length &&
      r._immediateFn(function () {
        e._handled || r._unhandledRejectionFn(e._value);
      });
    for (var t = 0, n = e._deferreds.length; n > t; t++) i(e, e._deferreds[t]);
    e._deferreds = null;
  }
  function l(e, t) {
    var n = !1;
    try {
      e(
        function (e) {
          n || ((n = !0), f(t, e));
        },
        function (e) {
          n || ((n = !0), u(t, e));
        }
      );
    } catch (o) {
      if (n) return;
      (n = !0), u(t, o);
    }
  }
  var a = setTimeout;
  (r.prototype["catch"] = function (e) {
    return this.then(null, e);
  }),
    (r.prototype.then = function (e, t) {
      var n = new this.constructor(o);
      return (
        i(
          this,
          new (function (e, t, n) {
            (this.onFulfilled = "function" == typeof e ? e : null),
              (this.onRejected = "function" == typeof t ? t : null),
              (this.promise = n);
          })(e, t, n)
        ),
        n
      );
    }),
    (r.prototype["finally"] = e),
    (r.all = function (e) {
      return new r(function (t, o) {
        function r(e, n) {
          try {
            if (n && ("object" == typeof n || "function" == typeof n)) {
              var u = n.then;
              if ("function" == typeof u)
                return void u.call(
                  n,
                  function (t) {
                    r(e, t);
                  },
                  o
                );
            }
            (i[e] = n), 0 == --f && t(i);
          } catch (c) {
            o(c);
          }
        }
        if (!n(e)) return o(new TypeError("Promise.all accepts an array"));
        var i = Array.prototype.slice.call(e);
        if (0 === i.length) return t([]);
        for (var f = i.length, u = 0; i.length > u; u++) r(u, i[u]);
      });
    }),
    (r.allSettled = t),
    (r.resolve = function (e) {
      return e && "object" == typeof e && e.constructor === r
        ? e
        : new r(function (t) {
            t(e);
          });
    }),
    (r.reject = function (e) {
      return new r(function (t, n) {
        n(e);
      });
    }),
    (r.race = function (e) {
      return new r(function (t, o) {
        if (!n(e)) return o(new TypeError("Promise.race accepts an array"));
        for (var i = 0, f = e.length; f > i; i++) r.resolve(e[i]).then(t, o);
      });
    }),
    (r._immediateFn =
      ("function" == typeof setImmediate &&
        function (e) {
          setImmediate(e);
        }) ||
      function (e) {
        a(e, 0);
      }),
    (r._unhandledRejectionFn = function (e) {
      void 0 !== console &&
        console &&
        console.warn("Possible Unhandled Promise Rejection:", e);
    });
  var s = (function () {
    if ("undefined" != typeof self) return self;
    if ("undefined" != typeof window) return window;
    if ("undefined" != typeof global) return global;
    throw Error("unable to locate global object");
  })();
  "function" != typeof s.Promise
    ? (s.Promise = r)
    : s.Promise.prototype["finally"]
    ? s.Promise.allSettled || (s.Promise.allSettled = t)
    : (s.Promise.prototype["finally"] = e);
});

var XPPopupStyle =
  " @-webkit-keyframes webpush-swal2-show{0%{-webkit-transform:scale(.7);transform:scale(.7)}45%{-webkit-transform:scale(1.05);transform:scale(1.05)}80%{-webkit-transform:scale(.95);transform:scale(.95)}100%{-webkit-transform:scale(1);transform:scale(1)}}@keyframes webpush-swal2-show{0%{-webkit-transform:scale(.7);transform:scale(.7)}45%{-webkit-transform:scale(1.05);transform:scale(1.05)}80%{-webkit-transform:scale(.95);transform:scale(.95)}100%{-webkit-transform:scale(1);transform:scale(1)}}@-webkit-keyframes webpush-swal2-hide{0%{-webkit-transform:scale(1);transform:scale(1);opacity:1}100%{-webkit-transform:scale(.5);transform:scale(.5);opacity:0}}@keyframes webpush-swal2-hide{0%{-webkit-transform:scale(1);transform:scale(1);opacity:1}100%{-webkit-transform:scale(.5);transform:scale(.5);opacity:0}}@-webkit-keyframes webpush-swal2-animate-success-line-tip{0%{top:1.1875em;left:.0625em;width:0}54%{top:1.0625em;left:.125em;width:0}70%{top:2.1875em;left:-.375em;width:3.125em}84%{top:3em;left:1.3125em;width:1.0625em}100%{top:2.8125em;left:.875em;width:1.5625em}}@keyframes webpush-swal2-animate-success-line-tip{0%{top:1.1875em;left:.0625em;width:0}54%{top:1.0625em;left:.125em;width:0}70%{top:2.1875em;left:-.375em;width:3.125em}84%{top:3em;left:1.3125em;width:1.0625em}100%{top:2.8125em;left:.875em;width:1.5625em}}@-webkit-keyframes webpush-swal2-animate-success-line-long{0%{top:3.375em;right:2.875em;width:0}65%{top:3.375em;right:2.875em;width:0}84%{top:2.1875em;right:0;width:3.4375em}100%{top:2.375em;right:.5em;width:2.9375em}}@keyframes webpush-swal2-animate-success-line-long{0%{top:3.375em;right:2.875em;width:0}65%{top:3.375em;right:2.875em;width:0}84%{top:2.1875em;right:0;width:3.4375em}100%{top:2.375em;right:.5em;width:2.9375em}}@-webkit-keyframes webpush-swal2-rotate-success-circular-line{0%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}5%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}12%{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}100%{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}}@keyframes webpush-swal2-rotate-success-circular-line{0%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}5%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}12%{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}100%{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}}@-webkit-keyframes webpush-swal2-animate-error-x-mark{0%{margin-top:1.625em;-webkit-transform:scale(.4);transform:scale(.4);opacity:0}50%{margin-top:1.625em;-webkit-transform:scale(.4);transform:scale(.4);opacity:0}80%{margin-top:-.375em;-webkit-transform:scale(1.15);transform:scale(1.15)}100%{margin-top:0;-webkit-transform:scale(1);transform:scale(1);opacity:1}}@keyframes webpush-swal2-animate-error-x-mark{0%{margin-top:1.625em;-webkit-transform:scale(.4);transform:scale(.4);opacity:0}50%{margin-top:1.625em;-webkit-transform:scale(.4);transform:scale(.4);opacity:0}80%{margin-top:-.375em;-webkit-transform:scale(1.15);transform:scale(1.15)}100%{margin-top:0;-webkit-transform:scale(1);transform:scale(1);opacity:1}}@-webkit-keyframes webpush-swal2-animate-error-icon{0%{-webkit-transform:rotateX(100deg);transform:rotateX(100deg);opacity:0}100%{-webkit-transform:rotateX(0);transform:rotateX(0);opacity:1}}@keyframes webpush-swal2-animate-error-icon{0%{-webkit-transform:rotateX(100deg);transform:rotateX(100deg);opacity:0}100%{-webkit-transform:rotateX(0);transform:rotateX(0);opacity:1}}body.webpush-swal2-toast-shown.webpush-swal2-has-input>.webpush-swal2-container>.webpush-swal2-toast{flex-direction:column;align-items:stretch}body.webpush-swal2-toast-shown.webpush-swal2-has-input>.webpush-swal2-container>.webpush-swal2-toast .webpush-swal2-actions{flex:1;align-self:stretch;justify-content:flex-end;height:2.2em}body.webpush-swal2-toast-shown.webpush-swal2-has-input>.webpush-swal2-container>.webpush-swal2-toast .webpush-swal2-loading{justify-content:center}body.webpush-swal2-toast-shown.webpush-swal2-has-input>.webpush-swal2-container>.webpush-swal2-toast .webpush-swal2-input{height:2em;margin:.3125em auto;font-size:1em}body.webpush-swal2-toast-shown.webpush-swal2-has-input>.webpush-swal2-container>.webpush-swal2-toast .webpush-swal2-validationerror{font-size:1em}body.webpush-swal2-toast-shown>.webpush-swal2-container{position:fixed;background-color:transparent}body.webpush-swal2-toast-shown>.webpush-swal2-container.webpush-swal2-shown{background-color:transparent}body.webpush-swal2-toast-shown>.webpush-swal2-container.webpush-swal2-top{top:0;right:auto;bottom:auto;left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%)}body.webpush-swal2-toast-shown>.webpush-swal2-container.webpush-swal2-top-end,body.webpush-swal2-toast-shown>.webpush-swal2-container.webpush-swal2-top-right{top:0;right:0;bottom:auto;left:auto}body.webpush-swal2-toast-shown>.webpush-swal2-container.webpush-swal2-top-left,body.webpush-swal2-toast-shown>.webpush-swal2-container.webpush-swal2-top-start{top:0;right:auto;bottom:auto;left:0}body.webpush-swal2-toast-shown>.webpush-swal2-container.webpush-swal2-center-left,body.webpush-swal2-toast-shown>.webpush-swal2-container.webpush-swal2-center-start{top:50%;right:auto;bottom:auto;left:0;-webkit-transform:translateY(-50%);transform:translateY(-50%)}body.webpush-swal2-toast-shown>.webpush-swal2-container.webpush-swal2-center{top:50%;right:auto;bottom:auto;left:50%;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%)}body.webpush-swal2-toast-shown>.webpush-swal2-container.webpush-swal2-center-end,body.webpush-swal2-toast-shown>.webpush-swal2-container.webpush-swal2-center-right{top:50%;right:0;bottom:auto;left:auto;-webkit-transform:translateY(-50%);transform:translateY(-50%)}body.webpush-swal2-toast-shown>.webpush-swal2-container.webpush-swal2-bottom-left,body.webpush-swal2-toast-shown>.webpush-swal2-container.webpush-swal2-bottom-start{top:auto;right:auto;bottom:0;left:0}body.webpush-swal2-toast-shown>.webpush-swal2-container.webpush-swal2-bottom{top:auto;right:auto;bottom:0;left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%)}body.webpush-swal2-toast-shown>.webpush-swal2-container.webpush-swal2-bottom-end,body.webpush-swal2-toast-shown>.webpush-swal2-container.webpush-swal2-bottom-right{top:auto;right:0;bottom:0;left:auto}.webpush-swal2-popup.webpush-swal2-toast{flex-direction:row;align-items:center;width:auto;padding:.625em;box-shadow:0 0 .625em #d9d9d9;overflow-y:hidden}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-header{flex-direction:row}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-title{justify-content:flex-start;margin:0 .6em;font-size:1em}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-close{position:initial}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-content{justify-content:flex-start;font-size:1em}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-icon{width:2em;min-width:2em;height:2em;margin:0}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-icon-text{font-size:2em;font-weight:700;line-height:1em}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-icon.webpush-swal2-success .webpush-swal2-success-ring{width:2em;height:2em}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-icon.webpush-swal2-error [class^=webpush-swal2-x-mark-line]{top:.875em;width:1.375em}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-icon.webpush-swal2-error [class^=webpush-swal2-x-mark-line][class$=left]{left:.3125em}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-icon.webpush-swal2-error [class^=webpush-swal2-x-mark-line][class$=right]{right:.3125em}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-actions{height:auto;margin:0 .3125em}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-styled{margin:0 .3125em;padding:.3125em .625em;font-size:1em}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-styled:focus{box-shadow:0 0 0 .0625em #fff,0 0 0 .125em rgba(50,100,150,.4)}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-success{border-color:#a5dc86}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-success [class^=webpush-swal2-success-circular-line]{position:absolute;width:2em;height:2.8125em;-webkit-transform:rotate(45deg);transform:rotate(45deg);border-radius:50%}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-success [class^=webpush-swal2-success-circular-line][class$=left]{top:-.25em;left:-.9375em;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-transform-origin:2em 2em;transform-origin:2em 2em;border-radius:4em 0 0 4em}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-success [class^=webpush-swal2-success-circular-line][class$=right]{top:-.25em;left:.9375em;-webkit-transform-origin:0 2em;transform-origin:0 2em;border-radius:0 4em 4em 0}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-success .webpush-swal2-success-ring{width:2em;height:2em}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-success .webpush-swal2-success-fix{top:0;left:.4375em;width:.4375em;height:2.6875em}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-success [class^=webpush-swal2-success-line]{height:.3125em}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-success [class^=webpush-swal2-success-line][class$=tip]{top:1.125em;left:.1875em;width:.75em}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-success [class^=webpush-swal2-success-line][class$=long]{top:.9375em;right:.1875em;width:1.375em}.webpush-swal2-popup.webpush-swal2-toast.webpush-swal2-show{-webkit-animation:showSweetToast .5s;animation:showSweetToast .5s}.webpush-swal2-popup.webpush-swal2-toast.webpush-swal2-hide{-webkit-animation:hideSweetToast .2s forwards;animation:hideSweetToast .2s forwards}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-animate-success-icon .webpush-swal2-success-line-tip{-webkit-animation:animate-toast-success-tip .75s;animation:animate-toast-success-tip .75s}.webpush-swal2-popup.webpush-swal2-toast .webpush-swal2-animate-success-icon .webpush-swal2-success-line-long{-webkit-animation:animate-toast-success-long .75s;animation:animate-toast-success-long .75s}@-webkit-keyframes showSweetToast{0%{-webkit-transform:translateY(-.625em) rotateZ(2deg);transform:translateY(-.625em) rotateZ(2deg);opacity:0}33%{-webkit-transform:translateY(0) rotateZ(-2deg);transform:translateY(0) rotateZ(-2deg);opacity:.5}66%{-webkit-transform:translateY(.3125em) rotateZ(2deg);transform:translateY(.3125em) rotateZ(2deg);opacity:.7}100%{-webkit-transform:translateY(0) rotateZ(0);transform:translateY(0) rotateZ(0);opacity:1}}@keyframes showSweetToast{0%{-webkit-transform:translateY(-.625em) rotateZ(2deg);transform:translateY(-.625em) rotateZ(2deg);opacity:0}33%{-webkit-transform:translateY(0) rotateZ(-2deg);transform:translateY(0) rotateZ(-2deg);opacity:.5}66%{-webkit-transform:translateY(.3125em) rotateZ(2deg);transform:translateY(.3125em) rotateZ(2deg);opacity:.7}100%{-webkit-transform:translateY(0) rotateZ(0);transform:translateY(0) rotateZ(0);opacity:1}}@-webkit-keyframes hideSweetToast{0%{opacity:1}33%{opacity:.5}100%{-webkit-transform:rotateZ(1deg);transform:rotateZ(1deg);opacity:0}}@keyframes hideSweetToast{0%{opacity:1}33%{opacity:.5}100%{-webkit-transform:rotateZ(1deg);transform:rotateZ(1deg);opacity:0}}@-webkit-keyframes animate-toast-success-tip{0%{top:.5625em;left:.0625em;width:0}54%{top:.125em;left:.125em;width:0}70%{top:.625em;left:-.25em;width:1.625em}84%{top:1.0625em;left:.75em;width:.5em}100%{top:1.125em;left:.1875em;width:.75em}}@keyframes animate-toast-success-tip{0%{top:.5625em;left:.0625em;width:0}54%{top:.125em;left:.125em;width:0}70%{top:.625em;left:-.25em;width:1.625em}84%{top:1.0625em;left:.75em;width:.5em}100%{top:1.125em;left:.1875em;width:.75em}}@-webkit-keyframes animate-toast-success-long{0%{top:1.625em;right:1.375em;width:0}65%{top:1.25em;right:.9375em;width:0}84%{top:.9375em;right:0;width:1.125em}100%{top:.9375em;right:.1875em;width:1.375em}}@keyframes animate-toast-success-long{0%{top:1.625em;right:1.375em;width:0}65%{top:1.25em;right:.9375em;width:0}84%{top:.9375em;right:0;width:1.125em}100%{top:.9375em;right:.1875em;width:1.375em}}body.webpush-swal2-shown:not(.webpush-swal2-no-backdrop):not(.webpush-swal2-toast-shown),html.webpush-swal2-shown:not(.webpush-swal2-no-backdrop):not(.webpush-swal2-toast-shown){height:auto;overflow-y:hidden}body.webpush-swal2-no-backdrop .webpush-swal2-shown{top:auto;right:auto;bottom:auto;left:auto;background-color:transparent}body.webpush-swal2-no-backdrop .webpush-swal2-shown>.webpush-swal2-modal{box-shadow:0 0 10px rgba(0,0,0,.4)}body.webpush-swal2-no-backdrop .webpush-swal2-shown.webpush-swal2-top{top:0;left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%)}body.webpush-swal2-no-backdrop .webpush-swal2-shown.webpush-swal2-top-left,body.webpush-swal2-no-backdrop .webpush-swal2-shown.webpush-swal2-top-start{top:0;left:0}body.webpush-swal2-no-backdrop .webpush-swal2-shown.webpush-swal2-top-end,body.webpush-swal2-no-backdrop .webpush-swal2-shown.webpush-swal2-top-right{top:0;right:0}body.webpush-swal2-no-backdrop .webpush-swal2-shown.webpush-swal2-center{top:50%;left:50%;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%)}body.webpush-swal2-no-backdrop .webpush-swal2-shown.webpush-swal2-center-left,body.webpush-swal2-no-backdrop .webpush-swal2-shown.webpush-swal2-center-start{top:50%;left:0;-webkit-transform:translateY(-50%);transform:translateY(-50%)}body.webpush-swal2-no-backdrop .webpush-swal2-shown.webpush-swal2-center-end,body.webpush-swal2-no-backdrop .webpush-swal2-shown.webpush-swal2-center-right{top:50%;right:0;-webkit-transform:translateY(-50%);transform:translateY(-50%)}body.webpush-swal2-no-backdrop .webpush-swal2-shown.webpush-swal2-bottom{bottom:0;left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%)}body.webpush-swal2-no-backdrop .webpush-swal2-shown.webpush-swal2-bottom-left,body.webpush-swal2-no-backdrop .webpush-swal2-shown.webpush-swal2-bottom-start{bottom:0;left:0}body.webpush-swal2-no-backdrop .webpush-swal2-shown.webpush-swal2-bottom-end,body.webpush-swal2-no-backdrop .webpush-swal2-shown.webpush-swal2-bottom-right{right:0;bottom:0}.webpush-swal2-container{display:flex;position:fixed;top:0;right:0;bottom:0;left:0;flex-direction:row;align-items:center;justify-content:center;padding:10px;background-color:transparent;z-index:1060;overflow-x:hidden;-webkit-overflow-scrolling:touch}.webpush-swal2-container.webpush-swal2-top{align-items:flex-start}.webpush-swal2-container.webpush-swal2-top-left,.webpush-swal2-container.webpush-swal2-top-start{align-items:flex-start;justify-content:flex-start}.webpush-swal2-container.webpush-swal2-top-end,.webpush-swal2-container.webpush-swal2-top-right{align-items:flex-start;justify-content:flex-end}.webpush-swal2-container.webpush-swal2-center{align-items:center}.webpush-swal2-container.webpush-swal2-center-left,.webpush-swal2-container.webpush-swal2-center-start{align-items:center;justify-content:flex-start}.webpush-swal2-container.webpush-swal2-center-end,.webpush-swal2-container.webpush-swal2-center-right{align-items:center;justify-content:flex-end}.webpush-swal2-container.webpush-swal2-bottom{align-items:flex-end}.webpush-swal2-container.webpush-swal2-bottom-left,.webpush-swal2-container.webpush-swal2-bottom-start{align-items:flex-end;justify-content:flex-start}.webpush-swal2-container.webpush-swal2-bottom-end,.webpush-swal2-container.webpush-swal2-bottom-right{align-items:flex-end;justify-content:flex-end}.webpush-swal2-container.webpush-swal2-grow-fullscreen>.webpush-swal2-modal{display:flex!important;flex:1;align-self:stretch;justify-content:center}.webpush-swal2-container.webpush-swal2-grow-row>.webpush-swal2-modal{display:flex!important;flex:1;align-content:center;justify-content:center}.webpush-swal2-container.webpush-swal2-grow-column{flex:1;flex-direction:column}.webpush-swal2-container.webpush-swal2-grow-column.webpush-swal2-bottom,.webpush-swal2-container.webpush-swal2-grow-column.webpush-swal2-center,.webpush-swal2-container.webpush-swal2-grow-column.webpush-swal2-top{align-items:center}.webpush-swal2-container.webpush-swal2-grow-column.webpush-swal2-bottom-left,.webpush-swal2-container.webpush-swal2-grow-column.webpush-swal2-bottom-start,.webpush-swal2-container.webpush-swal2-grow-column.webpush-swal2-center-left,.webpush-swal2-container.webpush-swal2-grow-column.webpush-swal2-center-start,.webpush-swal2-container.webpush-swal2-grow-column.webpush-swal2-top-left,.webpush-swal2-container.webpush-swal2-grow-column.webpush-swal2-top-start{align-items:flex-start}.webpush-swal2-container.webpush-swal2-grow-column.webpush-swal2-bottom-end,.webpush-swal2-container.webpush-swal2-grow-column.webpush-swal2-bottom-right,.webpush-swal2-container.webpush-swal2-grow-column.webpush-swal2-center-end,.webpush-swal2-container.webpush-swal2-grow-column.webpush-swal2-center-right,.webpush-swal2-container.webpush-swal2-grow-column.webpush-swal2-top-end,.webpush-swal2-container.webpush-swal2-grow-column.webpush-swal2-top-right{align-items:flex-end}.webpush-swal2-container.webpush-swal2-grow-column>.webpush-swal2-modal{display:flex!important;flex:1;align-content:center;justify-content:center}.webpush-swal2-container:not(.webpush-swal2-top):not(.webpush-swal2-top-start):not(.webpush-swal2-top-end):not(.webpush-swal2-top-left):not(.webpush-swal2-top-right):not(.webpush-swal2-center-start):not(.webpush-swal2-center-end):not(.webpush-swal2-center-left):not(.webpush-swal2-center-right):not(.webpush-swal2-bottom):not(.webpush-swal2-bottom-start):not(.webpush-swal2-bottom-end):not(.webpush-swal2-bottom-left):not(.webpush-swal2-bottom-right)>.webpush-swal2-modal{margin:auto}@media all and (-ms-high-contrast:none),(-ms-high-contrast:active){.webpush-swal2-container .webpush-swal2-modal{margin:0!important}}.webpush-swal2-container.webpush-swal2-fade{transition:background-color .1s}.webpush-swal2-container.webpush-swal2-shown{background-color:rgba(0,0,0,.4)}.webpush-swal2-popup{display:none;position:relative;flex-direction:column;justify-content:center;width:32em;max-width:100%;padding:1.25em;border-radius:.3125em;background:#fff;font-family:inherit;font-size:1rem;box-sizing:border-box}.webpush-swal2-popup:focus{outline:0}.webpush-swal2-popup.webpush-swal2-loading{overflow-y:hidden}.webpush-swal2-popup .webpush-swal2-header{display:flex;flex-direction:column;align-items:center}.webpush-swal2-popup .webpush-swal2-title{display:block;position:relative;max-width:100%;margin:0 0 .4em;padding:0;color:#595959;font-size:1.875em;font-weight:600;text-align:center;text-transform:none;word-wrap:break-word}.webpush-swal2-popup .webpush-swal2-actions{align-items:center;justify-content:center;margin:1.25em auto 0}.webpush-swal2-popup .webpush-swal2-actions:not(.webpush-swal2-loading) .webpush-swal2-styled[disabled]{opacity:.4}.webpush-swal2-popup .webpush-swal2-actions:not(.webpush-swal2-loading) .webpush-swal2-styled:hover{background-image:linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1))}.webpush-swal2-popup .webpush-swal2-actions:not(.webpush-swal2-loading) .webpush-swal2-styled:active{background-image:linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2))}.webpush-swal2-popup .webpush-swal2-actions.webpush-swal2-loading .webpush-swal2-styled.webpush-swal2-confirm{width:2.5em;height:2.5em;margin:.46875em;padding:0;border:.25em solid transparent;border-radius:100%;border-color:transparent;background-color:transparent!important;color:transparent;cursor:default;box-sizing:border-box;-webkit-animation:webpush-swal2-rotate-loading 1.5s linear 0s infinite normal;animation:webpush-swal2-rotate-loading 1.5s linear 0s infinite normal;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.webpush-swal2-popup .webpush-swal2-actions.webpush-swal2-loading .webpush-swal2-styled.webpush-swal2-cancel{margin-right:30px;margin-left:30px}.webpush-swal2-popup .webpush-swal2-actions.webpush-swal2-loading :not(.webpush-swal2-styled).webpush-swal2-confirm::after{display:inline-block;width:15px;height:15px;margin-left:5px;border:3px solid #999;border-radius:50%;border-right-color:transparent;box-shadow:1px 1px 1px #fff;content:'';-webkit-animation:webpush-swal2-rotate-loading 1.5s linear 0s infinite normal;animation:webpush-swal2-rotate-loading 1.5s linear 0s infinite normal}.webpush-swal2-popup .webpush-swal2-styled{min-width:auto;height:auto;margin:0 .3125em;padding:.625em 2em;font-weight:500;box-shadow:none}.webpush-swal2-popup .webpush-swal2-styled:not([disabled]){cursor:pointer}.webpush-swal2-popup .webpush-swal2-styled.webpush-swal2-confirm{border:0;border-radius:.25em;background:initial;background-color:#3085d6;color:#fff;font-size:1.0625em}.webpush-swal2-popup .webpush-swal2-styled.webpush-swal2-cancel{border:0;border-radius:.25em;background:initial;background-color:#aaa;color:#fff;font-size:1.0625em}.webpush-swal2-popup .webpush-swal2-styled:focus{outline:0;box-shadow:0 0 0 2px #fff,0 0 0 4px rgba(50,100,150,.4)}.webpush-swal2-popup .webpush-swal2-styled::-moz-focus-inner{border:0}.webpush-swal2-popup .webpush-swal2-footer{justify-content:center;margin:1.25em 0 0;padding-top:1em;border-top:1px solid #eee;color:#545454;font-size:1em}.webpush-swal2-popup .webpush-swal2-image{max-width:100%;margin:1.25em auto}.webpush-swal2-popup .webpush-swal2-close{min-width:auto;height:auto;position:absolute;top:0;right:0;justify-content:center;width:1.2em;height:1.2em;padding:0;transition:color .1s ease-out;border:none;border-radius:0;background:0 0;color:#ccc;font-family:serif;font-size:2.5em;line-height:1.2;cursor:pointer;overflow:hidden}.webpush-swal2-popup .webpush-swal2-close:hover{-webkit-transform:none;transform:none;color:#f27474}.webpush-swal2-popup>.webpush-swal2-checkbox,.webpush-swal2-popup>.webpush-swal2-file,.webpush-swal2-popup>.webpush-swal2-input,.webpush-swal2-popup>.webpush-swal2-radio,.webpush-swal2-popup>.webpush-swal2-select,.webpush-swal2-popup>.webpush-swal2-textarea{display:none}.webpush-swal2-popup .webpush-swal2-content{justify-content:center;margin:0;padding:0;color:#545454;font-size:1.125em;font-weight:300;line-height:normal;word-wrap:break-word}.webpush-swal2-popup #webpush-swal2-content{text-align:center}.webpush-swal2-popup .webpush-swal2-checkbox,.webpush-swal2-popup .webpush-swal2-file,.webpush-swal2-popup .webpush-swal2-input,.webpush-swal2-popup .webpush-swal2-radio,.webpush-swal2-popup .webpush-swal2-select,.webpush-swal2-popup .webpush-swal2-textarea{margin:1em auto}.webpush-swal2-popup .webpush-swal2-file,.webpush-swal2-popup .webpush-swal2-input,.webpush-swal2-popup .webpush-swal2-textarea{width:100%;transition:border-color .3s,box-shadow .3s;border:1px solid #d9d9d9;border-radius:.1875em;font-size:1.125em;box-shadow:inset 0 1px 1px rgba(0,0,0,.06);box-sizing:border-box}.webpush-swal2-popup .webpush-swal2-file.webpush-swal2-inputerror,.webpush-swal2-popup .webpush-swal2-input.webpush-swal2-inputerror,.webpush-swal2-popup .webpush-swal2-textarea.webpush-swal2-inputerror{border-color:#f27474!important;box-shadow:0 0 2px #f27474!important}.webpush-swal2-popup .webpush-swal2-file:focus,.webpush-swal2-popup .webpush-swal2-input:focus,.webpush-swal2-popup .webpush-swal2-textarea:focus{border:1px solid #b4dbed;outline:0;box-shadow:0 0 3px #c4e6f5}.webpush-swal2-popup .webpush-swal2-file::-webkit-input-placeholder,.webpush-swal2-popup .webpush-swal2-input::-webkit-input-placeholder,.webpush-swal2-popup .webpush-swal2-textarea::-webkit-input-placeholder{color:#ccc}.webpush-swal2-popup .webpush-swal2-file:-ms-input-placeholder,.webpush-swal2-popup .webpush-swal2-input:-ms-input-placeholder,.webpush-swal2-popup .webpush-swal2-textarea:-ms-input-placeholder{color:#ccc}.webpush-swal2-popup .webpush-swal2-file::-ms-input-placeholder,.webpush-swal2-popup .webpush-swal2-input::-ms-input-placeholder,.webpush-swal2-popup .webpush-swal2-textarea::-ms-input-placeholder{color:#ccc}.webpush-swal2-popup .webpush-swal2-file::placeholder,.webpush-swal2-popup .webpush-swal2-input::placeholder,.webpush-swal2-popup .webpush-swal2-textarea::placeholder{color:#ccc}.webpush-swal2-popup .webpush-swal2-range input{width:80%}.webpush-swal2-popup .webpush-swal2-range output{width:20%;font-weight:600;text-align:center}.webpush-swal2-popup .webpush-swal2-range input,.webpush-swal2-popup .webpush-swal2-range output{height:2.625em;margin:1em auto;padding:0;font-size:1.125em;line-height:2.625em}.webpush-swal2-popup .webpush-swal2-input{height:2.625em;padding:.75em}.webpush-swal2-popup .webpush-swal2-input[type=number]{max-width:10em}.webpush-swal2-popup .webpush-swal2-file{font-size:1.125em}.webpush-swal2-popup .webpush-swal2-textarea{height:6.75em;padding:.75em}.webpush-swal2-popup .webpush-swal2-select{min-width:50%;max-width:100%;padding:.375em .625em;color:#545454;font-size:1.125em}.webpush-swal2-popup .webpush-swal2-checkbox,.webpush-swal2-popup .webpush-swal2-radio{align-items:center;justify-content:center}.webpush-swal2-popup .webpush-swal2-checkbox label,.webpush-swal2-popup .webpush-swal2-radio label{margin:0 .6em;font-size:1.125em}.webpush-swal2-popup .webpush-swal2-checkbox input,.webpush-swal2-popup .webpush-swal2-radio input{margin:0 .4em}.webpush-swal2-popup .webpush-swal2-validationerror{display:none;align-items:center;justify-content:center;padding:.625em;background:#f0f0f0;color:#666;font-size:1em;font-weight:300;overflow:hidden}.webpush-swal2-popup .webpush-swal2-validationerror::before{display:inline-block;width:1.5em;height:1.5em;margin:0 .625em;border-radius:50%;background-color:#f27474;color:#fff;font-weight:600;line-height:1.5em;text-align:center;content:'!';zoom:normal}@supports (-ms-accelerator:true){.webpush-swal2-range input{width:100%!important}.webpush-swal2-range output{display:none}}@media all and (-ms-high-contrast:none),(-ms-high-contrast:active){.webpush-swal2-range input{width:100%!important}.webpush-swal2-range output{display:none}}@-moz-document url-prefix(){.webpush-swal2-close:focus{outline:2px solid rgba(50,100,150,.4)}}.webpush-swal2-icon{position:relative;justify-content:center;width:5em;height:5em;margin:1.25em auto 1.875em;border:.25em solid transparent;border-radius:50%;line-height:5em;cursor:default;box-sizing:content-box;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;zoom:normal}.webpush-swal2-icon-text{font-size:3.75em}.webpush-swal2-icon.webpush-swal2-error{border-color:#f27474}.webpush-swal2-icon.webpush-swal2-error .webpush-swal2-x-mark{position:relative;flex-grow:1}.webpush-swal2-icon.webpush-swal2-error [class^=webpush-swal2-x-mark-line]{display:block;position:absolute;top:2.3125em;width:2.9375em;height:.3125em;border-radius:.125em;background-color:#f27474}.webpush-swal2-icon.webpush-swal2-error [class^=webpush-swal2-x-mark-line][class$=left]{left:1.0625em;-webkit-transform:rotate(45deg);transform:rotate(45deg)}.webpush-swal2-icon.webpush-swal2-error [class^=webpush-swal2-x-mark-line][class$=right]{right:1em;-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}.webpush-swal2-icon.webpush-swal2-warning{border-color:#facea8;color:#f8bb86}.webpush-swal2-icon.webpush-swal2-info{border-color:#9de0f6;color:#3fc3ee}.webpush-swal2-icon.webpush-swal2-question{border-color:#c9dae1;color:#87adbd}.webpush-swal2-icon.webpush-swal2-success{border-color:#a5dc86}.webpush-swal2-icon.webpush-swal2-success [class^=webpush-swal2-success-circular-line]{position:absolute;width:3.75em;height:7.5em;-webkit-transform:rotate(45deg);transform:rotate(45deg);border-radius:50%}.webpush-swal2-icon.webpush-swal2-success [class^=webpush-swal2-success-circular-line][class$=left]{top:-.4375em;left:-2.0635em;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-transform-origin:3.75em 3.75em;transform-origin:3.75em 3.75em;border-radius:7.5em 0 0 7.5em}.webpush-swal2-icon.webpush-swal2-success [class^=webpush-swal2-success-circular-line][class$=right]{top:-.6875em;left:1.875em;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-transform-origin:0 3.75em;transform-origin:0 3.75em;border-radius:0 7.5em 7.5em 0}.webpush-swal2-icon.webpush-swal2-success .webpush-swal2-success-ring{position:absolute;top:-.25em;left:-.25em;width:100%;height:100%;border:.25em solid rgba(165,220,134,.3);border-radius:50%;z-index:2;box-sizing:content-box}.webpush-swal2-icon.webpush-swal2-success .webpush-swal2-success-fix{position:absolute;top:.5em;left:1.625em;width:.4375em;height:5.625em;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);z-index:1}.webpush-swal2-icon.webpush-swal2-success [class^=webpush-swal2-success-line]{display:block;position:absolute;height:.3125em;border-radius:.125em;background-color:#a5dc86;z-index:2}.webpush-swal2-icon.webpush-swal2-success [class^=webpush-swal2-success-line][class$=tip]{top:2.875em;left:.875em;width:1.5625em;-webkit-transform:rotate(45deg);transform:rotate(45deg)}.webpush-swal2-icon.webpush-swal2-success [class^=webpush-swal2-success-line][class$=long]{top:2.375em;right:.5em;width:2.9375em;-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}.webpush-swal2-progresssteps{align-items:center;margin:0 0 1.25em;padding:0;font-weight:600}.webpush-swal2-progresssteps li{display:inline-block;position:relative}.webpush-swal2-progresssteps .webpush-swal2-progresscircle{width:2em;height:2em;border-radius:2em;background:#3085d6;color:#fff;line-height:2em;text-align:center;z-index:20}.webpush-swal2-progresssteps .webpush-swal2-progresscircle:first-child{margin-left:0}.webpush-swal2-progresssteps .webpush-swal2-progresscircle:last-child{margin-right:0}.webpush-swal2-progresssteps .webpush-swal2-progresscircle.webpush-swal2-activeprogressstep{background:#3085d6}.webpush-swal2-progresssteps .webpush-swal2-progresscircle.webpush-swal2-activeprogressstep~.webpush-swal2-progresscircle{background:#add8e6}.webpush-swal2-progresssteps .webpush-swal2-progresscircle.webpush-swal2-activeprogressstep~.webpush-swal2-progressline{background:#add8e6}.webpush-swal2-progresssteps .webpush-swal2-progressline{width:2.5em;height:.4em;margin:0 -1px;background:#3085d6;z-index:10}[class^=webpush-swal2]{-webkit-tap-highlight-color:transparent}.webpush-swal2-show{-webkit-animation:webpush-swal2-show .3s;animation:webpush-swal2-show .3s}.webpush-swal2-show.webpush-swal2-noanimation{-webkit-animation:none;animation:none}.webpush-swal2-hide{-webkit-animation:webpush-swal2-hide .15s forwards;animation:webpush-swal2-hide .15s forwards}.webpush-swal2-hide.webpush-swal2-noanimation{-webkit-animation:none;animation:none}[dir=rtl] .webpush-swal2-close{right:auto;left:0}.webpush-swal2-animate-success-icon .webpush-swal2-success-line-tip{-webkit-animation:webpush-swal2-animate-success-line-tip .75s;animation:webpush-swal2-animate-success-line-tip .75s}.webpush-swal2-animate-success-icon .webpush-swal2-success-line-long{-webkit-animation:webpush-swal2-animate-success-line-long .75s;animation:webpush-swal2-animate-success-line-long .75s}.webpush-swal2-animate-success-icon .webpush-swal2-success-circular-line-right{-webkit-animation:webpush-swal2-rotate-success-circular-line 4.25s ease-in;animation:webpush-swal2-rotate-success-circular-line 4.25s ease-in}.webpush-swal2-animate-error-icon{-webkit-animation:webpush-swal2-animate-error-icon .5s;animation:webpush-swal2-animate-error-icon .5s}.webpush-swal2-animate-error-icon .webpush-swal2-x-mark{-webkit-animation:webpush-swal2-animate-error-x-mark .5s;animation:webpush-swal2-animate-error-x-mark .5s}@-webkit-keyframes webpush-swal2-rotate-loading{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes webpush-swal2-rotate-loading{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}.webpush-scroll-content.webpush-swal2-modal{max-height:100% !important;min-height:initial !important;}.webpush-scroll-content .webpush-swal2-content{max-height: 25vh !important;overflow: auto !important;} ";
