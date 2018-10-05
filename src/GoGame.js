
// Constantes définissant l'état d'une case:
const WHITE = 1;
const BLACK = 2;


/**
 * Renvoie une liste mergée de toutes les lignes fournies en paramètres
 *
 * @param {GoGame}  Jeu associé
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
 * Renvoie la valeur représentant le joueur opposé.
 *
 * @param {number} player  BLACK|WHITE
 *
 * @return {number}
 */
function otherPlayer(player)
{
	if (player === WHITE) return BLACK;
	if (player === BLACK) return WHITE;
	return null;
}


/**
 * Représente un groupe de cases.
 */
class CellList {
	/**
	 * Constructeur.
	 *
	 * @param GoGame game    Jeu associé
	 * @param {Array} cells  Optionnels: liste de cases initiale
	 */
	constructor(game, cells) {
		this.game = game;
		this.cells = cells || [];
	}

	/**
	 * Renvoie la taille de la chaîne.
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
	 * @param chain
	 */
	setChain(chain) {
		for(let cell of this.cells) {
			cell.setChain(chain);
		}
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
		return this.getFilteredList(cell => cell.isEmpty());
	}

	/**
	 * Renvoie la liste des cases vides et non-marquées.
	 *
	 * @return {CellList}
	 */
	getFreeUnmarkedCells() {
		return this.getFilteredList(cell => cell.isEmpty() && !cell.isMarked());
	}

	/**
	 * Renvoie uniquement les cases appartenant à un joueur donné.
	 *
	 * @return {CellList}
	 */
	getFriendsCells(player) {
		return this.getFilteredList(cell => cell.state === player);
	}

}



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
		this.state = state;
	}

	/**
	 * Définit la chaine courante de la case.
	 *
	 * @param {Chain} chain
	 */
	setChain(chain) {
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
		return this.state === null;
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
	 * Renvoie les proches amis de la case. La liste renvoyée n'aura jamais plus de quatre
	 * éléments.
	 *
	 * @return {CellList}
	 */
	getFriends() {
		if (this.isEmpty()) {
			return [];
		}
		return this.getNeighbours().getFriendsCells(this.state);
	}

	/**
	 * Renvoie les proches ennemis de la case. La liste renvoyée n'aura jamais plus de quatre
	 * éléments.
	 *
	 * @return {CellList}
	 */
	getEnnemies() {
		if (this.isEmpty()) {
			return [];
		}
		return this.getNeighbours().getFriendsCells(otherPlayer(this.state));
	}

	/**
	 * Renvoie la liste des chaines amies des voisin de la case.
	 *
	 * @return {Chain[]}
	 */
	getFriendChains() {
		let friend_chains = [];
		for (let friend of this.getFriends().cells) {
			if (friend.chain && !friend_chains.includes(friend.chain)) {
				friend_chains.push(friend.chain);
			}
		}
		return friend_chains;
	}

	/**
	 * Renvoie toutes les chaînes ennemies voisines.
	 * La liste renvoyée n'aura jamais plus de quatre éléments.
	 *
	 * @return {Chain[]}
	 */
	getEnnemyChains() {
		let ennemy_chains = [];
		for (let ennemy of this.getEnnemies().cells) {
			if (ennemy.chain && !ennemy_chains.includes(ennemy.chain)) {
				ennemy_chains.push(ennemy.chain);
			}
		}
		return ennemy_chains;
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



/**
 * Représente le goban.
 */
class GoGame {
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


module.exports = {
	GoGame,
	BLACK,
	WHITE,
};

