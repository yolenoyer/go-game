
const CellList = require('./CellList');


/**
 * Représente une chaîne dans le jeu de go.
 */
class Chain extends CellList {

	/**
	 * Renvoie la liste des cases de liberté de la chaîne.
	 *
	 * @return {CellList}
	 */
	getLiberties() {
		let liberties = new CellList(this.game);

		for (let cell of this.cells) {
			let empty_unmarked_neighbours = cell.getFreeUnmarkedNeighbours();
			empty_unmarked_neighbours.mark();
			liberties.appendCellList(empty_unmarked_neighbours);
		}

		// Nettoie les marquages utilisés durant le process:
		liberties.unmark();

		return liberties;
	}

	/**
	 * Ajoute à cette chaine les éléments d'une autre chaine.
	 *
	 * @param {Chain|CellList} chain
	 */
	appendChain(chain) {
		this.appendCellList(chain);
	}
}



module.exports = Chain;

