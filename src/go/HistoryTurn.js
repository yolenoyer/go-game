
/**
 * Représente un tour de jeu.
 */
class HistoryTurn {
	/**
	 * Constructeur.
	 *
	 * @param {History} history  Historique lié
	 * @param {Cell} cell        Case jouée
	 */
	constructor(history, cell) {
		this.history = history;
		this.x = cell.x;
		this.y = cell.y;
		this.player = cell.state;

		// État complet du goban:
		this.dump = this.history.game.getDump();
	}
}


module.exports = HistoryTurn;

