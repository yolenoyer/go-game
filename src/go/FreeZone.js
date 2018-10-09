
const CellList = require('./CellList');


/**
 * Représente une zone de cases libres, pour le comptage des points.
 */
class FreeZone extends CellList {
	/**
	 * Constructor.
	 */
	constructor(game) {
		super(game);
	}
}


module.exports = FreeZone;

