window['mormontConfig'] = {
  "endpoint_register": "//mormont.gamer-network.net/api/measurement/v2/register_pageview",
  "endpoint_update": "//mormont.gamer-network.net/api/measurement/v2/update_pageview",
  "endpoint_event": "//mormont.gamer-network.net/api/measurement/v2/event",
  'endpoint_recommendations': "//mormont.gamer-network.net/api/reporting/v1/content_recommendation",
  "update_wait": 2000,
  "scroll_wait": 250,
  'max_rec_links': 1,
  'max_containers': 1,
  'container_separation': 5,
  'size_breakpoint': 1000,
  'minimum_word_count': 275,
  'minimum_paragraphs': 5,
  'word_count_limits': {
    500: 1,
    2000: 2,
    4000: 3,
  },
  'script_path': document.currentScript.src,
  'ab-test-custom-dimension': 'dimension9',
  'ab-test-group': '',
  'ab-test-id': 'ab-test-003',
  'ab-test-groups': ['normal', 'float-left', 'float-right'],
  'ab-test-device-target': 'mobile',
  'ab-test-running': false,
  'ab-test-ga-checks': 0,
  'event_blocking': !((navigator) && (navigator.sendBeacon)),
};

// The pageview that we are setting up
window['mormontPageview'] = {
  "url": window.location.href.split("#")[0],
};

if (document.referrer) {
  window['mormontPageview']['referrer_url'] = document.referrer;
}

document.addEventListener('scroll', function (e) {
  throttleCallback(window['mormontConfig']['scroll_wait'], 'mormontScroll', function() {
    updateViewedRecs();
  });
});

function updatePageview(key, value) {
  mormont('set', key, value);

  if (window['mormontPageview']['pageview_id'] == undefined) {
    console.error('Cannot update pageview data, no pageview id exists');
    return;
  }

  throttleCallback(window['mormontConfig']['update_wait'], 'mormontUpdate', function() {
    sendPageview('endpoint_update');
  });
}

/*
 * Set a mormont multi-value field, given a key and a value.
 */
function setMormontMultiValue(key, value) {
  var valueConcat = value.join('||');
  window['mormontPageview'][key] = valueConcat;
}

/*
 * Get an encoded querystring representing this assoc array.
 */
function getQuerystring(obj) {
  var str = [];
  for(var p in obj)
  if (obj.hasOwnProperty(p)) {
    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  }
  return str.join("&");
}

/*
 * Send the pageview to the analytics API.
 */
function sendPageview(endpoint) {
  endpoint = endpoint || "endpoint_register";

  var params = getQuerystring(window['mormontPageview']);

  var url = window['mormontConfig'][endpoint] + '?' + params;
  var track = new XMLHttpRequest();
  track.onreadystatechange = function() {
      try {
          var data = JSON.parse(track.responseText);
          if (data['pageview_id']) {
              window['mormontPageview']['pageview_id'] = data['pageview_id'];
              updateViewedRecs();
          }
          if (data['session_id']) {
              window['mormontPageview']['session_id'] = data['session_id'];
          }
      } catch (err) {
          // Response may not be valid JSON, in which case ignore it
          if (err.name !== 'SyntaxError') {
              throw err;
          }
      }
  };
  track.open(
    "GET",
    url,
    true
  );
  // Sets cross-origin requests to send cookies
  track.withCredentials = true;
  if (window['mormontConfig']['auth64'] || window['mormontConfig']['auth']) {
      var auth = window['mormontConfig']['auth64'] ? window['mormontConfig']['auth64'] : btoa(window['mormontConfig']['auth']);
      track.setRequestHeader('Authorization', 'Basic ' + auth);
  }

  track.send();
}

/*
 * Log an event for the current pageview through mormont's event API.
 * 
 * Params:
 *  - `eventData` - object with keys "category", "action", "value" and optionally
 *    "label".  Note: "label" will be truncated to 1000 characters
 *  - `callback` - optional callable which should be called once the request
 *    has been made.  In the case where a blocking call is necessary (browsers
 *    which do not support navigator.sendBeacon), the callback is called after
 *    the API request has been made or has timed out.
 */
