/**
 * Magnet Affiliates jQuery plug-in
 *
 * Copyright 2017 Gamer Network
 */
window['edmondsConfig'] = {
  'script_path': document.currentScript.src,
  'css_path': document.currentScript.src.replace('.js', '.css'),
  'display_zeros': false,
};

window['edmondsVars'] = {
  'css_injected': false,
};

(function($, window, undefined) {
    function injectCSS() {
      if (!window['edmondsVars']['css_injected']) {
        var link  = document.createElement('link');
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = window['edmondsConfig']['css_path'];
        document.getElementsByTagName('head')[0].appendChild(link);
        window['edmondsVars']['css_injected'] = true;
      }
    }

    function getDefaults() {
        return {
            product_id: '',
            category: '',
            campaign: '',
            department: '',
            style: 'grid',
            search: '',
            limit: '',
            order: '',
            country: '',
            site: '',
            affiliate_tag_group: '',
            label: 'Related Products',
            edmonds_url: 'https://edmonds.gamer-network.net',
        };
    }

    function renderEdmondsBlock(container, data, options) {
      if((data['products'] == undefined) || (data['products'].length == 0)){
        return;
      }

      $(container).append('<div class="ma-wrapper ma-' + options.style + ' ma-' +options.site.replace(/\./g, '-').replace(/_/g, '-') + '"></div>');

      if(data['products'].length > 1){
          $('.ma-wrapper', container).addClass('multiple');
          $(container).addClass('ma-multiple-'+options.style);
      } else {
          $(container).addClass('ma-single-'+options.style);
      }

      if (options.label) {
          $('.ma-wrapper', container).append('<h4>'+options.label+'</h4>');
      }
      $('.ma-wrapper', container).append('<div class="ma-products"></div>');

      $.each(data['products'], function(){
          var partner_class = this.partner.domain.replace(/\./g, '-').replace(/_/g, '-');
          var product_html = edmondsGetProductHTML(this.link, this.name, this.image, this.prices, partner_class);
          $('.ma-products', container).append(product_html);
      });
    }

    $.fn.getAffiliateProducts = function(options) {
        // Default options
        var options = $.extend(getDefaults(), options);
        var container = $(this);

        getAffiliatesData = function() {
            var edmonds_url = options['edmonds_url']
            ;
            delete options['edmonds_url'];
            delete options['display_zeros'];
            if (Array.isArray(options['label'])) {
                options['label'] = options['label'][Math.floor(Math.random() * options['label'].length)];
            }

            $.getJSON(edmonds_url + "/api/v1/affiliate-links/?" + $.param(options), function(data) {
                renderEdmondsBlock(container, data, options);
            });
        }

        injectCSS(window);
        getAffiliatesData();
    }

    $.fn.batchAffiliateProducts = function(options) {
       var defaults = $.extend({
          'batch': [],
          'edmonds_url': getDefaults()['edmonds_url'],
       }, options)
          ,containers = $(this)
       ;

      batchAffiliatesData = function() {
          var edmonds_url = defaults['edmonds_url']
              ,clean = []
              ,clean_limit = 10
              ,clean_key = 0
              ,batch = defaults['batch']
            ;
          if (defaults['batch'].length < 1) {
              return;
          }

          $(defaults['batch']).each(function(it, set) {
              // Split up batch into groups to stop request from getting too big
              if (!(it % clean_limit)) {
                  if (it > 0) {
                      clean_key += 1;
                  }
                  clean[clean_key] = {
                      start: it,
                      set: []
                  }
              }
              set = $.extend(getDefaults(), set);
              delete set['edmonds_url'];
              if (Array.isArray(set['label'])) {
                  set['label'] = set['label'][Math.floor(Math.random() * label.length)];
              }
              for (var name in set) {
                  if (set[name] === null || set[name] === undefined || set[name] === '') {
                      delete set[name]
                  }
              }
              clean[clean_key]['set'].push(set);
          });

          for (var i = 0; i < clean.length; i++) {
              var data = clean[i];
              // Set AJAX call as a function to prevent `data` from being overwritten
              // on iterations while waiting for AJAX response
              var callApi = function(data) {
                  var labels = {}
                      ,styles = {}
                  ;
                  for (k in data['set']) {
                      labels[k] = data['set'][k]['label'];
                      styles[k] = data['set'][k]['style'];
                      delete data['set'][k]['label'];
                      delete data['set'][k]['style'];
                  }

                  $.ajax(
                      edmonds_url + "/api/v1/batch-affiliate-links/",
                      {
                          method: 'GET',
                          data: {'batch': JSON.stringify(data['set'])},
                          success: function(response) {
                              $(response['batches']).each(function(it, batch) {
                                  key = data['start'] + it
                                  set = data['set'][it];
                                  set['label'] = labels[it];
                                  set['style'] = styles[it];
                                  renderEdmondsBlock(containers[key], batch, set);
                              });
                          }
                      }
                  );
              }
              callApi(data);
          }
      }

      injectCSS();
      batchAffiliatesData();
    }
})(window.jQuery, window);

