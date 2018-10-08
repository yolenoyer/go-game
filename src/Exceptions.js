
class GoException {
	constructor(cell, message) {
		this.cell = cell;
		this.x = cell.x;
		this.y = cell.y;
		this.player = cell.game.currentPlayer;
		this.message = message;
	}
}

class NotAFreeCellException extends GoException {
	constructor(cell) {
		super(cell, "Case non-libre");
	}
}

class SuicideException extends GoException {
	constructor(cell) {
		super(cell, "Coup suicidaire");
	}
}

class KoException extends GoException {
	constructor(cell) {
		super(cell, "Interdit par la règle du ko");
	}
}



module.exports = {
	NotAFreeCellException,
	GoException,
	SuicideException,
	KoException,
}

