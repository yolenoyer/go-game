
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

		// Le dom affichant la grille du goban:
		this.gobanDiv = this.dom.children('.goban');
		// Le dom affichant le contenu de chaque case (pierres, marqueurs...):
		this.cellsTable = this.dom.children('.cells');

		// Stocke les options d'affichage (boolean) des marqueurs (libertés, chaines):
		this.displayOptions = {};
		// Stocke l'ensemble des éléments marqueur du plateau pour chaque type de marqueur
		// (libertés, chaines):
		this.marks = {};

		// La case actuellement sous le pointeur de la souris:
		this.cellUnderMouse = null;

		// Initialise le plateau:
		this.reset();
	}

	/**
	 * Change le statut d'affichage d'une option (libertés, chaines...).
	 *
	 * @param {boolean} value
	 */
	setShowOption(option_name, value) {
		// Redéfinit la valeur de l'option:
		this.displayOptions[option_name] = value;
		this.marks[option_name].removeClass('visible');
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
		this.marks.liberties = this.$boardCells.find('.liberty-mark');
		this.marks.chains = this.$boardCells.find('.chain-mark');
		this.marks.freezones = this.$boardCells.find('.freezones-mark');
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

