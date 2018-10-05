
/**
 * Objet permettant de stocker le contexte d'une case (state, chain), pendant qu'un coup est simulé
 * pour tester si celui-ci est autorisé.
 */
class ContextCell {
	/**
	 * Constructor.
	 *
	 * @param {Cell} cell  Case associée
	 */
	constructor(cell) {
		this.cell = cell;
		this.data = {};
	}

	/**
	 * Sauve les données indiquées.
	 *
	 * @param {Object} datas  Données à sauver
	 */
	save(datas) {
		for (let key in datas) {
			if (!(key in this.data)) {
				this.data[key] = datas[key];
			}
		}
	}

	/**
	 * Restore dans la case les données préalablement sauvées.
	 */
	restore() {
		Object.assign(this.cell, this.data);
	}
}


module.exports = ContextCell;