function logEvent(eventData, callback) {
  if (!callback) {
    callback = function () {};
  }
  try {
    var url = window['mormontConfig']['endpoint_event'];
    if (!eventData['action']) {
      throw 'Event cannot be logged without an "action" attribute';
    }
    if (!eventData['category']) {
      throw 'Event cannot be logged without a "category" attribute';
    }
    if (!eventData['value']) {
      throw 'Event cannot be logged without a "value" attribute';
    }
    var pageview_id = window['mormontPageview']['pageview_id'];
    if (!pageview_id) {
      throw 'Event cannot be logged for an undefined "pageview_id".  Have you tracked a pageview yet?';
    }
    var postData = {
      "pageview_id": window['mormontPageview']['pageview_id'],
      "event_action": eventData['action'],
      "event_category": eventData['category'],
      "event_value": eventData['value'],
    };
    if (eventData['label']) {
      postData['event_label'] = eventData['label'].slice(0, 1000);
    }
    if (eventData['source']) {
      postData['event_source'] = eventData['source'].slice(0, 256);
    }
    var postForm = new FormData();

    for (var key in postData) {
      if(!postData.hasOwnProperty(key)) continue;
      postForm.append(key, postData[key]);
    }

    // If we don't have navigator.sendBeacon available, we need to fallback to
    // using xmlhttprequest
    if (window['mormontConfig']['event_blocking']) {
      sendAsync(url, postForm, callback);
    }
    else {
      navigator.sendBeacon(url, postForm);
      callback();
    }
  }
  catch (e) {
    callback();
    throw(e);
  }
}

/*
 * Single point of manipulation of mormont analytics.
 *
 * Usage:
 *  mormont('set', 'language', 'en'); // set a dimension on the pageview
 *  mormont('configure', 'endpoint', '// path.to.endpoint/api/url'); //configure moromont.js
 *  mormont('send', 'pageview'); // trigger a send of the pageview
 *
 */
function mormont(action, key, value) {
  if (action == 'set') {
      if (Array.isArray(value)) {
        setMormontMultiValue(key, value);
      } else {
        window['mormontPageview'][key] = value;
    }
  }
  if (action == 'configure') {
    // This is to preserve BC, and should be removed in V3
    if (key == 'endpoint') {
        key = 'endpoint_register';
    }
    window['mormontConfig'][key] = value;
  }
  if (action == 'send') {
    if (key == 'pageview') {
      sendPageview('endpoint_register');
    } else if (key == 'update_pageview') {
      sendPageview('endpoint_update');
    }
  }

  if(action == 'fetchRecommendations') {
    if(window['mormontConfig']['ab-test-running']) {
      initABTests();
    } else {
      getMormontRecommendations();
    }
  }

  if (action == 'trackClicks') {
    setupClickTrackingForSelectors(key);
  }

  if (action == 'event') {
    logEvent(key, value);
  }
}

function initABTests() {

  // Before we do anything, we need ga() to be available
  if(typeof ga !== 'function') {

    //console.log("[mormont] Waiting for ga()");

    if(window['mormontConfig']['ab-test-ga-checks'] > 4) {
      // Give up waiting for GA and skip AB tests
      //console.log("[mormont] Skipping AB tests");
      getMormontRecommendations();

    } else {
      window['mormontConfig']['ab-test-ga-checks']++;
      window.setTimeout(initABTests, 1000);
    }

  } else {
    //console.log("[mormont] ga() loaded -- assigning user to test group");
    assignUserToTestGroup();
    getMormontRecommendations();
  }
}

function assignUserToTestGroup() {

  //console.log("[mormont] Device type: '" + mormontGetDeviceType() + "'");

  // Skip the test if ab-test-device is set and it doesn't match the current device
  if(
    window['mormontConfig']['ab-test-device-target'] &&
    window['mormontConfig']['ab-test-device-target'] != mormontGetDeviceType()
  ) {
    //console.log("[mormont] A/B not running due to device mismatch. Got '" + mormontGetDeviceType() + "', need '" + window['mormontConfig']['ab-test-device-target'] + "' to run.");
    return;
  }

  var id = window['mormontConfig']['ab-test-id'];
  var groups = window['mormontConfig']['ab-test-groups'];

  if(mormontReadCookie("mormont-" + id)) {
    var group = mormontReadCookie("mormont-" + id);
  } else {
    var group = groups[Math.floor(Math.random() * groups.length)];
    mormontCreateCookie("mormont-" + id, group, 14);
  }

  var dimension = window['mormontConfig']['ab-test-custom-dimension'];

  var key = [id, group].join("-");
  window['mormontConfig']['ab-test-group'] = key;

  // Set Analytics dimension for the AB test
  ga('set', dimension, key);
}

