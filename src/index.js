
require('./css/style.scss');

const Game = require('./go/Game');
const GoBoard = require('./GoBoard');
const Url = require('./Url');


class App {
	constructor(width, height) {
		this.board = $('#board');
		this.width = width;
		this.height = height;

		this.reset();

		this.gameLinkButton = $('#game-link--btn');

		this.updateGameLinkButton();
		this.board.on('turn-done', () => {
			this.updateGameLinkButton();
		})

		if (Url.debug) {
			this.setupDebug();
		}
	}

	/**
	 * Met à jour le lien vers la partie cours.
	 */
	updateGameLinkButton() {
		this.gameLinkButton.attr('href', this.getDumpUrl());
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
		this.board = new GoBoard(this.board, this.game);

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