function renderEdmonds(identifier, config) {
    var batch_data = []
      ,options = {};
    var options = {};
    if (config['edmonds_url'] != undefined) {
        options['edmonds_url'] = config['edmonds_url'];
        delete config['edmonds_url'];
    }
    jQuery(identifier).each(function (it, affiliateBlock) {
        var data = {};
        for (var key in config) {
            data[key] = config[key];
        }
        jQuery.each(jQuery(affiliateBlock).data(), function(i, v) {
          data[i] = v;
        });
        batch_data.push(data)
    });
    options['batch'] = batch_data;
    jQuery(identifier).batchAffiliateProducts(options);
}

function edmondsGetProductHTML(link, name, image, prices, partner_class) {
  
  if(link.match(/amazon\./i)) {
    subtag='';
    if(window.location.pathname.length > 1){
      var subtag = window.location.pathname.substring(1);
      subtag = subtag.replace(/\//g,'-').substring(0,89);
    } else {
      subtag='index';
    }
    link = link + ((link.indexOf('?') == -1) ? '?ascsubtag=' : '&ascsubtag=') + subtag;
  }

  return '\
    <div class="ma-product">\
      <a href="' + link + '" data-event-source="edmonds" target="_blank" rel="nofollow">\
        <div class="ma-product-image" style="background-image: url('+image+')"></div>\
      </a>\
      <div class="ma-product-details">\
        <a href="' + link + '" data-event-source="edmonds" target="_blank" rel="nofollow">\
          <div class="ma-product-name">'+name+'</div>\
        </a>\
        <div class="ma-product-buy">\
          '+edmondsGetPrices(prices)+'\
          <a href="' + link + '" data-event-source="edmonds" target="_blank" rel="nofollow">\
            <div class="ma-buy-now" data-partner="'+partner_class+'">Buy Now</div>\
          </a>\
        </div>\
      </div>\
    </div>\
  ';
}

function edmondsGetPrices(prices) {
    var price_html = '';

    jQuery.each(prices, function(currencyCode) {
        var currencySymbol = edmondsGetCurrencySymbol(currencyCode);
        if (!window['edmondsConfig']['display_zeros']) {
          this.current_price = this.current_price.replace(/\.00$/, '');
          this.original_price = this.original_price.replace(/\.00$/, '');
        }
        if(this.current_price < this.original_price) {
            price_html += '<div class="ma-price">' + currencySymbol + this.current_price + '<span class="ma-original-price">' + currencySymbol + this.original_price + '</span></div>';
        } else {
            price_html += '<div class="ma-price">' + currencySymbol + this.current_price + '</div>';
        }
    });

    return price_html;
}

function edmondsGetCurrencySymbol(currencyCode) {
    var currencies = {
        'GBP': '&pound;', // British Pounds
        'USD': '&dollar;', // US dollars
        'CAD': 'CAD&dollar;', // Canadian dollars
        'AUD': 'AUD&dollar;', // Australian dollars
        'NZD': 'NZD&dollar;', // New Zealand dollars
        'EUR': '&euro;', // Euros
        'JPY': '&yen;', // Japanese Yen
        'INR': '&#8377;', // Indian Rupees
    };

    var currency = currencies[currencyCode];

    if (typeof currency != 'undefined') {
        return currency;
    }

    return currencyCode
}
