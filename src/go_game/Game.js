
const { BLACK, WHITE, otherPlayer } = require('./playerColor');
const CellList = require('./CellList');
const Chain = require('./Chain');
const Cell = require('./Cell');


/**
 * Représente le goban.
 */
class Game {
	/**
	 * Constructeur.
	 *
	 * @param {number} width   Largeur du goban
	 * @param {number} height  Hauteur du goban
	 */
	constructor(width, height) {
		this.reset(width, height);
	}

	/**
	 * Réinitialise le jeu.
	 *
	 * @param {number} width   Largeur du goban
	 * @param {number} height  Hauteur du goban
	 */
	reset(width, height) {
		this.width = width;
		this.height = height;

		// Les noirs commencent:
		this.currentPlayer = BLACK;

		// Liste de toutes les chaines actuelles:
		this.chains = [];

		// Création du goban:
		this.goban = [];
		for (let y = 0; y != this.height; y++) {
			let line = []
			this.goban.push(line);

			for (let x = 0; x != this.width; x++) {
				line.push(new Cell(this, x, y));
			}
		}
	}

	/**
	 * Renvoie une case (intersection) particulière du goban.
	 *
	 * @param {number} x
	 * @param {number} y
	 *
	 * @return {Cell}
	 */
	getCell(x, y) {
		return this.goban[y][x];
	}

	/**
	 * Définit l'état d'un case particulière du goban.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} state  WHITE|BLACK|null
	 */
	setCell(x, y, state) {
		this.getCell(x, y).setState(state);
	}

	/**
	 * Change de joueur courant.
	 */
	togglePlayer() {
		this.currentPlayer = otherPlayer(this.currentPlayer);
	}

	/**
	 * Effectue un tour de jeu pour le joueur courant.
	 *
	 * @param {Cell} cell  Case dans laquelle poser une pierre.
	 *
	 * @return {CellList}  Liste des ennemis capturés
	 */
	play(cell) {
		cell.setState(this.currentPlayer);

		// Crée la chaine pour le nouveau pion, en fusionnant éventuellement avec les chaines amies
		// voisines:
		let new_chain = new Chain(this, [ cell ]);
		for (let friend_chain of cell.getFriendChains()) {
			new_chain.appendChain(friend_chain);
		}
		new_chain.setChain(new_chain);

		// Change de joueur courant:
		this.togglePlayer();

		// Capture les ennemis à capturer:
		let ennemies_to_capture = cell.getEnnemiesToCapture();
		ennemies_to_capture.capture();

		return ennemies_to_capture;
	}
}


module.exports = Game;

