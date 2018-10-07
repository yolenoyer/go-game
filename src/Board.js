
const EventEmitter = require('eventemitter3');

const BoardCell = require('./BoardCell');


/**
 * Représente le plateau de jeu (DOM).
 */
class Board extends EventEmitter {
	/**
	 * Constructeur.
	 *
	 * @param {JQueryDOM} dom  Cible dans laquelle créer le tableau de jeu
	 * @param {Game} game      Gestionnaire du jeu (en aveugle)
	 */
	constructor(dom, game) {
		super();

		this.dom = dom;
		this.game = game;

		this.gobanDiv = this.dom.children('.goban');
		this.cellsTable = this.dom.children('.cells');

		// Initialise le plateau:
		this.reset();
	}

	/**
	 * Change le statut d'affichage des libertés.
	 *
	 * @param {boolean} value
	 */
	setDisplayLiberties(value) {
		this.displayLiberties = value;
		this.libertyMarks.removeClass('visible');
	}

	/**
	 * Change le statut d'affichage des chaines.
	 *
	 * @param {boolean} value
	 */
	setDisplayChains(value) {
		this.displayChains = value;
		this.chainMarks.removeClass('visible');
	}

	/**
	 * Réinitialise le plateau.
	 */
	reset() {
		// Création du goban:

		this.gobanTable = $('<table>');
		this.gobanDiv.empty().append(this.gobanTable);

		for (let y = 0; y != this.game.height - 1; y++) {
			let line = $('<tr>');
			this.gobanTable.append(line);

			for (let x = 0; x != this.game.width - 1; x++) {
				line.append('<td>');
			}
		}

		// Création des cellules du plateau:

		this.cellsTable.empty();
		this.boardCells = [];

		for (let y = 0; y != this.game.height; y++) {
			let line = $('<tr>');
			this.cellsTable.append(line);

			let boardLine = [];
			this.boardCells.push(boardLine);

			for (let x = 0; x != this.game.width; x++) {
				let board_cell = new BoardCell(this, x, y);
				line.append(board_cell.dom);
				boardLine.push(board_cell);
			}
		}

		this.$boardCells = this.cellsTable.find('.board-cell');
		this.libertyMarks = this.$boardCells.find('.liberty-mark');
		this.chainMarks = this.$boardCells.find('.chain-mark');
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


module.exports = Board;

