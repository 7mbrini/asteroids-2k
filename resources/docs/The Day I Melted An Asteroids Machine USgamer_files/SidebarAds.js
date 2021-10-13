var SidebarAds = function(args) {
	this.content = args.content;
	this.firstOffset = args.firstOffset;
	this.minSpacing = args.minSpacing;
	this.leeway = args.leeway;
	this.limit = args.limit;
	this.sidebar = args.sidebar;
	this.prefix = args.prefix;
	this.site = args.site;
	this.zone = args.zone;
	this.articles = args.articles || [];
	this.lang = args.lang || {
		advertisement: "Advertisement",
		related: "Related content"
	};
	this.firstOffset = args.firstOffset || 0;
	this.startAt = args.startAt || 0;
	this.count = 0;

	this.draw = function() {

		if(this.zone == "") {
			return;
		}

		var contentHeight = this.content.height() - this.firstOffset;
		var viewportHeight = Math.max($(window).height(), this.minSpacing);
		var count = Math.floor((contentHeight) / viewportHeight);

		if(this.limit && count > this.limit) {
			count = this.limit;
		}

		for(i = 0; i < count; i++) {
			var sizes = "300x250,300x600";
			var position = i + this.startAt + 1;

			var block = document.createElement("div");
			block.className = "sidebar-mpu-container";
			block.style.top = this.firstOffset + (i * viewportHeight) + "px";

			articles = "";
			if(this.articles.length) {
				this.articles.splice(0, this.startAt * 3);
			}

			if(this.articles.length) {

				articles += "<p class='section-title'>" + this.lang.related + "</p>";
				articles += "<div class='small-list'>";
					for(j = 0; j < 3; j++) {
						var a = this.articles[j];
						if(a) {
							articles += " \
								<div class='list-item'> \
									<p class='title'> \
										<a href='/articles/" + a.slug + "'> \
											" + a.title + " \
										</a> \
									</p> \
									<div class='metadata'> \
										<a href='/articles/" + a.slug + "#comments' class='comment-bubble' data-comments='" + a.comments + "'> \
											" + (a.comments > 0 ? a.comments : "") + " \
										</a> \
									</div> \
								</div> \
							";
						}
					}
					this.articles.splice(0, 3);
				articles += "</div>";
			}

			block.innerHTML = ' \
				<div class="mpu collapsible"> \
					<p class="section-title">' + this.lang.advertisement + '</p> \
					<div \
						class="lazyload" \
						data-dfp-id="' + this.zone + '" \
						data-dfp-sizes="' + sizes + '" \
						data-dfp-collapse="true" \
						data-dfp-targeting="site=' + this.site + ',position=' + this.site + '-' + position + ',lazyload=true,sticky=false" \
						id="div-ga-' + this.prefix + '_MPU_' + position + '" \
					></div> \
				</div> \
				' + articles;

			this.sidebar.append(block);

			this.count = count + this.startAt;
		}
	};

	this.redraw = function() {
		this.sidebar.innerHTML = '';
		this.draw();
	}

	this.draw();
};