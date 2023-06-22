var WURFL = {
    advertised_browser: "Edge",
    advertised_browser_version: "114.0",
    advertised_device_os: "Windows",
    advertised_device_os_version: "10",
    brand_name: "Microsoft",
    complete_device_name: "Microsoft Edge",
    form_factor: "Desktop",
    is_app_webview: !1,
    is_full_desktop: !0,
    is_mobile: !1,
    is_robot: !1,
    is_smartphone: !1,
    is_smarttv: !1,
    is_tablet: !1,
    manufacturer_name: "",
    marketing_name: "",
    max_image_height: 600,
    max_image_width: 800,
    model_name: "Edge",
    physical_screen_height: 400,
    physical_screen_width: 400,
    pointing_method: "mouse",
    resolution_height: 600,
    resolution_width: 800
},
    wurfl_debug = !1,
    wurfljs_host = "https://device.pragmaticplay.net",
    WurflJsUACHResolver = function (e, t, n) {
        function c(e, t) {
            var n;
            "CustomEvent" in s ? o.dispatchEvent(new s.CustomEvent(e, {
                bubbles: !0,
                detail: t
            })) : ((n = o.createEvent("CustomEvent")).initCustomEvent(e, !0, !0, t), o.dispatchEvent(n))
        }

        function i() {
            c("WurflJSDetectionComplete", {
                WURFL: s.WURFL
            })
        }

        function u(e) {
            e instanceof SecurityPolicyViolationEvent && e.blockedURI === r && (e = new URL(r).origin, console.warn('WURFL.js was blocked by your Content-Security-Policy, please allow: "connect-src ' + e + '"'))
        }

        function h() {
            return new Promise(function (e, t) {
                try {
                    s.navigator.userAgentData.getHighEntropyValues(m).then(function (n) {
                        s.fetch(r, {
                            method: "post",
                            body: JSON.stringify({
                                uach: function (e) {
                                    var t, n = {};
                                    for (t in e) switch (typeof e[t]) {
                                        case "object":
                                            n[t] = f(e[t]);
                                            break;
                                        case "boolean":
                                            n[t] = e.k ? "?1" : "?0";
                                            break;
                                        default:
                                            n[t] = '"' + e[t].toString() + '"'
                                    }
                                    return n
                                }(n)
                            }),
                            headers: {
                                accept: "application/json",
                                "content-type": "application/json"
                            }
                        }).then(function (e) {
                            return e.json()
                        }).then(function (n) {
                            var o, i;
                            "WURFL" in n && "object" == typeof n.WURFL ? (d && (i = n.WURFL, o = n.confidence, !s.localStorage || o < 2 || (s.localStorage.setItem("wjs-version", l), s.localStorage.setItem("wjs-ua", s.navigator.userAgent), s.localStorage.setItem("wjs-confidence", o), s.localStorage.setItem("wjs-data", JSON.stringify(i)), null === s.localStorage.getItem("wjs-expires") && ((o = new Date).setTime(o.getTime() + 6048e5), s.localStorage.setItem("wjs-expires", o.getTime())))), e(n.WURFL)) : t("WURFL.js UA-CH detection failed: corrupt UA-CH response")
                        }).catch(function (e) {
                            t("WURFL.js UA-CH detection failed: " + e)
                        })
                    }).catch(function (e) {
                        t("WURFL.js UA-CH detection failed: " + e)
                    })
                } catch (e) {
                    t("WURFL.js UA-CH detection failed: " + e)
                }
            })
        }
        var l = "2206bcd",
            s = e,
            o = s.document,
            r = t + "/async-detect" + (void 0 !== s.WURFL.wurfl_id ? "?wurfl_id=true" : ""),
            m = ["architecture", "bitness", "model", "platformVersion", "uaFullVersion", "fullVersionList"],
            d = !n,
            a = (this.clearCache = function () {
                s.localStorage.removeItem("wjs-version"), s.localStorage.removeItem("wjs-expires"), s.localStorage.removeItem("wjs-ua"), s.localStorage.removeItem("wjs-data"), s.localStorage.removeItem("wjs-confidence")
            }, this.clearCache),
            f = function (e) {
                var t, n = [];
                for (t in e) n.push('"' + e[t].brand + '";v="' + e[t].version + '"');
                return n.join(", ")
            };
        this.main = function () {
            if ("Promise" in s && (s.WURFLPromises = {
                init: new Promise(function (e) {
                    o.addEventListener("WurflJSInitComplete", function (t) {
                        e(t.detail)
                    }, {
                        passive: !0,
                        once: !0
                    })
                }),
                complete: new Promise(function (e) {
                    o.addEventListener("WurflJSDetectionComplete", function (t) {
                        e(t.detail)
                    }, {
                        passive: !0,
                        once: !0
                    })
                })
            }), c("WurflJSInitComplete", {
                WURFL: s.WURFL
            }), void 0 !== s.WurflJSNavigatorUAData && void 0 !== s.navigator.userAgentData && navigator.userAgentData instanceof s.WurflJSNavigatorUAData) i();
            else if ("userAgentData" in s.navigator && "getHighEntropyValues" in s.navigator.userAgentData) {
                if (d) {
                    var e = function () {
                        if (!s.localStorage) return null;
                        var t = s.localStorage.getItem("wjs-version"),
                            n = s.localStorage.getItem("wjs-expires"),
                            o = s.localStorage.getItem("wjs-ua"),
                            e = s.localStorage.getItem("wjs-data");
                        if (null === t || null === n || null === e) return null;
                        if (t !== l || o !== s.navigator.userAgent) return a(), null;
                        if (s.WURFL && !e.wurfl_id != !s.WURFL.wurfl_id) return a(), null;
                        if (parseInt(n, 10) < (new Date).getTime()) return a(), null;
                        try {
                            return JSON.parse(e)
                        } catch (e) {
                            return a(), null
                        }
                    }();
                    if (null !== e && "complete_device_name" in e && !e.complete_device_name.match(/^Generic Android$/)) return s.WURFL = e, i(), s.WURFL
                }
                "SecurityPolicyViolationEvent" in s && document.addEventListener("securitypolicyviolation", u, {
                    passive: !0
                }), h().then(function (e) {
                    s.WURFL = e
                }).catch(function (e) {
                    console.warn(e)
                }).finally(function () {
                    i()
                })
            } else i()
        }
    };
! function () {
    if (!("object" != typeof window || "__wurfljs_NORUN" in window)) {
        var e = "wurfl_debug" in window && window.wurfl_debug || "__wurfljs_DEBUG" in window && window.__wurfljs_DEBUG,
            e = new WurflJsUACHResolver(window, wurfljs_host, e);
        try {
            e.main()
        } catch (e) {
            console.error(e)
        }
    }
}()