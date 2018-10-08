
const HistoryTurn = require('./HistoryTurn');


/**
 * Gère un historique de tous les coups de la partie.
 */
class History {
	/**
	 * Constructeur.
	 *
	 * @param {Game} game  Jeu associé
	 * @param {Cell} cell  Case jouée
	 */
	constructor(game) {
		this.game = game;
		// Historique des coups:
		this.turns = [];
	}

	/**
	 * Sauve le jeu en cours.
	 *
	 * @return {HistoryTurn}  L'instance d'historique créée
	 */
	saveLastTurn(cell) {
		let history_turn = new HistoryTurn(this, cell);
		this.turns.push(history_turn);
		return history_turn;
	}

	/**
	 * Renvoie le nième dernier coup joué.
	 *
	 * @param {number} n
	 *
	 * @return {HistoryTurn|undefined}
	 */
	getLastTurn(n=1) {
		if (this.turns.length < n) {
			return undefined;
		}
		return this.turns[this.turns.length - n];
	}
}


module.exports = History;

