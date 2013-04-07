/*
 * jQuery UI Color Picker widget 0.0.1
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget( "ui.colorpicker", {
	options: {
		value: { red: 0, green: 0, blue: 0 },

		show_preview: true,

		palette: []
	},

	sliders: { red: null, green: null, blue: null },


	// Constructor

	_create: function() {
		var self = this;

		this.element
			.addClass( "ui-colorpicker ui-widget ui-widget-content ui-corner-all" );

		var $ul = $('<ul></ul>')
			.appendTo(this.element)
			.on('keyup', 'input', function() {
				var val = $(this).val();

				if (!val) {
					return;
				}

				if (val.match(/^[0-9]+$/) && val >= 0 && val <= 255) {
					self._update(
						$(self.element).find('.red input').val(),
						$(self.element).find('.green input').val(),
						$(self.element).find('.blue input').val()
					);
				}
			});


		// Build the sliders

		for (var color in this.sliders) {
			this.sliders[color] = $('<div></div>').slider({
				min: 0,
				max: 255,

				slide: function(event, ui) {
					var color = $(this).parent('li')[0].className;
					self.options.value[color] = ui.value;
					self._repaint();
				}
			});

			var $li = $('<li class="' + color + '"><label for="">' + color.substr(0, 1).toUpperCase() + color.substr(1) + '</label></li>').appendTo($ul);
			$li.append(this.sliders[color]);
			$('<input type="text"/>').appendTo($li);
		}


		// Preview

		if (this.options.show_preview) {
			this.element.prepend('<div class="preview"></div>');
		}


		// Palette

		var $palette = $('<ul class="palette"></ul>')
			.appendTo(this.element)
			.on('click', 'li', function() {
				var color = $(this).css('background-color');

				var matches = color.match(/rgb\(([0-9]+),\s?([0-9]+),\s?([0-9]+)\)/);

				self._update(matches[1], matches[2], matches[3]);
			});

		for (var p in this.options.palette) {
			$palette.append('<li style="background-color: ' + this.options.palette[p] + '"></li>');
		}

		self._repaint();
	},


	// Destructor

	destroy: function() {
		this.element
			.removeClass( "ui-colorpicker ui-widget ui-widget-content ui-corner-all" );

		this.find('*').remove();

		$.Widget.prototype.destroy.apply( this, arguments );
	},


	// Public methods

	value: function() {
		return this._value();
	},


	//-------------------------------------------------------------------------
	// Private methods
	//-------------------------------------------------------------------------


	// Update the current value with provided values

	_update: function(red, green, blue) {
		this.options.value.red    = red;
		this.options.value.green  = green;
		this.options.value.blue   = blue;

		this._repaint();
	},

	_value: function() {
		// TODO Should probably guarantee these values are parseInt'd from
		// somewhere else ...
		var r = parseInt(this.options.value.red).toString(16);
		var g = parseInt(this.options.value.green).toString(16);
		var b = parseInt(this.options.value.blue).toString(16)

		r = r < 10 ? '0' + r : r;
		g = g < 10 ? '0' + g : g;
		b = b < 10 ? '0' + b : b;

		return '#' + r + g + b;
	},


	// Update everything

	_repaint: function() {

		var range = {},
			vendors = [ 'moz', 'webkit' ],
			color,
			color2,
			v;

		for (color in this.sliders) {
			this.sliders[color]
				.slider("value", this.options.value[color])
				.next("input")
				.val(this.options.value[color]);

			for (color2 in this.sliders) {
				range[color2] = color2 == color
					? [0, 255]
					: [this.options.value[color2], this.options.value[color2]];
			}

			for (v in vendors) {
				this.sliders[color].css({
					background:
						'-' + vendors[v] + '-linear-gradient(0, rgb(' + range.red[0] + ', ' + range.green[0] + ', ' + range.blue[0] + '), rgb(' + range.red[1] + ', ' + range.green[1] + ', ' + range.blue[1] + '))',
				});
			}
		}

		this._trigger( "change" );


		// Update the 'preview' panel (which should probably be optional ...

		this.element.find('.preview').css({
			backgroundColor: 'rgb(' + this.options.value.red + ', ' + this.options.value.green + ', ' + this.options.value.blue + ')',
			color: this._getContrastYIQ(this.options.value.red, this.options.value.green, this.options.value.blue)
		}).text(this._value());
	},


	// Courtesy of http://24ways.org/2010/calculating-color-contrast

	_getContrastYIQ: function(r, g, b, hexcolor) {
		var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
		return (yiq >= 128) ? 'black' : 'white';
	}
});

$.extend( $.ui.colorpicker, {
	version: "0.0.1"
});

})( jQuery );
