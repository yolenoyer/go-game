
/**
 * Représente une liste de cases.
 */
class CellList {
	/**
	 * Constructeur.
	 *
	 * @param Game game      Jeu associé
	 * @param {Array} cells  Optionnel: liste de cases initiale
	 */
	constructor(game, cells) {
		this.game = game;
		this.cells = cells || [];
	}

	/**
	 * Renvoie la taille de la liste.
	 *
	 * @return {number}
	 */
	get length() {
		return this.cells.length;
	}

	/**
	 * Supprime la marque de toutes les cases de la liste.
	 */
	unmark()
	{
		this.cells.map(cell => cell.unmark());
	}


	/**
	 * Marque toutes les cases de la liste.
	 */
	mark()
	{
		this.cells.map(cell => cell.mark());
	}

	/**
	 * Définit une nouvelle chaine pour toutes les cases de la liste.
	 *
	 * @param {Chain} chain
	 */
	setChain(chain) {
		this.cells.map(cell => cell.setChain(chain));
	}

	/**
	 * Enlève du plateau tous les pions de la liste.
	 */
	capture() {
		this.cells.map(cell => cell.capture());
	}

	/**
	 * Ajoute des cases à cette liste.
	 *
	 * @param {Cell} ...cells
	 */
	append(...cells) {
		this.cells.push(...cells);
	}

	/**
	 * Ajoute à cette liste les éléments d'une autre liste.
	 *
	 * @param {CellList} list
	 */
	appendCellList(list) {
		this.cells.push(...list.cells);
	}

	/**
	 * Retourne une nouvelle liste filtrée par la fonction donnée.
	 *
	 * @param {function} filter
	 *
	 * @return {CellList}
	 */
	getFilteredList(filter) {
		return new CellList(this.game, this.cells.filter(filter));
	}

	/**
	 * Renvoie la liste des cases vides de la liste.
	 *
	 * @return {CellList}
	 */
	getFreeCells() {
		return this.getFilteredList(cell => cell.isFree());
	}

	/**
	 * Renvoie la liste des cases non-marquées.
	 *
	 * @return {CellList}
	 */
	getUnmarkedCells() {
		return this.getFilteredList(cell => !cell.isMarked());
	}

	/**
	 * Renvoie la liste des cases vides et non-marquées.
	 *
	 * @return {CellList}
	 */
	getFreeUnmarkedCells() {
		return this.getFilteredList(cell => cell.isFree() && !cell.isMarked());
	}

	/**
	 * Renvoie uniquement les cases appartenant à un joueur donné.
	 *
	 * @return {CellList}
	 */
	getPlayerCells(player) {
		return this.getFilteredList(cell => cell.state === player);
	}

}



module.exports = CellList;