function getMormontRecommendations() {

  var params = "?";
  if(window['mormontConfig']['recommendations_site']) {
    params += "site=" + window['mormontConfig']['recommendations_site'] + "&";
  }
  params += getQuerystring(window['mormontPageview']);
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() { processMormontRecommendations(this) };
  xhttp.open(
    "GET",
    window['mormontConfig']['endpoint_recommendations'] + params,
    true
  );

  // Sets cross-origin requests to send cookies
  xhttp.withCredentials = true;
  if (window['mormontConfig']['auth64'] || window['mormontConfig']['auth']) {
      var auth = window['mormontConfig']['auth64'] ? window['mormontConfig']['auth64'] : btoa(window['mormontConfig']['auth']);
      xhttp.setRequestHeader('Authorization', 'Basic ' + auth);
  }

  xhttp.send();
}

function processMormontRecommendations(request) {
  if(request.readyState == 4 && request.status == 200 && window['mormontConfig']['render_recommendations'] == true) {
    var recommendations = JSON.parse(request.responseText);

    // Remove duplicates from recommendations
    var used = [];
    var clean = [];

    // Check for duplicated titles
    for (var k = 0; k < recommendations.recommendations.length; ++k) {
      var rtitle = recommendations.recommendations[k].title;
      var rec = recommendations.recommendations[k];
      var uidx = used.indexOf(rtitle);
      if (uidx == -1) {
        clean.push(rec);
        used.push(rtitle); // Title has been used
      }
    }

    recommendations.recommendations = clean;
    insertMormontRecommendations(recommendations);
  }
};

