
const EventEmitter = require('eventemitter3');

require('./css/popup.scss');


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
			this.hide();
			this.emit('cancel');
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
		this.emit('show');
	}

	/**
	 * Cache la fenêtre popup.
	 */
	hide() {
		this.target.hide();
		this.emit('hide');
	}
}


module.exports = Popup;

