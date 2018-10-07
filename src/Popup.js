
const EventEmitter = require('eventemitter3');

require('./css/popup.scss');

// Zone transparente couvrant l'ensemble de la fenêtre client, dans laquelle on peut cliquer pour
// fermer la fenêtre popup:
let transparentBackground;

$(() => {
	transparentBackground = $('<div class="popup-transparent-background">');
	$('main').append(transparentBackground);
});


/**
 * Représente une fenêtre popup.
 */
class Popup extends EventEmitter {
	/**
	 * Constructeur.
	 *
	 * @param {string|DomNode} target  Cible (fenêtre popup)
	 * @param {Object} options         Options (aucune option disponible pour le omment)
	 */
	constructor(target, options={}) {
		super();

		this.target = $(target);
		Object.assign(this, options);

		this.target.find('.popup-cancel--command').click(() => {
			this.cancel();
		});

		this.target.find('.popup-confirm--command').click(() => {
			this.hide();
			this.emit('confirm');
		});
	}

	/**
	 * Affiche la fenêtre popup.
	 */
	show() {
		this.target.show();
		transparentBackground
			.show()
			.click(() => this.cancel())

		this.emit('show');
	}

	/**
	 * Cache la fenêtre popup.
	 */
	hide() {
		this.target.hide();
		transparentBackground
			.hide()
			.unbind('click')
		this.emit('hide');
	}

	/**
	 * Annule l'action supposée de la fenêtre popup.
	 */
	cancel() {
		this.hide();
		this.emit('cancel');
	}

}


module.exports = Popup;

