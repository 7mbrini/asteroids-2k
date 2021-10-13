var Timeline = function(timeline) {

	this.timeline = jQuery(timeline);
	this.items = this.timeline.find(".timeline-item");
	this.buttons = this.timeline.find(".button");
	this.order = this.timeline.attr('data-order');

	this.run = function() {
		this.buttons.on("click", this.toggleOrder.bind(this));
		this.buttons.filter("[data-order="+this.order+"]").click();
	};

	this.toggleOrder = function(e) {

		e.preventDefault();

		button = jQuery(e.currentTarget);

		this.buttons.removeClass("on");
		button.addClass("on");
		order = button.attr('data-order');

		this.reorder(order);
	}

	this.reorder = function(order) {

		switch(order) {
			case "newest":
				this.items = this.items.sort(function(a, b) {

					a = parseInt(jQuery(a).attr('data-date'));
					b = parseInt(jQuery(b).attr('data-date'));

					return a > b ? -1 : 1;
				});
			break;

			case "oldest":
				this.items = this.items.sort(function(a, b) {

					a = parseInt(jQuery(a).attr('data-date'));
					b = parseInt(jQuery(b).attr('data-date'));

					return a < b ? -1 : 1;
				});
			break;
		}

		this.timeline.find(".timeline-items").append(this.items);

	};

	this.run();

};