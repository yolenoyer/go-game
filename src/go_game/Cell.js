
const CellList = require('./CellList');
const { otherPlayer } = require('./playerColor.js');


/**
 * Renvoie une liste mergée de toutes les lignes fournies en paramètres
 *
 * @param {Game}  Jeu associé
 * @param {CellList} ...cell_lists
 *
 * @return {CellList}
 */
function mergeCellLists(game, ...cell_lists) {
	let list = new CellList(game);
	for (let cell_list of cell_lists) {
		list.appendCellList(cell_list);
	}
	return list;
}



/**
 * Représente une intersection du goban.
 */
class Cell {
	constructor(game, x, y) {
		this.game = game;
		this.x = x;
		this.y = y;
		this.setState(null);
		this.setChain(null);
	}

	/**
	 * Définit l'état de la case.
	 *
	 * @param {mixed} state BLACK|WHITE|null
	 */
	setState(state) {
		if (this.game.saveContext) {
			this.getContextCell().save({ state: this.state });
		}
		this.state = state;
	}

	/**
	 * Définit la chaine courante de la case.
	 *
	 * @param {Chain} chain
	 */
	setChain(chain) {
		if (this.game.saveContext) {
			this.getContextCell().save({ chain: this.chain });
		}
		this.chain = chain;
	}

	/**
	 * Définit l'état de la case à 'vide'.
	 */
	capture() {
		this.setState(null);
	}

	/**
	 * Renvoie `true`si cette case est vide.
	 */
	isEmpty() {
		return this.state === null;
	}

	/**
	 * Renvoie `true` si la case est jouable par le joueur courant.
	 */
	isAllowed() {
		if (this._isAllowed === undefined) {
			if (!this.isEmpty()) {
				this._isAllowed = false;
			} else {
				this._isAllowed = this.game.isPlayAllowed(this);
			}
		} else {
		}
		return this._isAllowed;
	}

	/**
	 * Supprime le cache pour la valeur de retour de la méthode `isAllowed()`.
	 * Doit être fait sur chaque case après chaque coup.
	 */
	resetIsAllowedCache() {
		delete this._isAllowed;
	}

	/**
	 * Marque une case (afin de chercher une chaine).
	 */
	mark() {
		this.marked = true;
	}

	/**
	 * Supprime la marque de la case.
	 */
	unmark() {
		this.marked = false;
	}

	/**
	 * Renvoie `true` si la case est marquée.
	 */
	isMarked() {
		return !!this.marked;
	}

	/**
	 * Trouve ou crée un `ContextCell` pour cette case.
	 *
	 * @return {ContextCell}
	 */
	getContextCell() {
		return this.game.getContextCell(this);
	}

	/**
	 * Renvoie les cases voisines de la case. La liste renvoyée n'aura jamais plus de quatre
	 * éléments.
	 *
	 * @return {CellList}
	 */
	getNeighbours() {
		if (!this.neighbours) {
			this.neighbours = new CellList(this.game);

			if (this.x > 0) {
				this.neighbours.append(this.game.getCell(this.x - 1, this.y));
			}
			if (this.x < this.game.width - 1) {
				this.neighbours.append(this.game.getCell(this.x + 1, this.y));
			}

			if (this.y > 0) {
				this.neighbours.append(this.game.getCell(this.x, this.y - 1));
			}
			if (this.y < this.game.height - 1) {
				this.neighbours.append(this.game.getCell(this.x, this.y + 1));
			}
		}

		return this.neighbours;
	}

	/**
	 * Renvoie la liste des cases vides voisines de la case.
	 *
	 * @return {CellList}
	 */
	getFreeNeighbours() {
		return this.getNeighbours().getFreeCells();
	}

	/**
	 * Renvoie la liste des cases voisines vides et non-marquées de la case.
	 *
	 * @return {CellList}
	 */
	getFreeUnmarkedNeighbours() {
		return this.getNeighbours().getFreeUnmarkedCells();
	}

	/**
	 * Renvoie les cases voisines d'un joueur donné. La liste renvoyée n'aura jamais plus de quatre
	 * éléments.
	 *
	 * @param {number} player  Joueur concerné
	 *
	 * @return {CellList}
	 */
	getPlayerNeighbours(player) {
		return this.getNeighbours().getFriendsCells(player);
	}

	/**
	 * Renvoie les proches amis de la case. La liste renvoyée n'aura jamais plus de quatre
	 * éléments.
	 *
	 * @return {CellList}
	 */
	getFriends() {
		return this.getPlayerNeighbours(this.state);
	}

	/**
	 * Renvoie les proches ennemis de la case. La liste renvoyée n'aura jamais plus de quatre
	 * éléments.
	 *
	 * @return {CellList}
	 */
	getEnnemies() {
		return this.getPlayerNeighbours(otherPlayer(this.state));
	}

	/**
	 * Renvoie la liste des chaines voisines de la case pour un certain joueur.
	 *
	 * @return {Chain[]}
	 */
	getPlayerChains(player) {
		let neighbour_chains = [];
		for (let neighbour of this.getPlayerNeighbours(player).cells) {
			if (neighbour.chain && !neighbour_chains.includes(neighbour.chain)) {
				neighbour_chains.push(neighbour.chain);
			}
		}
		return neighbour_chains;
	}

	/**
	 * Renvoie la liste des chaines amies des voisins de la case.
	 *
	 * @return {Chain[]}
	 */
	getFriendChains() {
		return this.getPlayerChains(this.state);
	}

	/**
	 * Renvoie toutes les chaînes ennemies voisines.
	 * La liste renvoyée n'aura jamais plus de quatre éléments.
	 *
	 * @return {Chain[]}
	 */
	getEnnemyChains() {
		return this.getPlayerChains(otherPlayer(this.state));
	}

	/**
	 * Renvoie la liste des chaînes ennemies capturables immédiatement.
	 *
	 * @return {Chain[]}
	 */
	getChainsToCapture() {
		let chains = this.getEnnemyChains();
		return chains.filter(chain => chain.getLiberties().length === 0);
	}

	/**
	 * Renvoie la liste des cases ennemies à capturer.
	 *
	 * @return {CellList}
	 */
	getEnnemiesToCapture() {
		let chains_to_capture = this.getChainsToCapture();
		return mergeCellLists(this.game, ...chains_to_capture);
	}
}



module.exports = Cell;

