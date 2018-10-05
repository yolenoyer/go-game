
require('./css/style.scss');

const {
	GoGame,
	BLACK,
	WHITE,
} = require('./GoGame');

const GoBoard = require('./GoBoard');


class App {
	constructor(width, height) {
		this.board = $('#board');
		this.width = width;
		this.height = height;

		this.reset();
	}

	reset() {
		this.game = new GoGame(this.width, this.height);
		this.board = new GoBoard(this.board, this.game);

		$('body').keydown((ev) => {
			let key = ev.originalEvent.key;
			if (key === 'a') {
				this.game.togglePlayer();
			}
		});
	}
}


new App(19, 19);

