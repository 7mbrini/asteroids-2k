"use strict";


!function() {
	if (window.avadv) {

		return;
	}
	var avadv = window.avadv = window.avadv || {
		num: 0,
		time: new Date(),
		avRichMedia: false,

		list: [],
		current: null,
		weights: {'728x90':10,'120x600':10,'300x250':10,'980x50':10,'468x60':3,'125x125':1,'120x120':1},
		noMobile: {'728x90':1,'120x600':1,'468x60':1,'125x125':1,'160x600':1,'0x0':1,'980x50':1,'6x6':1,'2x2':1},
		alias: {'980x50':'728x90'},
		keys: ['google_color_border','google_color_bg','google_color_link','google_color_url','google_color_text','google_color_features'],
		unique: (new Date()).valueOf(),
		sz: {}, ts: {}, ads: {}, ads_c: 0,
		krux: null,

		
		track: function(d) {
			if (typeof d == "number") d = avadv.list[d-1];
			if (d.tracked) return;

			d.tracked = new Date() - avadv.time;
			var f = d.iframe;

			var bb = f.getBoundingClientRect();
			d.x = Math.round(bb.left) + window.pageXOffset;
			d.y = Math.round(bb.top) + window.pageYOffset;
			if (console) console.info("avadv#%d: %s %s %dx%d", d.i, d.size, d.mode, d.x, d.y);

			d.args = [
				"av_u="+d.user,
				"avadv=1",
				"expert="+window.ADX_label,
				"avadv_cnt="+d.i,
				"ac="+d.vars.dart_z,
				"sz="+screen.width+"x"+screen.height,
			];
			for (var k in avadv.keys) if (window[avadv.keys[k]]) d.args.push(avadv.keys[k]+'='+window[avadv.keys[k]]);
			for (var k in window) if (k.search(/^avadv_\w+$/) == 0) d.args.push(k+'='+window[k]);

			f.src = "//"+d.dom+"/iframe.ad/"+d.ipc+"/x="+d.x+"/y="+d.y+"/f="+(window.parent == window.self ? 0 : 1)+"/pe=0/"+d.args.join("/");
			if (d.mode == 1) {
				f.setAttribute("width", d.w);
				f.setAttribute("height", d.h);
				f.style.width = d.w+"px";
				f.style.height = d.h+"px";
				f.style.display = "";
			}
		},

		
		iframe: function(d, u) {
			var p = { avadv: "avadv-"+d.i, marginwidth: "0", marginheight: "0", frameborder: "0", scrolling: "no", width: "0", height: "0", style: "width:0px;height:0px;border:0px;display:block" };
			if (u) {
				p.src = u;
				p.width = d.w;
				p.height = d.h
				p.style = 'width:'+d.w+'px;height:'+d.h+'px;border:0px';
			}
			var el = document.createElement("iframe");
			for (var i in p) el.setAttribute(i, p[i]);
			d.append.unshift(el);
			d.iframe = el;
		},

		
		push: function(w,h,u,o,d,i,g,m,p,a,t,e) {
			e = e || document.currentScript || (function(){


				var s = "//ad.altervista.org/js"+(m == 3 ? "2" : "")+".ad/size="+w+"X"+h+"/";
				var ss = document.scripts;
main:				for (var i = 0; i < ss.length; i++) {
					var e = ss[i];
					if (e.src.indexOf(s) == -1) continue;
					for (var j = 0; j < avadv.list.length; j++) {
						if(avadv.list[j].el == e) continue main;
					}
					return e;
				}
			})();

			var d = {
				i: ++avadv.num,
				error: false,
				w: w,
				h: h,
				x: 0,
				y: 0,
				user: u,
				ostr: o,
				dom: d,
				ipc: i,
				size: w+"x"+h,
				group: g,
				mode: m,
				tracked: null,
				ppc: !!p,
				trusted: false,
				el: e,
				iframe: null,
				append: [],
				vars: {dart_z:"circuiti",oop:false,track:true,uberTrusted:false,tag:t},
			};
			d.real = (avadv.alias[d.size] || d.size);

			avadv.list.push(d);
			avadv.current = d;

			if (!u) {
				d.error = true;
			} else if (d.mode == 3) {
				if (!avadv.ads[d.size]) {
					avadv.ads[d.size] = 1;
					++avadv.ads_c;
				}
				if (avadv.ads_c > 3) {
					d.error = true;
					avadv.iframe(d, '//it.altervista.org/adv/banner-error.html?m=016&s='+d.size.toUpperCase());
					console.info("avadv#%d: %s %s E016", d.i, d.size, d.mode);
				}
			} else {
				var sz = d.real+'_'+d.ostr;
				avadv.sz[sz] = avadv.sz[sz] || 0;
				++avadv.sz[sz];

				var ts = d.ostr;
				if (avadv.sz[sz] == 1) {
					avadv.ts[ts] = avadv.ts[ts] || 0;
					avadv.ts[ts] += (avadv.weights[d.real] || 0);
				}

				if (avadv.sz[sz] > 2) {
					d.error = true;
					avadv.iframe(d, '//it.altervista.org/adv/banner-error.html?m=012&s='+d.size.toUpperCase());
					console.info("avadv#%d: %s %s E012", d.i, d.size, d.mode);
				} else if (avadv.ts[ts] > 24) {
					d.error = true;
					avadv.ts[ts] -= avadv.weights[d.real];
					avadv.sz[sz] = undefined;
					avadv.iframe(d, '//it.altervista.org/adv/banner-error.html?m=013&s='+d.size.toUpperCase());
					console.info("avadv#%d: %s %s E013", d.i, d.size, d.mode);
				}
			}

			if (!d.error) avadv.iframe(d);

			d.displayed = documentReady.
				then(function(){return avadv.checkRules(d)}).
				then(avadv.display);
		},

		checkRules: function(d) {
			if (d.error || avadv.device == "smartphone" && avadv.noMobile[d.size]) {
				d.mode = -1;
			} else if (!d.vars.uberTrusted && d.mode != 3) {
				return getExpert().then(function(x){
					if (/BrandProtection(Soft|Hard)/.test(x)) {
						d.mode = -1;
					}
					return d;
				});
			}

			return Promise.resolve(d);
		},

		display: function(d) {
			var ret;
			for (var i = 0; i < d.append.length; i++) avadv._elementAppend(d, d.append[i]);

			if (d.mode == 0) {
				if (d.callback) ret = d.callback(d);
			} else if (d.mode == 2) {
				var gptSlotPromise = initGptSlot(d);
				ret = displayGptSlot(d);

				if (d.vars.track) {
					ret.then(function() {
						avadv.track(d);
					});
				}
			}

			if (d.mode >= 0 && d.mode != 2) {

				if (d.vars.track) avadv.track(d);
			}

			if (d.mode == -1) {
				ret = Promise.reject();
			}

			if (d.mode == 3) {
				getAdsbygoogle().then(function(adsbygoogle){
					var el = document.createElement("ins");
					el.style.display = "inline-block";
					el.style.width = d.w+"px";
					el.style.height = d.h+"px";
					el.className = "adsbygoogle";
					el.dataset.adSlot = d.vars.google_ad_slot;
					el.dataset.adClient = d.vars.google_ad_client;
					el.dataset.adHost = "pub-9280273811890686";
					el.dataset.adHostChannel = "4676317546";
					avadv._elementAppend(d, el);

					adsbygoogle.push({element: el});
				});
			}

			return ret;
		},

		setCallback: function(f) {
			avadv.list[avadv.num-1].callback = f;
		},
		pushHTML: function(s) {
			var div = document.createElement("div");
			div.innerHTML = s;
			avadv.current.append.unshift(div.firstChild);
		},
		pushScript: function(src) {
			var script = document.createElement("script");
			script.type = "text/javascript"
			script.src = src;
			avadv.current.append.unshift(script);
		},

		
		pushVars: function(v) {
			for (var i in v) avadv.current.vars[i] = v[i];
		},

		loadScript: function(src) {
			var el = document.createElement("script");
			el.src = src;
			return new Promise(function(res, rej){
				el.addEventListener("load", res);
				el.addEventListener("error", rej);
				document.head.appendChild(el);
			});
		},

		
		_elementAppend: function(item, el) {
			if (typeof item == "number") item = avadv.list[item];
			if (item.el.nextSibling) {
				item.el.parentNode.insertBefore(el, item.el.nextSibling);
			} else {
				item.el.parentNode.appendChild(el);
			}
		},

		
		device: (function() {
			var w = screen.width, h = screen.height, a = navigator.userAgent;

			var m = a.match(/\S+ \((.+?)\)/);
			var s = m[1].split(';');

			var t;
			if (s[0].search(/WindowsNT|Macintosh|X11|FreeBSD/) > -1) {
				t = 'desktop';
			} else if (s[0].search(/iPhone|iPod|Symbian|Tizen|BlackBerry|Bada|Maemo|MeeGo|S60|Series40|Series60|J2ME\/MIDP|Nintendo|WindowsMobile/) > -1) {
				t = 'smartphone';
			} else if (s[0].search(/iPad/) > -1) {
				t = 'tablet';
			} else if (s[0].search(/Android|Mobile|WindowsPhone/) > -1 || (s[0].search(/Linux/) > -1 && s[1].search(/Android/) > -1)) {
				if (s[1].search(/Table/) > -1) {
					t = 'tablet';
				} else if (s[1].search(/Mobile/) > -1) {
					t = 'smartphone';
				} else if (w < 550) {
					t = 'smartphone';
				} else if (w > 1024) {
					t = 'desktop';
				} else {
					t = 'tablet';
				}
			} else {
				t = 'desktop';
			}

			return t;
		})()
	}

	var slotItemMap = new WeakMap();
	function initGptSlot(d) {
		var sizes = d.vars.size ? [d.vars.size] : [[d.w, d.h]];
		if (d.vars.size_alt) {
			if (d.vars.size_alt[0] instanceof Array) {
				for (var j = 0; j < d.vars.size_alt.length; j++) sizes.push(d.vars.size_alt[j]);
			} else {
				sizes.push(d.vars.size_alt);
			}
		}

		var slotEl = document.createElement("div");
		slotEl.id = "avadv-gpt-"+d.i;
		avadv._elementAppend(d, slotEl);

		var gptInfo = {
			sizes:       sizes,
			adUnitPath:  "/4758/altervista/" + d.vars.dart_z,
			slotElement: slotEl,
		};
		d.gpt = gptInfo;

		gptInfo.slotPromise = getGoogletag().then(function(googletag) {
			setupGptListeners();

			var slot;
			if (d.vars.oop) {
				slot = googletag.defineOutOfPageSlot(gptInfo.adUnitPath, gptInfo.slotElement.id);
			} else {
				slot = googletag.defineSlot(gptInfo.adUnitPath, gptInfo.sizes, gptInfo.slotElement.id);
			}
			slot.addService(googletag.pubads());
			googletag.pubads().disableInitialLoad();
			googletag.enableServices();
			googletag.display(slot);

			if (d.vars.safeFrame) {
				slot.setForceSafeFrame(true);
				slot.setSafeFrameConfig(d.vars.safeFrame);
			}

			slotItemMap.set(slot, d);

			return slot;
		});

		return gptInfo.slotPromise;
	}

	function displayGptSlot(d) {
		
		var bidResultPromises = [
			d.vars.headerBidding && fetchApsBids(d.gpt),
			d.vars.headerBidding && fetchPwtBids(d.gpt),
		];

		var expertTargetingParamPromise = getExpert().then(function(expert) {
			return {ADX: expert};
		});

		return d.gpt.slotPromise.then(function(slot){
			var googletag = window.googletag;

			var targetingParamsPromises = [].concat(
				bidResultPromises.map(function(targetingParamsPromise) {
					
					return timeoutPromise(2000, targetingParamsPromise).
						catch(function() {

						});
				}),
				expertTargetingParamPromise
			);

			Promise.all(targetingParamsPromises).then(function(targetingParamsList) {
				var targetingParams = {};

				targetingParamsList.forEach(function(p) {Object_assign(targetingParams, p);});

				var urlWithoutWwwProtocol = window.location.href.replace(/^https?:\/\/(www\.)?/, "");
				var baseTargetingParams = {
					kuid:          avadv.krux.u,
					ksg:           avadv.krux.s.join(","),
					purl:          urlWithoutWwwProtocol.replace(/\?refresh|\?utm_source=Zemanta&utm_medium=referral/g, "").replace(/[/=!+*#^~;()[\]"'<>]/g, "_"),
					keywordURL:    urlWithoutWwwProtocol.split(/[-/?]/).filter(Boolean),
					avadv_special: window.avadv_special || null,
				};
				Object_assign(targetingParams, baseTargetingParams);

				slot.clearTargeting();
				slot.updateTargetingFromMap(targetingParams);
				googletag.pubads().refresh([slot]);
			});

			return new Promise(function(res, rej) {
				googletag.pubads().addEventListener("slotRenderEnded", function(e) {
					if (e.slot != slot) return;

					if (!e.isEmpty) {
						res();
					} else {
						rej();
					}
				});
			});
		});
	}

	var setupGptListeners = once(function() {
		var googletag = window.googletag;

		var slotRefreshCountMap = new WeakMap();
		googletag.pubads().addEventListener("impressionViewable", function(e) {
			var slot = e.slot;
			var d = slotItemMap.get(slot);

			if (!d || !d.vars.autoRefresh) {
				return;
			}

			var refreshCount = slotRefreshCountMap.get(slot) || 0;

			if (refreshCount >= 10) {
				return;
			}

			setTimeout(function() {
				whenVisible(d.gpt.slotElement).then(function() {
					refreshCount++;
					slotRefreshCountMap.set(slot, refreshCount);

					displayGptSlot(d);
				});
			}, 30000);
		});
	});

	var visibilityTargetCallbackMap = new Map();
	var intersectionObserver;
	if (window.IntersectionObserver) {
		intersectionObserver = IntersectionObserver && new IntersectionObserver(function(entries) {
			if (!document.hasFocus()) {
				return;
			}
			entries.forEach(function(entry) {
				if (!entry.intersectionRatio >= 0.5) {
					return;
				}

				var target = entry.target;
				var callback = visibilityTargetCallbackMap.get(target);

				intersectionObserver.unobserve(target);
				visibilityTargetCallbackMap.delete(target);

				callback && callback();
			});
		}, {threshold: [0.5]});
		window.addEventListener("blur", function(e) {
			visibilityTargetCallbackMap.forEach(function(callback, target) {
				intersectionObserver.unobserve(target);
			});
		});
		window.addEventListener("focus", function(e) {
			visibilityTargetCallbackMap.forEach(function(callback, target) {
				intersectionObserver.observe(target);
			});
		});
	}
	function whenVisible(target) {
		return new Promise(function(resolve) {
			if (!intersectionObserver) {

				return;
			}

			visibilityTargetCallbackMap.set(target, resolve);
			if (document.hasFocus()) {
				intersectionObserver.observe(target);
			}
		});
	}

	
	var Object_assign = Object.assign || function(target){
		target = Object(target);
		for (var i = 1; i < arguments.length; i++) {
			var o = arguments[i];
			if (o == null) {
				continue;
			}
			for (var p in o) {
				if (!Object.prototype.hasOwnProperty.call(o, p)) {
					continue;
				}
				target[p] = o[p];
			}
		}
	};

	function timeoutPromise(timeout, promise) {
		var p = new Promise(function(res, rej){
			var t = setTimeout(rej, timeout);
		});
		return Promise.race([promise, p]);
	}

	function once(fn) {
		var result;
		var evaluated = false;
		return function() {
			if (evaluated) {
				return result;
			}
			result = fn();
			evaluated = true;
			fn = null;
			return result;
		}
	}

	var getExpert = once(function() {
		var ADX_query = {
			key:       "69abaf6b2f7ca5773c43d4f4659194c6e187d375e984ac967929bcd50f0670bc",
			method:    "descriptor",
			filter:    "default",
			decorator: "template.altervista",
			type:      "URL",
			mode:      "async",
			body:      location.href,
			custom1:   avadv.krux.u,
		};
		var script = avadv.loadScript("//euasync01.admantx.com/admantx/service?request="+encodeURIComponent(JSON.stringify(ADX_query)));
		return timeoutPromise(2500, script).
			then(function(){return window.ADX_label},function(){return undefined});
	});

	function fetchApsBids(slotInfo) {
		return getAps().then(function(apstag) {
			return new Promise(function (res, rej) {
				apstag.fetchBids({
					slots: [{
						slotID:   slotInfo.slotElement.id,
						slotName: slotInfo.adUnitPath,
						sizes:    slotInfo.sizes,
					}],
					
					timeout: 10000,
				}, res);
			}).then(function(bidsData) {
				var targetingParams = {};
				apstag.targetingKeys().forEach(function(key) {
					targetingParams[key] = bidsData[0][key];
				});
				return targetingParams;
			});
		});
	}

	var getAps = once(function() {
		var script = avadv.loadScript("https://c.amazon-adsystem.com/aax2/apstag.js");

		return Promise.all([script, getTcfApiReady()]).
			then(function() {
				return new Promise(function(res, rej) {
					window.apstag.init({
						pubID:    "3651",
						adServer: "googletag",
					}, function(){res(window.apstag)});
				});
			});
	});

	var pwtAdUnitIndex = 0;
	function fetchPwtBids(slotInfo) {
		return getPwt().then(function(PWT) {
			return new Promise(function (res, rej) {
				PWT.requestBids([{
					code:        slotInfo.slotElement.id,
					divId:       slotInfo.slotElement.id,
					adUnitId:    slotInfo.adUnitPath,
					adUnitIndex: String(pwtAdUnitIndex),
					mediaTypes:  {
						banner: {
							sizes: slotInfo.sizes,
						},
					},
				}], res);
				pwtAdUnitIndex++;
			}).then(function(responses) {
				var targetingParams = responses[0].bidData.kvp;
				return targetingParams;
			});
		});
	}

	function getPwtProfile(profile) {
		window.PWT = window.PWT || {};

		var pwtPromise = new Promise(function(res, rej) {
			window.PWT.jsLoaded = function() {
				return res(window.PWT);
			};
		});
		var script = avadv.loadScript("//ads.pubmatic.com/AdServer/js/pwt/76492/" + profile + "/pwt.js");

		return Promise.all([script, getTcfApiReady()]).
			then(function(){return pwtPromise});
	}

	var getPwt = once(function() {
		var profile = 2220;
		if (avadv.device == "smartphone") {
			profile = 2315;
		}

		return getPwtProfile(profile);
	});

	var getGoogletag = once(function() {
		window.googletag = window.googletag || {};
		googletag.cmd = googletag.cmd || [];

		return whenGoogleAdTagLoadable().then(function() {
			avadv.loadScript("https://securepubads.g.doubleclick.net/tag/js/gpt.js");
			return new Promise(function(res,rej){
				googletag.cmd.push(function(){res(googletag)});
			});
		});
	});

	var getAdsbygoogle = once(function() {
		window.adsbygoogle = window.adsbygoogle || [];

		return whenGoogleAdTagLoadable().then(function() {
			return avadv.loadScript("//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js");
		}).then(function() {




			return window.adsbygoogle;
		});
	});

	var whenGoogleAdTagLoadable = once(function() {
		
		return hasTcfPurposeOneConsent().then(function(purposeOneConsent) {
			if (purposeOneConsent === false) {
				
				throw new Error("Unable to load Google ad tag without purpose one consent");
			}
		});
	});

	function hasTcfPurposeOneConsent() {
		return getTcfTCData().then(function(tcData){
			return Boolean(tcData.purpose.consents[1]);
		});
	}

	function getTcfTCData() {
		return getTcfApiReady().then(function() {
			return new Promise(function(res, rej) {
				window.__tcfapi("getTCData", 2, callback);
				function callback(tcData, success) {
					if (!success) {
						rej();
						return;
					}
					res(tcData);
				}
			});
		});
	}

	var getTcfApiReady = once(function() {
		return documentReady.then(function() {
			return new Promise(function(res, rej) {
				if (!isTcfApiAvailable()) {
					throw new Error("__tcfapi function missing");
				}

				window.__tcfapi("addEventListener", 2, callback);
				function callback(tcData, success) {
					if (!success) {
						rej();
						return;
					}
					if (tcData.eventStatus !== "tcloaded" && tcData.eventStatus !== "useractioncomplete") {
						return;
					}

					res();
					window.__tcfapi("removeEventListener", 2, function() {}, tcData.listenerId);
				}
			});
		});
	});

	function isTcfApiAvailable() {
		return typeof(window.__tcfapi) === "function";
	}

	var documentReady = new Promise(function(res) {
		
		if (document.readyState != "loading" && !document.documentElement.doScroll
			|| document.readyState == "complete") res();

		document.addEventListener("DOMContentLoaded", res, false);
		addEventListener("load", res, false);
	});
}();


avadv.push(728, 90, "arcadeclassics", "3792639", "st29.altervista.org", 1483750148, 88, 3, 0, 1, "");
if (avadv.num == 1) (function() {

	function krux_r(n) { var m, k = 'kx'+n; if (window.localStorage) return window.localStorage[k] || ""; if (navigator.cookieEnabled) {m = document.cookie.match(k+'=([^;]*)'); return (m && unescape(m[1])) || ""; } return ''; }

	var v = [], s;
	var u = krux_r('user');
	var segments = krux_r('segs') ? krux_r('segs').split(',') : [];
	for (var i = 0; i < segments.length; i++) v.push('ksg=' + segments[i]);
	avadv.krux = { q: "kuid="+u+";"+(v.length ? v.slice(0, 224).join(';') + ';' : ''), s: segments, u: u};

})();
var av_adsense_flag = 1;
avadv.pushVars({google_ad_client:"ca-pub-2019546325246903",google_ad_slot:"2080810474"});