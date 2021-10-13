var LazyCovers = function(args) {

	this.args = args || {};
	this.selector = this.args.selector || "[data-cover]";
	this.covers = $(this.selector);
	this.buffer = 300;
	this.timeout = 250;

	this.run = function(args) {
		this.checkForVisibleImages();
	};

	this.checkForVisibleImages = function() {

		for (i = 0; i < this.covers.length; i++) {
			var cover = $(this.covers[i]);
			if(this.isInViewport(cover, this.buffer)) {
				this.loadCover(cover);
			}
		}

		window.setTimeout(this.checkForVisibleImages.bind(this), this.timeout);
	};

	this.loadCover = function(cover) {
		if(cover.attr("data-cover")) {
			cover.css('background-image', "url(" + cover.attr('data-cover') + ")");
			cover.removeAttr('data-cover');
		}
	};

	this.isInViewport = function(cover, buffer) {
		var elementTop = $(cover).offset().top;
		var elementBottom = elementTop + $(cover).outerHeight();
		var viewportTop = $(window).scrollTop();
		var viewportBottom = viewportTop + $(window).height() + buffer;
		return elementBottom > viewportTop && elementTop < viewportBottom;
	};

	this.run();
};