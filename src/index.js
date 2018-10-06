
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
	}

	reset() {
		this.game = new Game(this.width, this.height);
		this.board = new GoBoard(this.board, this.game);

		window.game = this.game;
		window.board = this.board;
		window.dump = this.game.getDump.bind(this.game);

		if (Url.game) {
			this.board.restoreDump(Url.game);
		}

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