function updateViewedRecs() {
  var links = document.querySelectorAll('div.mormont-recommendation a.mormont-url');
  var recs = window['mormontPageview']['recommendation_impressions'];

  if (recs == undefined) {
    recs = [];
  } else {
    recs = recs.split('||');
  }

  var count = recs.length;

  for (var i = 0; i < links.length; i++) {
    var link = links[i];

    if (recs.indexOf(link.href) > -1) {
      // Recommendation has already been added to pageview
      continue;
    }
    var box = link.getBoundingClientRect();
    var visible = (
      box.top >= 0 &&
      box.left >= 0 &&
      box.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      box.right <= (window.innerWidth || document.documentElement.clientWidth)
    );

    if (visible) {
      recs.push(link.href);
    }
  }

  if (recs.length != count) {
    // If there are new recommendation impressions, update the pageview
    updatePageview('recommendation_impressions', recs);
  }
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function injectCSS() {

  var link  = document.createElement('link');
  link.rel  = 'stylesheet';
  link.type = 'text/css';
  link.href = window['mormontConfig']['script_path'].replace(".js", ".css");

  document.getElementsByTagName('head')[0].appendChild(link);
}

function filterRecommendations(recs) {

  // Unset any recommendations that match the current URL
  var original = document.createElement('a');
  original.href = window['mormontPageview']['url'];
  var originalURL = original.hostname + original.pathname;
  if (window['mormontConfig']['recommendations_site']) {
    originalURL = window['mormontConfig']['recommendations_site'] + original.pathname;
  }

  for(i = 0; i < recs.recommendations.length; i++) {
    var rec = recs.recommendations[i];

    var current = document.createElement('a');
    current.href = rec.url;
    var currentURL = current.hostname + current.pathname;

    if(currentURL == originalURL) {
      recs.recommendations.splice(i, 1);
    }
  }

  // Make cleaned Mormont recs available for all!
  window.allMormontRecommendations = recs.recommendations;

  return recs;
}

function insertMormontRecommendations(recs) {

  // Got anything to inject?
  if(recs.success == false || recs.recommendations.length == 0) {
    return;
  }

  // Reverse the order of the recommendations  & remove ones that
  // match the current URL
  recs = filterRecommendations(recs);

  // Inject stylesheet
  injectCSS();

  var paragraphs = document.querySelectorAll(" \
    " + window['mormontConfig']['selector'] + " > p, \
    " + window['mormontConfig']['selector'] + " section > p \
  ");

  // check the contents of each paragraph and discard any that contain images
  // or other non-text nodes
  filtered_paragraphs = [];
  for (i = 0; i < paragraphs.length; i++) {
    p = paragraphs[i];
    images = p.getElementsByTagName("img");
    if (images.length > 0) {
      // discard
    } else {
      filtered_paragraphs.push(p);
    }
  }

  paragraphs = filtered_paragraphs;
  var wordcount = getWordCount(paragraphs);

  // Don't do anything if the article doesn't meet the minimum word count
  if(wordcount < window['mormontConfig']['minimum_word_count']) return;

  // Don't do anything if the article doesn't have enough paragraphs
  if(paragraphs.length < window['mormontConfig']['minimum_paragraphs']) return;

  // No recommendations should show up in last two paragraphs.
  var pLength = paragraphs.length - 2;
  var maxContainers = calculateMaxContainers(pLength, wordcount);
  var maxLinks = calculateMaxLinks(maxContainers, recs.recommendations);

  // Number of containers should not be greater than the maximum number of links
  if (maxContainers > maxLinks) {
    maxContainers = maxLinks;
  }

  var separation = Math.floor(pLength / maxContainers);
  var linksPerContainer = Math.floor(maxLinks / maxContainers);
  var remainder = maxLinks % maxContainers;
  var unchanged = maxContainers - remainder;
  var offset = 0;
  var size = wordcount > window['mormontConfig']['size_breakpoint'] ? 'large' : 'small';

  for (var i = 1; i < maxContainers; i++) {
    // Distribute remainder amongst last few containers
    var limit = i > unchanged ? linksPerContainer + 1 : linksPerContainer;
    var attemptedSlot = separation * i;
    var slot = findAGoodSlot(attemptedSlot, paragraphs);
    if (!slot) {
      continue;
    }
    insertMormontRecommendation(paragraphs, recs.recommendations, offset, limit, size, slot);
    offset += limit;
  }

  var lastSlot = findAGoodSlot(pLength, paragraphs);
  var lastLimit = maxContainers > unchanged ? linksPerContainer + 1 : linksPerContainer;

  if (lastSlot) {
    insertMormontRecommendation(paragraphs, recs.recommendations, offset, lastLimit, size, lastSlot);
    offset += lastLimit;
  }

  if (!offset) {
    var lastChance = findAGoodSlot(pLength, paragraphs, 20);
    if (lastChance) {
      insertMormontRecommendation(paragraphs, recs.recommendations, offset, lastLimit, size, lastChance);
    }
  }

  bindLinkBudgetPromotions();

  if (window['mormontPageview']['pageview_id']) {
    updateViewedRecs();
  }
}

function insertMormontRecommendation(paragraphs, recommendations, offset, limit, size, slot) {
  var container = generateMormontContainer(recommendations, offset, limit, size);
  var target = paragraphs[slot];
  target.parentNode.insertBefore(container, target);
}

function bindLinkBudgetPromotions() {
  // Find any "Link Budget" links and fold them in to the nearest recommendations block
  var links = document.querySelectorAll(window['mormontConfig']['selector'] + " .link a");
  var blocks = document.querySelectorAll(window['mormontConfig']['selector'] + " .mormont-recommendations > div");

  if(blocks.length > 0) {

    for(i = 0; i < links.length; i++) {
      var block = blocks[i] ? blocks[i] : blocks[0];
      var link = links[i];
      var linkContainer = link.parentNode;
      var html = generateMormontItem({ url: link.href, title: link.innerHTML }, 'small');
      linkContainer.parentNode.removeChild(linkContainer);
      block.innerHTML += html;
    }
  }
}

function calculateMaxContainers(pLength, wordcount) {
  var calculatedMaxContainers = Math.floor(pLength / window['mormontConfig']['container_separation']);

  // Number of containers should accomadate for how much they should be spaced out
  var maxContainers = calculatedMaxContainers < window['mormontConfig']['max_containers'] ?
    calculatedMaxContainers :
    window['mormontConfig']['max_containers']
  ;

  // Allow for one container to appear
  if (maxContainers == 0) {
    maxContainers = 1;
  }

  for (var wordLimit in window['mormontConfig']['word_count_limits']) {
    var containerLimit = window['mormontConfig']['word_count_limits'][wordLimit];
    if (wordcount <= wordLimit && maxContainers > containerLimit) {
      maxContainers = window['mormontConfig']['word_count_limits'][wordLimit];
      break;
    }
  }

  return maxContainers;
}

function calculateMaxLinks(maxContainers, recommendations) {
  // Number of links should be less than the number of available recommendations
  var maxLinks = window['mormontConfig']['max_rec_links'] < recommendations.length ?
    window['mormontConfig']['max_rec_links'] :
    recommendations.length
  ;

  // Number of links should be relative to the number of containers calculated vs the number configured
  maxLinks = Math.floor(maxLinks * (maxContainers / window['mormontConfig']['max_containers']));

  // Max links should be at least 1
  return maxLinks ? maxLinks : 1;
}

function findAGoodSlot(slot, paragraphs, wordLimit) {
  if (wordLimit == undefined) {
    wordLimit = 120;
  }
  // Find a slot between two paragraphs where the latter is a decent length
  for (var i = slot; i > 0; i--) {
    var p = paragraphs[i];

    if ((!p.previousElementSibling) || (!p.nextElementSibling)) {
      return false;
    }

    var wordsAfter = 0;
    var currentElem = p;
    // Go through all paras following the candidate paragraph, and ensure that
    // the number of words after the slot insertion will be enough to give the floated
    // recs room next to the article text
    while (currentElem && currentElem.nodeName == "P") {
      wordsAfter += currentElem.innerHTML.split(" ").length;
      currentElem = currentElem.nextElementSibling;
      if (wordsAfter >= wordLimit) {
        break;
      }
    }
    var thisIsAFineSlot = (
      p.previousElementSibling.nodeName == "P" && // The preceeding tag is a paragraph
      p.nextElementSibling.getElementsByTagName('img').length == 0 &&
      wordsAfter >= wordLimit && // The paragraph is long enough
      i > window['mormontConfig']['container_separation'] // The paragraph is not too close to the start of the article
    );

    if (thisIsAFineSlot) {
      return i;
    }
  }

  return false;
}

function getWordCount(paragraphs) {
  var wordcount = 0;
  for(i = 0; i < paragraphs.length; i++) {
    var p = paragraphs[i];
    if(p.nodeName == "P") {
      wordcount += p.innerHTML.split(" ").length;
    }
  }
  return wordcount;
}

function generateMormontContainer(recs, offset, limit, size) {
  var container = document.createElement("div");
  var label = window['mormontConfig']['label'];
  var device = mormontGetDeviceType();
  container.className = "mormont-recommendations " + size + " " + device + " " + window['mormontConfig']['property'] + " " + (window['mormontConfig']['ab-test-group'] ? window['mormontConfig']['ab-test-id'] + " " + window['mormontConfig']['ab-test-group'] : '');

  if (Array.isArray(label)) {
    label = label[Math.floor(Math.random() * label.length)];
  }

  var html = '<div>';
    html += '<p class="section-title">' + label + '</p>';
    for(i = offset; i < (offset+limit); i++) {
      html += generateMormontItem(recs[i], size)
    }
  html += '</div>';

  container.innerHTML = html;

  return container;
}

function generateMormontItem(r, size) {

  html = '';

  if(r) {
    r.url = r.url.replace(/utm_medium=inline[\&|$]/, function(match) {
      return 'utm_medium=inline_' + (size == 'large' ? 'image' : 'text') + (window['mormontConfig']['ab-test-group'] ? "_" + window['mormontConfig']['ab-test-group'] : '') + '&';
    }).replace(/\&$/, '');

    r.strapline = r.strapline.length > 120 ? r.strapline.substr(0, 120).trim() + "&hellip;" : r.strapline;

    html+= "<div class='mormont-recommendation " + size + "'>";

    if(size == 'large') {
      if(r.image) {
        r.image = proccessMormontImage(r.image);
        html+= "<a href='" + r.url + "' class='cover' style='background-image:url(" + r.image + ");'></a>";
      }
    }
    
    html+= "<p class='title'>";
      html+= (size == 'small' ? ":: " : "") + "<a class='mormont-url' href='" + r.url + "'>" + r.title + "</a>";
    html+= "</p>";

    if(size == 'large') {
      html+= "<p class='strapline'>" + r.strapline + "</p>";
    }

    html+= "</div>";
  }

  return html;
}

function proccessMormontImage(img) {

  // If image is from cdn.gn or images.eg, strip EG11 params and add our own

  if(img.match(/cdn\.gamer-network\.net|images\.eurogamer\.net/)) {

    var parts = img.split("/EG11");
    var original = parts[0];
    original = original.replace("http://", "https://");
    original = original.replace("images.eurogamer.net", "cdn.gamer-network.net");

    return original + "/EG11/thumbnail/540x540/format/jpg/quality/75";
  }

  return img;
}

/**
 * Manage how often a callback can be run, and schedule if it has been run too
 * recently
 *
 * Args:
 *   - `time`     - Minimum number of milliseconds between calls
 *   - `name`     - Unique name of callback
 *   - `callback` - Callback to run
 */
function throttleCallback(time, name, callback) {
  var lockKey = name + 'Lock';
  var timeKey = name + 'Time';
  var unlockTime = window[timeKey] == undefined ? 0 : window[timeKey];
  var locked = window[lockKey] == undefined ? false : window[lockKey];

  if (locked) {
    // Callback is already scheduled, so it doesn't need to run again
    return;
  }

  var cb = function() {
    callback();
    window[timeKey] = Date.now() + time;
    window[lockKey] = false;
  }

  if (!locked && unlockTime > Date.now()) {
    // The callback is not scheduled, but not enough time has passed since the last
    // time it was called, so schedule the callback to run when enough time has passed.
    window[lockKey] = true;
    timeout = unlockTime - Date.now();
    setTimeout(cb, timeout);
  } else {
    // There is no reason not to call the callback now
    cb();
  }
}

function mormontCreateCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
    return value;
}

function mormontReadCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function mormontEraseCookie(name) {
    mormontCreateCookie(name,"",-1);
}

function mormontGetDeviceType() {

  var a = navigator.userAgent || navigator.vendor || window.opera;

  if(
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)
    ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))
  ) {
    return "mobile";

  } else if(/playstation|ipad|tablet|touchpad/i.test(a)) {
    return "tablet";
  }

  return "desktop";

}

function sendAsync (url, data, callback) {
  // Send an asynchronous http request with a low timeout
  var xhr = ('XMLHttpRequest' in window) ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
  xhr.open('POST', url, true);
  xhr.timeout = 300;
  xhr.withCredentials = true;
  xhr.setRequestHeader('Accept', '*/*');
  if (typeof data === 'string') {
    xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
    xhr.responseType = 'text/plain';
  } else if (({}).toString.call(data) === '[object Blob]') {
    if (data.type) {
      xhr.setRequestHeader('Content-Type', data.type);
    }
  }
  if (callback) {
    // on success, error or timeout ensure our callback is called
    xhr.onreadystatechange = function (event) {  
      if (xhr.readyState === 4) {  
        callback();
      }
    };
  }

  try {
    xhr.send(data);
  } catch (error) {
    callback();
  }
  return xhr;
}

/*
 * Register click handlers which trigger mormont tracking events for the 
 * selectors passed.
 */
