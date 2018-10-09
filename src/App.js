
const Game = require('./go/Game');
const Board = require('./Board');
const Url = require('./Url');
const Popup = require('./Popup');


class App {
	constructor(width, height) {
		this.boardDom = $('#board');

		this.reset(width, height);

		// Gère l'activation du mode "Afficher les libertés":
		this.updateShowOption('liberties');
		$('#show-liberties--checkbox').change((ev) => {
			this.updateShowOption('liberties');
		})

		// Gère l'activation du mode "Afficher les chaînes":
		this.updateShowOption('chains');
		$('#show-chains--checkbox').change((ev) => {
			this.updateShowOption('chains');
		})

		// Gère l'activation du mode "Afficher les zones de cases libres":
		this.updateShowOption('freezones');
		$('#show-freezones--checkbox').change((ev) => {
			this.updateShowOption('freezones');
		})

		this.setupNewGamePopup();
		this.setupOptionsPopup();

		// Outils de debug:
		if (Url.debug) {
			this.setupDebug();
		}
	}

	/**
	 * Met à jour le lien vers la partie cours.
	 */
	updateGameLinkButton() {
		$('#game-link--btn').attr('href', this.getDumpUrl());
	}

	/**
	 * Renvoie la valeur actuelle d'une options d'affichage (libertés, chaines...)
	 *
	 * @param {string} option_name  Nom de l'option
	 *
	 * @return {boolean}
	 */
	getShowOption(option_name) {
		return $(`#show-${option_name}--checkbox`).prop('checked');
	}

	/**
	 * Met à jour l'affichage d'une option suivant la valeur de la checkbox correspondante.
	 */
	updateShowOption(option_name) {
		this.board.setShowOption(option_name, this.getShowOption(option_name));
	}

	/**
	 * Définit une option d'affichage.
	 *
	 * @param {boolean} value
	 */
	setShowOption(option_name, value) {
		$(`#show-${option_name}--checkbox`).prop('checked', value);
		this.updateShowOption(option_name);
	}

	/**
	 * Inverse la valeur de l'option "Afficher les libertés".
	 */
	toggleShowOption(option_name) {
		this.setShowOption(option_name, !this.getShowOption(option_name));
	}

	/**
	 * Initialise les commandes pour le popup "Nouvelle partie".
	 */
	setupNewGamePopup() {
		let new_game_popup = new Popup('#new-game--popup');

		$('#new-game--btn').click(() => {
			new_game_popup.show();
		});

		new_game_popup
			.on('confirm', () => {
				// Indique qu'une nouvelle partie a été demandée, donc il ne faudra pas prendre en
				// compte une partie indiquée dans l'url:
				this.newGame = true;

				// Récupère les dimensions du plateau demandées:
				let w = Number($('#game-width--input').val());
				let h = Number($('#game-height--input').val());

				// Réinitialise la partie:
				this.reset(w, h);
			})
	}

	/**
	 * Initialise les commandes pour le popup "Options".
	 */
	setupOptionsPopup() {
		let options_popup = new Popup('#options--popup');

		$('#options--btn').click(() => {
			options_popup.show();
		});
	}

	/**
	 * Retourne une URL complète vers la partie en cours.
	 *
	 * @return {string}
	 */
	getDumpUrl() {
		let url = new URL(window.location.href);
		url.searchParams.set('game', this.game.getDump());
		return url;
	}

	/**
	 * Réinitialise une nouvelle partie.
	 *
	 * @param {number} width   Largeur du goban
	 * @param {number} height  Hauteur du goban
	 */
	reset(width, height) {
		this.width = width;
		this.height = height;

		this.game = new Game(this.width, this.height);
		this.board = new Board(this.boardDom, this.game);

		window.app = this;
		window.game = this.game;
		window.board = this.board;

		if (!this.newGame && Url.game) {
			this.board.restoreDump(Url.game);
		}

		// Gère la mise-à-jour du lien vers la partie en cours:
		this.updateGameLinkButton();
		this.board.on('turn-done', () => {
			this.updateGameLinkButton();
		})
	}

	setupDebug() {
		$('body').keydown((ev) => {
			let key = ev.originalEvent.key;
			switch (key) {
				case (' '):
				case ('a'):
					this.game.togglePlayer();
					this.game.resetPlayableInformation();

					// Actualise le visuel sous la souris:
					if (this.board.cellUnderMouse) {
						this.board.cellUnderMouse.dom.mouseout().mouseover();
					}

					break;
				case ('l'):
					this.toggleShowOption('liberties');
					break;
				case ('c'):
					this.toggleShowOption('chains');
					break;
				case ('f'):
					this.toggleShowOption('freezones');
					break;
			}
		});
	}
}


module.exports = App;

