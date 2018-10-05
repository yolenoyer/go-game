
const { BLACK, WHITE, otherPlayer } = require('./playerColor');
const CellList = require('./CellList');
const Chain = require('./Chain');
const Cell = require('./Cell');
const ContextCell = require('./ContextCell');


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
	 * Loope sur chaque case.
	 *
	 * @param {function} func  Fonction à utiliser (1 paramètre = case)
	 */
	eachCell(func) {
		for (let y = 0; y != this.height; y++) {
			for (let x = 0; x != this.width; x++) {
				func(this.getCell(x, y));
			}
		}
	}

	/**
	 * Démarre le mode `SaveContext`, utilisé pour tester si une case est autorisée pour un joueur.
	 */
	startSaveContext() {
		this.saveCurrentPlayer = this.currentPlayer;
		this.saveContext = true;
		this.context = [];
	}

	/**
	 * Réinitialise les cases modifiées depuis le commencement du mode 'SaveContext', puis stoppe le
	 * mode.
	 */
	stopSaveContext() {
		this.saveContext = false;
		delete this.context;
	}

	/**
	 * Restore le contexte sauvargé des cases modifiées après un appel à `startSaveContext()`.
	 */
	restoreSaveContext() {
		for (let save_context of this.context) {
			save_context.restore();
		}
		this.currentPlayer = this.saveCurrentPlayer;
		this.stopSaveContext();
	}

	/**
	 * Applique le contexte sauvargé des cases modifiées après un appel à `startSaveContext()`.
	 */
	applySaveContext() {
		this.stopSaveContext();
		this.resetIsAllowedCache();
	}

	/**
	 * Pour chaque case, supprime le cache indiquant si le coup est jouable ici.
	 */
	resetIsAllowedCache() {
		this.eachCell(cell => cell.resetIsAllowedCache());
	}

	/**
	 * Cherche si une cellule a été stockée dans le contexte (mode 'SaveContext'), et renvoie
	 * l'objet `ContextCell`correspondant.
	 *
	 * @param {Cell} cell  Cellule à chercher
	 *
	 * @return {ContextCell|undefined}  Contexte sauvegardé de la cellule trouvée, ou undefined si
	 *                                  non-trouvé
	 */
	findContextCell(cell) {
		return this.context.find(context_cell => context_cell.cell === cell);
	}

	/**
	 * Trouve un objet `ContextCell`, ou le crée si non-trouvé.
	 *
	 * @param {Cell} cell  Case associée
	 *
	 * @return {ContextCell}  Objet créé
	 */
	getContextCell(cell) {
		let context_cell = this.findContextCell(cell);
		if (!context_cell) {
			context_cell = new ContextCell(cell);
			this.context.push(context_cell);
		}
		return context_cell;
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

	/**
	 * Tente de jouer la case indiquée (joueur courant). Si ce coup est interdit, restore l'état
	 * original.
	 *
	 * @param {Cell} cell  Case à jouer
	 *
	 * @return {CellList}  Liste des ennemis capturés
	 */
	tryPlay(cell) {
		this.startSaveContext();

		let ennemies_to_capture = this.play(cell);

		let nb_liberties = cell.chain.getLiberties().length;
		if (nb_liberties === 0) {
			this.restoreSaveContext();
			return null;
		} else {
			this.applySaveContext();
			return ennemies_to_capture;
		}
	}

	/**
	 * Simule entièrement un coup, puis annule les changements d'état effectués.
	 * Renvoie `true` si le coup est autorisé.
	 *
	 * @param {Cell} cell  Case dans laquelle ouer (joueur courant)
	 *
	 * @return {boolean}  `true` si le coup est autorisé
	 */
	isPlayAllowed(cell) {
		this.startSaveContext();

		this.play(cell);
		let nb_liberties = cell.chain.getLiberties().length;

		this.restoreSaveContext();
		return nb_liberties !== 0;
	}
}


module.exports = Game;

