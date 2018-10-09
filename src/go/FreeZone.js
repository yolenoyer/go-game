
const CellList = require('./CellList');


/**
 * Représente une zone de cases libres, pour le comptage des points.
 */
class FreeZone extends CellList {
	/**
	 * Constructor.
	 *
	 * @param Game game      Jeu associé
	 * @param {Array} cells  Optionnel: liste de cases initiale
	 */
	constructor(game, cells) {
		super(game, cells);
	}

	/**
	 * Définit la propriété `freeZone` pour toutes les cases de la liste.
	 */
	setFreeZone() {
		this.each(cell => cell.setFreeZone(this));
	}
}


module.exports = FreeZone;

