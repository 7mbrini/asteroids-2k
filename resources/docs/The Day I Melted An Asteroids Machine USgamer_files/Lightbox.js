var Lightbox = function(args) {

    this.args = args;
    this.selector = args.selector || ".article img";
    this.cdn = args.cdn || "https://cdn.gamer-network.net";

    this.images = $(this.selector).not("img[src*='.gif']");
    this.image = false;

    this.run = function() {
        this.images.on("click", this.renderOverlay.bind(this));
        this.images.attr("data-lightboxed", true);
        $(document).on("keyup", this.processKey.bind(this));
    };

    this.imageLoaded = function(e) {
        lightbox = $(".lightbox-overlay .image");
        lightbox.html('<img src="' + this.image + '"/>');
        lightbox.addClass('loaded');
    };

    this.processKey = function(e) {
        if (e.which == 27) {
            this.destroy();
        }
    }

    this.renderOverlay = function(e) {
        if (e) e.preventDefault();

        this.destroy();

        this.image = $(e.target).attr('data-asset-id') ? $(e.target).attr('data-asset-id') : $(e.target).attr('src');

        // Show a spinner until the image has loaded
        var lightbox = $(' \
			<div class="lightbox-overlay"> \
				<div> \
					<div class="image"><i class="fa fa-spinner fa-spin"></i></div> \
				</div> \
			</div> \
		');

        // Replace the spinner once the image has loaded
        var image = new Image();
        $(image).on("load", this.imageLoaded.bind(this));
        image.src = this.image;

        $(document.body).append(lightbox);

        lightbox.on("click", this.destroy.bind(this));
    };

    this.destroy = function(e) {

        if (e) e.preventDefault();

        $(".lightbox-overlay").remove();

        return false;
    };

    this.run();

};