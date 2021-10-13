function do_the_ads(ads_space = 450, custom_variables = {}, uam_timeout, version) {

	function getAudienceProjectTargetingData() {
		"use strict";

		var CACHE_KEY = "apr_tdc";
		try {
			var json = window.localStorage.getItem(CACHE_KEY);
			if (json) {
				var cache = JSON.parse(json);
				if (cache.exp > Date.now()) {
					return cache.d;
				}
				else {
					window.localStorage.removeItem(CACHE_KEY);
				}
			}
		}
		catch (err) {
			window.localStorage.removeItem(CACHE_KEY);
		}
		return {};
	};

	function setAPTargeting() {
		var setTargeting = function () {
			var targetingData = getAudienceProjectTargetingData();
			for (var key in targetingData) {
				if (targetingData.hasOwnProperty(key)) {
					window.googletag.pubads().setTargeting(key, targetingData[key]);
				}
			}
		};

		window.googletag = window.googletag || {};
		window.googletag.cmd = window.googletag.cmd || [];
		if (window.googletag.cmd.unshift) {
			window.googletag.cmd.unshift(setTargeting);
		}
		else {
			window.googletag.cmd.push(setTargeting);
		}
	};

	dfp_npa = 'false';
	setAPTargeting();


	runUAM = false;
	timeoutUAM = uam_timeout;

	if(typeof uam_timeout != 'undefined') {
		if(uam_timeout) {
			runUAM = true;
			timeoutUAM = uam_timeout;
			custom_variables['uam_test'] = 'uam_all_' + uam_timeout;
		}
	}

	prebid_units={hd:{USG_LB_1:{code:"/43340684/USG_LB_1",mediaTypes:{banner:{sizes:[[728,90],[970,250]]}},bids:[{bidder:"districtm",params:{placementId:"19143638"}},{bidder:"districtmDMX",params:{dmxid:19143638,memberid:514420}},{bidder:"rubicon",params:{accountId:"16622",siteId:"138970",zoneId:"650500",sizes:[2,57]}},{bidder:"sovrn",params:{tagid:"308151"}},{bidder:"sovrn",params:{tagid:"722310"}},{bidder:"pubmatic",params:{publisherId:"159481",adSlot:"3036934"}},{bidder:"conversant",params:{site_id:"110795",secure:1}},{bidder:"openx",params:{unit:"541168300",delDomain:"gamer-d.openx.net"}},{bidder:"ix",params:{siteId:"544545",size:[970,250]}},{bidder:"ix",params:{siteId:"544545",size:[728,90]}},{bidder:"brightcom",params:{publisherId:"20088"}},{bidder:"medianet",params:{cid:"8CUSVGW2K",crid:"526364472"}}]},USG_HP:{code:"/43340684/USG_HP",mediaTypes:{banner:{sizes:[[300,250],[300,600]]}},bids:[{bidder:"districtm",params:{placementId:"19143639"}},{bidder:"districtmDMX",params:{dmxid:19143639,memberid:514421}},{bidder:"rubicon",params:{accountId:"16622",siteId:"138970",zoneId:"650504",sizes:[10,15]}},{bidder:"sovrn",params:{tagid:"308150"}},{bidder:"sovrn",params:{tagid:"727523"}},{bidder:"triplelift",params:{inventoryCode:"usgamer_sidebar_prebid"}},{bidder:"pubmatic",params:{publisherId:"159481",adSlot:"3036935"}},{bidder:"conversant",params:{site_id:"110795",secure:1}},{bidder:"openx",params:{unit:"541168304",delDomain:"gamer-d.openx.net"}},{bidder:"ix",params:{siteId:"545962",size:[300,250]}},{bidder:"ix",params:{siteId:"545962",size:[300,600]}},{bidder:"brightcom",params:{publisherId:"20088"}},{bidder:"medianet",params:{cid:"8CUSVGW2K",crid:"364068531"}}]},USG_LB_2:{code:"/43340684/USG_LB_2",mediaTypes:{banner:{sizes:[[728,90],[970,250]]}},bids:[{bidder:"districtm",params:{placementId:"19143640"}},{bidder:"districtmDMX",params:{dmxid:19143640,memberid:514422}},{bidder:"rubicon",params:{accountId:"16622",siteId:"138970",zoneId:"650500",sizes:[2,57]}},{bidder:"sovrn",params:{tagid:"308151"}},{bidder:"sovrn",params:{tagid:"722310"}},{bidder:"pubmatic",params:{publisherId:"159481",adSlot:"3036934"}},{bidder:"conversant",params:{site_id:"110795",secure:1}},{bidder:"openx",params:{unit:"541168287",delDomain:"gamer-d.openx.net"}},{bidder:"ix",params:{siteId:"545965",size:[970,250]}},{bidder:"ix",params:{siteId:"545965",size:[728,90]}},{bidder:"brightcom",params:{publisherId:"20088"}},{bidder:"medianet",params:{cid:"8CUSVGW2K",crid:"137907487"}}]},USG_LEADERBOARD_LAST:{code:"/43340684/USG_LEADERBOARD_LAST",mediaTypes:{banner:{sizes:[[728,90],[970,250]]}},bids:[{bidder:"districtm",params:{placementId:"19143640"}},{bidder:"districtmDMX",params:{dmxid:19143640,memberid:514422}},{bidder:"rubicon",params:{accountId:"16622",siteId:"138970",zoneId:"650500",sizes:[2,57]}},{bidder:"sovrn",params:{tagid:"308151"}},{bidder:"sovrn",params:{tagid:"722310"}},{bidder:"pubmatic",params:{publisherId:"159481",adSlot:"3036934"}},{bidder:"conversant",params:{site_id:"110795",secure:1}},{bidder:"openx",params:{unit:"541168285",delDomain:"gamer-d.openx.net"}},{bidder:"ix",params:{siteId:"545965",size:[970,250]}},{bidder:"ix",params:{siteId:"545965",size:[728,90]}},{bidder:"brightcom",params:{publisherId:"20088"}},{bidder:"medianet",params:{cid:"8CUSVGW2K",crid:"713783925"}}]},USG_Lazy_Load_HP_MPU:{code:"/43340684/USG_Lazy_Load_HP_MPU",mediaTypes:{banner:{sizes:[[300,250],[300,600]]}},bids:[{bidder:"districtm",params:{placementId:"19143641"}},{bidder:"districtmDMX",params:{dmxid:19143641,memberid:514423}},{bidder:"rubicon",params:{accountId:"16622",siteId:"138970",zoneId:"650504",sizes:[10,15]}},{bidder:"sovrn",params:{tagid:"308150"}},{bidder:"sovrn",params:{tagid:"727523"}},{bidder:"triplelift",params:{inventoryCode:"usgamer_sidebar_prebid"}},{bidder:"pubmatic",params:{publisherId:"159481",adSlot:"3036935"}},{bidder:"conversant",params:{site_id:"110795",secure:1}},{bidder:"openx",params:{unit:"541168292",delDomain:"gamer-d.openx.net"}},{bidder:"ix",params:{siteId:"545964",size:[300,250]}},{bidder:"ix",params:{siteId:"545964",size:[300,600]}},{bidder:"brightcom",params:{publisherId:"20088"}},{bidder:"medianet",params:{cid:"8CUSVGW2K",crid:"359674724"}}]}},tablet:{USG_LB_1:{code:"/43340684/USG_LB_1",mediaTypes:{banner:{sizes:[[728,90]]}},bids:[{bidder:"districtm",params:{placementId:"19143638"}},{bidder:"districtmDMX",params:{dmxid:19143638,memberid:514420}},{bidder:"rubicon",params:{accountId:"16622",siteId:"138970",zoneId:"650500",sizes:[2]}},{bidder:"sovrn",params:{tagid:"308151"}},{bidder:"conversant",params:{site_id:"110795",secure:1}},{bidder:"openx",params:{unit:"541168304",delDomain:"gamer-d.openx.net"}},{bidder:"ix",params:{siteId:"545962",size:[300,250]}},{bidder:"ix",params:{siteId:"545962",size:[300,600]}},{bidder:"brightcom",params:{publisherId:"20088"}}]},USG_LB_2:{code:"/43340684/USG_LB_2",mediaTypes:{banner:{sizes:[[728,90]]}},bids:[{bidder:"districtm",params:{placementId:"19143640"}},{bidder:"districtmDMX",params:{dmxid:19143640,memberid:514422}},{bidder:"rubicon",params:{accountId:"16622",siteId:"138970",zoneId:"650500",sizes:[2]}},{bidder:"sovrn",params:{tagid:"308151"}},{bidder:"conversant",params:{site_id:"110795",secure:1}},{bidder:"openx",params:{unit:"541168287",delDomain:"gamer-d.openx.net"}},{bidder:"ix",params:{siteId:"545965",size:[970,250]}},{bidder:"ix",params:{siteId:"545965",size:[728,90]}},{bidder:"brightcom",params:{publisherId:"20088"}}]},USG_MPU_MOB:{code:"/43340684/USG_MPU_MOB",mediaTypes:{banner:{sizes:[[300,250],[320,400]]}},bids:[{bidder:"districtm",params:{placementId:"19143641"}},{bidder:"districtmDMX",params:{dmxid:19143641,memberid:514423}},{bidder:"rubicon",params:{accountId:"16622",siteId:"138970",zoneId:"650510",sizes:[15]}},{bidder:"sovrn",params:{tagid:"308150"}},{bidder:"triplelift",params:{inventoryCode:"usgamer_sidebar_prebid"}},{bidder:"pubmatic",params:{publisherId:"159481",adSlot:"3036936"}},{bidder:"conversant",params:{site_id:"110795",secure:1}},{bidder:"openx",params:{unit:"541168293",delDomain:"gamer-d.openx.net"}},{bidder:"ix",params:{siteId:"545966",size:[300,250]}},{bidder:"brightcom",params:{publisherId:"20088"}},{bidder:"medianet",params:{cid:"8CUSVGW2K",crid:"334842374"}}]},USG_Lazy_Load_HP_MPU:{code:"/43340684/USG_Lazy_Load_HP_MPU",mediaTypes:{banner:{sizes:[[300,250]]}},bids:[{bidder:"districtm",params:{placementId:"19143641"}},{bidder:"districtmDMX",params:{dmxid:19143641,memberid:514423}},{bidder:"rubicon",params:{accountId:"16622",siteId:"138970",zoneId:"650510",sizes:[15]}},{bidder:"sovrn",params:{tagid:"308150"}},{bidder:"triplelift",params:{inventoryCode:"usgamer_sidebar_prebid"}},{bidder:"pubmatic",params:{publisherId:"159481",adSlot:"3036935"}},{bidder:"conversant",params:{site_id:"110795",secure:1}},{bidder:"openx",params:{unit:"541168292",delDomain:"gamer-d.openx.net"}},{bidder:"ix",params:{siteId:"545966",size:[300,250]}},{bidder:"brightcom",params:{publisherId:"20088"}},{bidder:"medianet",params:{cid:"8CUSVGW2K",crid:"866268511"}}]}},mobile:{USG_MPU_MOB:{code:"/43340684/USG_MPU_MOB",mediaTypes:{banner:{sizes:[[300,250],[320,400]]}},bids:[{bidder:"districtm",params:{placementId:"19143641"}},{bidder:"districtmDMX",params:{dmxid:19143641,memberid:514423}},{bidder:"rubicon",params:{accountId:"16622",siteId:"138970",zoneId:"650510",sizes:[15]}},{bidder:"sovrn",params:{tagid:"308150"}},{bidder:"triplelift",params:{inventoryCode:"usgamer_sidebar_prebid"}},{bidder:"pubmatic",params:{publisherId:"159481",adSlot:"3036936"}},{bidder:"conversant",params:{site_id:"110795",secure:1}},{bidder:"openx",params:{unit:"541168293",delDomain:"gamer-d.openx.net"}},{bidder:"ix",params:{siteId:"545966",size:[300,250]}},{bidder:"brightcom",params:{publisherId:"20088"}},{bidder:"medianet",params:{cid:"8CUSVGW2K",crid:"334842374"}}]},USG_Lazy_Load_HP_MPU:{code:"/43340684/USG_Lazy_Load_HP_MPU",mediaTypes:{banner:{sizes:[[300,250]]}},bids:[{bidder:"districtm",params:{placementId:"19143641"}},{bidder:"districtmDMX",params:{dmxid:19143641,memberid:514423}},{bidder:"rubicon",params:{accountId:"16622",siteId:"138970",zoneId:"650510",sizes:[15]}},{bidder:"sovrn",params:{tagid:"308150"}},{bidder:"triplelift",params:{inventoryCode:"usgamer_sidebar_prebid"}},{bidder:"pubmatic",params:{publisherId:"159481",adSlot:"3036935"}},{bidder:"conversant",params:{site_id:"110795",secure:1}},{bidder:"openx",params:{unit:"541168292",delDomain:"gamer-d.openx.net"}},{bidder:"ix",params:{siteId:"545966",size:[300,250]}},{bidder:"brightcom",params:{publisherId:"20088"}},{bidder:"medianet",params:{cid:"8CUSVGW2K",crid:"866268511"}}]},USG_STICKY_LB:{code:"/43340684/USG_STICKY_LB",mediaTypes:{banner:{sizes:[[320,50]]}},bids:[{bidder:"districtm",params:{placementId:"19143642"}},{bidder:"districtmDMX",params:{dmxid:19143642,memberid:514424}},{bidder:"rubicon",params:{accountId:"16622",siteId:"138970",zoneId:"1771892",sizes:[43]}},{bidder:"pubmatic",params:{publisherId:"159481",adSlot:"3036937"}},{bidder:"conversant",params:{site_id:"110795",secure:1}},{bidder:"openx",params:{unit:"541168292",delDomain:"gamer-d.openx.net"}},{bidder:"ix",params:{siteId:"545967",size:[320,50]}},{bidder:"brightcom",params:{publisherId:"20088"}},{bidder:"medianet",params:{cid:"8CUSVGW2K",crid:"131851077"}}]},USG_MPU_LAST:{code:"/43340684/USG_MPU_LAST",mediaTypes:{banner:{sizes:[[300,250]]}},bids:[{bidder:"districtm",params:{placementId:"19143641"}},{bidder:"districtmDMX",params:{dmxid:19143641,memberid:514423}},{bidder:"rubicon",params:{accountId:"16622",siteId:"138970",zoneId:"650510",sizes:[15]}},{bidder:"sovrn",params:{tagid:"308150"}},{bidder:"triplelift",params:{inventoryCode:"usgamer_sidebar_prebid"}},{bidder:"pubmatic",params:{publisherId:"159481",adSlot:"3036936"}},{bidder:"conversant",params:{site_id:"110795",secure:1}},{bidder:"openx",params:{unit:"541168296",delDomain:"gamer-d.openx.net"}},{bidder:"ix",params:{siteId:"545966",size:[300,250]}},{bidder:"brightcom",params:{publisherId:"20088"}},{bidder:"medianet",params:{cid:"8CUSVGW2K",crid:"866268511"}}]},USG_MPU_FEED:{code:"/43340684/USG_MPU_FEED",mediaTypes:{banner:{sizes:[[300,250]]}},bids:[{bidder:"districtm",params:{placementId:"19143641"}},{bidder:"districtmDMX",params:{dmxid:19143641,memberid:514423}},{bidder:"rubicon",params:{accountId:"16622",siteId:"138970",zoneId:"650510",sizes:[15]}},{bidder:"sovrn",params:{tagid:"308150"}},{bidder:"triplelift",params:{inventoryCode:"usgamer_sidebar_prebid"}},{bidder:"pubmatic",params:{publisherId:"159481",adSlot:"3036936"}},{bidder:"conversant",params:{site_id:"110795",secure:1}},{bidder:"openx",params:{unit:"541168299",delDomain:"gamer-d.openx.net"}},{bidder:"ix",params:{siteId:"545966",size:[300,250]}},{bidder:"brightcom",params:{publisherId:"20088"}},{bidder:"medianet",params:{cid:"8CUSVGW2K",crid:"866268511"}}]}}};
	

	try {
		window.AdScript = new GNAdScript('.advert', {
			custom_variables: custom_variables,
			lazyload_spacer: ads_space,
			device: version,
			insertInto : '',
			runUAM: true,
			runPrebid: true,
			prebidLib: '/static/scripts/prebid4.30.0.js',
			prebidConfig: prebid_units,
			showNonPersonalisedAds: false,
			adRenderedCallback: function(slotName, event) {
				if (event.isEmpty) {
					const ad = document.getElementById(slotName);
					if (ad.dataset.dfpCollapse == 'true') {
						if(ad.parentNode.classList.contains('collapsible')) {
							ad.parentNode.style.display = 'none';
						}
						if(ad.parentNode.parentNode.classList.contains('collapsible')) {
							ad.parentNode.parentNode.style.display = 'none';
						}
					}
				}

				if(slotName.includes('STICKY_LB')) {
					if(!event.isEmpty) {
						document.getElementById('sticky_leader_close').style.display = 'block';
						document.getElementById('sticky_leaderboard').style.paddingTop = '4px';
						document.querySelector('.footer').style.paddingBottom = '90px';
					}
				}
			}
		});
		window.AdScript.init();
	} catch(e) {
	}

	if(!custom_variables['ad_policies']) {

		if(dfp_npa == 'true') {
			(adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds=1;
		} else {
			(adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds=0;
		}
		window.adsbygoogle.push({});

	}

}