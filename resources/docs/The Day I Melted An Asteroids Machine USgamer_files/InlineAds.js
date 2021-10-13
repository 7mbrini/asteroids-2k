var InlineAds = function(args) {

	this.container = args.container;
	this.mpu_mob_unit = args.mpu_mob_unit;
	this.ad_text = args.ad_text;
	this.site_targeting = args.site_targeting;
	this.lazyload_unit = args.lazyload_unit;
	this.ignore_elements = '.blockquote, div, aside, iframe, script';
	this.show_inread = args.inread;

	// Word count for short articles
	shortArticle = 300;

	var inlineRules = {
        bodySelector: '.page > .above > .article > .body',
        minBelow: 1500, // minimum pixels below an ad before placing another one
    };

    // Generate a MPU_MOB ad
	this.mpuMobAd = function() {
		var ad_html = ' \
			<div id="mobile-mpu-wrapper" class="mpu collapsible"> \
				<span class="ad-break-text"><i class="fa fa-angle-down"></i> ' + this.ad_text + ' <i class="fa fa-angle-down"></i></span> \
				<div id="mobile-mpu" class="mobile-mpu-wrapper"> \
					<div \
						class="collapsible advert" \
						data-dfp-id="' + this.mpu_mob_unit + '" \
						data-dfp-sizes="320x50, 320x100, 300x250, 320x400" \
						data-dfp-collapse="true" \
						data-dfp-targeting="site=' + this.site_targeting + ',position=btf" \
						id="div-ga-' + this.mpu_mob_unit + '" \
					></div> \
				</div> \
			</div>';

		return ad_html;
	}

	// Generate a lazyloaded ad
	this.lazyloadAd = function(dfp_id, ad_number) {
		if((ad_number) < 10) {
			ad_position = ad_number;
		} else {
			ad_position = 10;
		}
		ad_class = "lazyload";
		lazyload_on = "true";
		placement = "none";
		if(ad_position == 1) {
			ad_class = "advert";
			lazyload_on = "false";
			placement = "fishbowl-combo";
		}
		var ad_html = ' \
			<div id="mobile-mpu-' + ad_number + '-wrapper" class="collapsible"> \
				<span class="ad-break-text"><i class="fa fa-angle-down"></i> ' + this.ad_text + ' <i class="fa fa-angle-down"></i></span> \
				<div id="mobile-mpu-' + ad_number + '" class="mobile-mpu-wrapper"> \
					<div \
						class="' + ad_class + '" \
						data-dfp-id="' + dfp_id + '" \
						data-dfp-sizes="320x50, 320x100, 300x250" \
						data-dfp-collapse="true" \
						data-dfp-targeting="site=' + this.site_targeting + ',position=' + this.site_targeting + '-' + ad_position + ',lazyload=' + lazyload_on + ',sticky=false, placement=' + placement + '" \
						id="div-ga-' + dfp_id + '_' + ad_number + '" \
					></div> \
				</div> \
			</div>';

		return ad_html;
	}

	// Generate Inread
	this.inread = function(ad_number) {
		var inread_html = ' \
			<div id="mobile-mpu-' + ad_number + '-wrapper" class="mpu collapsible"> \
				<span class="ad-break-text"><i class="icon-angle-down"></i> ' + this.ad_text + ' <i class="icon-angle-down"></i></span> \
				<div id="mobile-mpu-' + ad_number + '" class="mobile-mpu-wrapper"> \
				<script type="text/javascript" src="//gamernetwork.mainroll.com/a/usg_in_read.js"></script> \
				</div> \
			</div>';
		return inread_html;
	}

	this.moveAds = function()
	{
		articleHeight = jQuery(inlineRules.bodySelector)[0].getBoundingClientRect().height;

		var articleContents = [];
		jQuery(this.container.find(' > *:not(' + this.ignore_elements + ')')).each(function() {
			articleContents.push(this);
		});

		// Get article word count
		totalWordcount = 0;
		for ( var k = 0; k < articleContents.length; k++ ) {
			totalWordcount = totalWordcount + this.countWords(articleContents[k].innerHTML);
		}

		var adCount = 0;
		wordCountCheck = shortArticle;
		adPlaced = false;

		// First check if this is a short article, if so we're only going to place MPU_MOB
		if(totalWordcount < shortArticle) {

			var wordCount = 0;
			wordCountCheck = totalWordcount / 2;

			// Count through words and put the ad halfway through
			for ( var j = 0; j < articleContents.length; j++ ) {

				if ( (wordCount < wordCountCheck) ) {
					wordCount = wordCount + this.countWords(articleContents[j].innerHTML);
				} else {
					if(!adPlaced){
						jQuery(articleContents[j]).before(this.mpuMobAd());
						adCount = 1;
						adPlaced = true;
					}
				}
			}

		} else {

			// On longer articles we want to put MPU_MOB after the first para, then ads every viewport (600px or whatever is defined in minBelow)
			jQuery(articleContents[0]).after(this.mpuMobAd());
			articleContents.shift();

			adCount = 1;

			firstAdDims = jQuery('#mobile-mpu-wrapper')[0].getBoundingClientRect();

			var adPlaced = false;
			secondElemDims = this.elemDims(articleContents[0]);
			var nextAdTarget = secondElemDims.top + inlineRules.minBelow;

			// Every time we place an ad we get the offset of the element below, then look for the next element that is a certain distance away (defined by minBelow)
			for ( var j = 0; j < articleContents.length; j++ ) {

				elemDims = this.elemDims(articleContents[j]);

				if(elemDims.top >= nextAdTarget) {
					dfp_id = this.lazyload_unit;
					if(adCount == 1 && this.show_inread) {
						jQuery(articleContents[j]).before(this.inread(adCount));
					} else {
						jQuery(articleContents[j]).before(this.lazyloadAd(dfp_id, adCount));
					}
					adPlaced = true;
					thisAdDims = jQuery('#mobile-mpu-' + adCount)[0].getBoundingClientRect();
					if(articleContents[j + 1]) {
						nextElemDims = this.elemDims(articleContents[j + 1]);
						nextAdTarget = nextElemDims.top + inlineRules.minBelow;
					}
					adCount++;
				}

			}

		}

		// Track a few key-values on MPU_MOB
		var mpu_mob_targeting = jQuery('#mobile-mpu-wrapper .advertContainer').attr('data-dfp-targeting');
		jQuery('#mobile-mpu-wrapper .advertContainer').attr('data-dfp-targeting', mpu_mob_targeting + ',placement=fishbowl-combo,ads_count=' + adCount + ',article_words=' + (Math.round(totalWordcount / 10) * 10) + ',article_height=' + (Math.round(articleHeight / 10) * 10));

	};

	// Count Words In Paragraph
	this.countWords = function(paragraph) {
		paragraph = paragraph.replace(/(^\s*)|(\s*jQuery)/gi,"");
		paragraph = paragraph.replace(/[ ]{2,}/gi," ");
		paragraph = paragraph.replace(/\n /,"\n");
		return paragraph.split(' ').length;
	};

	this.elemDims = function(el) {
        return {
            top: el.offsetTop,
            bottom: el.offsetTop + el.offsetHeight,
            element: el
        };
    };

  	this.moveAds();

};
