
const Player = require('./go/Player');


/**
 * Définit une cellule du plateau (DOM).
 */
class GoBoardCell {
	/**
	 * Constructeur.
	 *
	 * @param {GoBoard} board  Plateau associé
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(board, x, y) {
		this.board = board;
		this.game = this.board.game;
		this.x = x;
		this.y = y;

		// Associe à la cellule du jeu:
		this.cell = this.game.getCell(x, y);
		this.cell.boardCell = this;

		this.buildDom();
	}

	/**
	 * Construit l'élément Dom de la cellule.
	 */
	buildDom() {
		this.dom = $('<td>')
			.append($('<div class="piece">')
				.append('<div class="circle">')
			)
			.append($('<table class="cell">')
				.append($('<tr>')
					.append('<td>')
					.append('<td>')
				)
				.append($('<tr>')
					.append('<td>')
					.append('<td>')
				)
			)

		// Comportement lors du survol d'une case:
		this.dom.mouseover(() => {
			if (this.cell.isAllowed()) {
				this.setPending(this.game.currentPlayer);

				this.dom.one('mouseout', () => {
					this.setState(this.cell.state);
				})
			} else {
				this.dom.addClass('forbidden');

				this.dom.one('mouseout', () => {
					this.dom.removeClass('forbidden');
				})
			}
		})

		// Comportement lors du clic:
		this.dom.click(() => {
			if (this.cell.isAllowed()) {
				this.setState(this.game.currentPlayer);
				let cells_to_be_captured = this.game.tryPlay(this.cell);
				if (cells_to_be_captured !== null) {
					for (let cell of cells_to_be_captured.cells) {
						cell.boardCell.capture();
					}
				}
			}
		})

		if (this.x == 0) {
			this.dom.addClass('left');
		}
		if (this.x == this.game.width - 1) {
			this.dom.addClass('right');
		}
		if (this.y == 0) {
			this.dom.addClass('top');
		}
		if (this.y == this.game.height - 1) {
			this.dom.addClass('bottom');
		}
	}

	/**
	 * Affiche un état en semi-transparence.
	 *
	 * @param {mixed} state BLACK|WHITE|FREE
	 */
	setPending(state) {
		this.setState(state);
		this.dom.addClass('pending');
	}

	/**
	 * Définit l'état visuel de la cellule.
	 *
	 * @param {mixed} state BLACK|WHITE|FREE
	 */
	setState(state) {
		this.dom.removeClass('black white pending');
		if (Player.isPlayer(state)) {
			this.dom.addClass(Player.toLowerName(state));
		}
	}

	/**
	 * Capture la pièce (au niveau graphique).
	 */
	capture() {
		this.setState(Player.FREE);
	}
}

/**
 * Représente le plateau de jeu (DOM).
 */
class GoBoard {
	/**
	 * Constructeur.
	 *
	 * @param {JQueryDOM} dom  Cible dans laquelle créer le tableau de jeu
	 * @param {Game} game      Gestionnaire du jeu (en aveugle)
	 */
	constructor(dom, game) {
		this.dom = dom;
		this.game = game;

		// Initialise le plateau:
		this.reset();
	}

	/**
	 * Réinitialise le plateau.
	 */
	reset() {
		this.dom.empty();
		this.boardCells = [];

		// Création des cellules du plateau:
		for (let y = 0; y != this.game.height; y++) {
			let line = $('<tr>');
			this.dom.append(line);

			let boardLine = [];
			this.boardCells.push(boardLine);

			for (let x = 0; x != this.game.width; x++) {
				let board_cell = new GoBoardCell(this, x, y);
				line.append(board_cell.dom);
				boardLine.push(board_cell);
			}
		}
	}

	/**
	 * Restore l'état d'un jeu précédemment décrit par la méthode `Game.getDump()`.
	 *
	 * @param {string} dump
	 */
	restoreDump(dump) {
		this.game.restoreDump(dump);
		this.reset();

		for (let y = 0; y != this.game.height; y++) {
			for (let x = 0; x != this.game.width; x++) {
				this.boardCells[y][x].setState(this.game.getCell(x, y).state);
			}
		}
	}
}


module.exports = GoBoard;