function setupClickTrackingForSelectors(selectors) {
  window.addEventListener("load", function () {
  
    function track(event) {
      var isMiddleClick = (event.which == 2);
      var isMiddleOrRightClick = isMiddleClick || (event.which == 1);
      var searchDepth = 3;
      var isClickOnAnchor = false;
      var clickedElem = event.target;
      for (var i = 0; i < searchDepth; i++) {
        if (clickedElem.nodeName == "A") {
          isClickOnAnchor = true;
          break;
        }
        if (!clickedElem.parentElement) {
          break;
        }
        clickedElem = clickedElem.parentElement;
      }
      if (isClickOnAnchor && isMiddleOrRightClick && !event.skipTracking) {
        if (!window['mormontPageview'] || ! window['mormontPageview']['pageview_id']) {
          return;
        }
        var targetUrl = clickedElem.href;
        var linkText = clickedElem.textContent;
        var eventData = {
          'category': 'article',
          'action': 'click',
          'value': targetUrl,
        };
        if (linkText) {
          eventData['label'] = linkText;
        }
        var eventSource = clickedElem.getAttribute('data-event-source');
        if (eventSource) {
          eventData['source'] = eventSource;
        }
        // If we have to simulate blocking event requests for this browser (safari/IE)..
        if (window['mormontConfig']['event_blocking']) {
          var clicked = true;
          // If we're dealing with a link which opens a new tab, we can allow this
          // click event to bubble through to other click handlers - our async call
          // won't be cut short by page unload
          var openInNewTab = clickedElem.getAttribute('target') == '_blank' || event.metaKey || isMiddleClick;
          if (!openInNewTab) {
            event.preventDefault();
            clicked = false;
          }
          // Send our async request and on success (or failure) trigger the remaining
          // click handlers by simulating a new event
          mormont('event', eventData, function () {
            if (!clicked) {
              // If we haven't yet allowed the click handlers to work, trigger
              // a new click event which will not trigger this tracking handler
              var newEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
              });
              newEvent.skipTracking = true;
              event.target.dispatchEvent(newEvent);
            }
          });
        }
        else {
          mormont("event", eventData);
        }

      }
    }

    for (var i = 0; i < selectors.length; i++) {
      var elem = document.querySelector(selectors[i]);
      elem.addEventListener("click", track, false);
      elem.addEventListener("auxclick", track, false);
    }
  });
}
