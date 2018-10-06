
require('./css/style.scss');

const Game = require('./go/Game');
const GoBoard = require('./GoBoard');
const Url = require('./Url');


class App {
	constructor(width, height) {
		this.boardDom = $('#board');
		this.width = width;
		this.height = height;

		this.reset();

		// Gère la mise-à-jour du lien vers la partie en cours:
		this.updateGameLinkButton();
		this.board.on('turn-done', () => {
			this.updateGameLinkButton();
		})

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
	 * Retourne une URL complète vers la partie en cours.
	 *
	 * @return {string}
	 */
	getDumpUrl() {
		let url = new URL(window.location.href);
		url.searchParams.set('game', this.game.getDump());
		return url;
	}

	reset() {
		this.game = new Game(this.width, this.height);
		this.board = new GoBoard(this.boardDom, this.game);

		window.app = this;
		window.game = this.game;
		window.board = this.board;

		if (Url.game) {
			this.board.restoreDump(Url.game);
		}
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

