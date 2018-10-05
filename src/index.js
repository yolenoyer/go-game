
require('./css/style.scss');

const Game = require('./go/Game');
const GoBoard = require('./GoBoard');


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

