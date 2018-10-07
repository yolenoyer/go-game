
require('./css/style.scss');

const Game = require('./go/Game');
const Board = require('./Board');
const Url = require('./Url');
const Popup = require('./Popup');


class App {
	constructor(width, height) {
		this.boardDom = $('#board');
		this.setGameSize(width, height);

		this.reset();

		// Gère l'activation du mode "Afficher les libertés":
		this.updateShowLiberties();
		$('#show-liberties--checkbox').change((ev) => {
			this.updateShowLiberties();
		})

		// Gère l'activation du mode "Afficher les chaînes":
		this.updateShowChains();
		$('#show-chains--checkbox').change((ev) => {
			this.updateShowChains();
		})

		this.setupNewGamePopup();

		// Outils de debug:
		if (Url.debug) {
			this.setupDebug();
		}
	}

	setGameSize(width, height) {
		this.width = width;
		this.height = height;
	}

	/**
	 * Met à jour le lien vers la partie cours.
	 */
	updateGameLinkButton() {
		$('#game-link--btn').attr('href', this.getDumpUrl());
	}

	/**
	 * Met à jour l'affichage des libertés suivant la valeur de la checkbox correspondante.
	 */
	updateShowLiberties() {
		let value = $('#show-liberties--checkbox').prop('checked');
		this.board.setDisplayLiberties(value);
	}

	/**
	 * Met à jour l'affichage des chaines suivant la valeur de la checkbox correspondante.
	 */
	updateShowChains() {
		let value = $('#show-chains--checkbox').prop('checked');
		this.board.setDisplayChains(value);
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
				this.newGame = true;
				let w = Number($('#game-width--input').val());
				let h = Number($('#game-height--input').val());
				this.setGameSize(w, h);
				this.reset();
			})
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
	 */
	reset() {
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
			if (key === 'a') {
				this.game.togglePlayer();
				this.game.resetIsAllowedCache();
			}
		});
	}
}


new App(9, 9);

