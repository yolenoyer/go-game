
// Constantes définissant l'état d'une case:
const WHITE = 1;
const BLACK = 2;


/**
 * Supprime la marque de toutes les cases données.
 *
 * @param {Cell[]} cells  Liste de cases
 */
function unmarkCells(cells)
{
	cells.map(cell => cell.unmark());
}


/**
 * Marque toutes les cases données.
 *
 * @param {Cell[]} cells  Liste de cases
 */
function markCells(cells)
{
	cells.map(cell => cell.mark());
}



/**
 * Represénte une chaîne dans le jeu de go.
 */
class Chain {
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
	 * Supprime la marque de toutes les cases de la chaîne.
	 */
	unmark() {
		unmarkCells(this.cells);
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
	 * Renvoie la liste des cases de liberté de la chaîne.
	 *
	 * @return {Cell[]}
	 */
	getLiberties() {
		let liberties = [];

		for (let cell of this.cells) {
			let empty_unmarked_neighbours = cell.getFreeUnmarkedNeighbours();
			markCells(empty_unmarked_neighbours);
			liberties.push(...empty_unmarked_neighbours);
		}

		// Nettoie les marquages utilisés durant le process:
		unmarkCells(liberties);

		return liberties;
	}

	/**
	 * Enlève du plateau tous les pions de la chaîne.
	 */
	capture() {
		this.cells.map(cell => cell.capture());
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
	 * @return {Cell[]}
	 */
	getNeighbours() {
		let neighbours = [];

		if (this.x > 0) {
			neighbours.push(this.game.getCell(this.x - 1, this.y));
		}
		if (this.x < this.game.width - 1) {
			neighbours.push(this.game.getCell(this.x + 1, this.y));
		}

		if (this.y > 0) {
			neighbours.push(this.game.getCell(this.x, this.y - 1));
		}
		if (this.y < this.game.height - 1) {
			neighbours.push(this.game.getCell(this.x, this.y + 1));
		}

		return neighbours;
	}

	/**
	 * Renvoie la liste des cases vides voisines de la case.
	 *
	 * @return {Cell[]}
	 */
	getFreeNeighbours() {
		return this.getNeighbours().filter(neighbour => neighbour.isEmpty());
	}

	/**
	 * Renvoie la liste des cases voisines vides et non-marquées de la case.
	 *
	 * @return {Cell[]}
	 */
	getFreeUnmarkedNeighbours() {
		return this.getNeighbours().filter(
			neighbour => neighbour.isEmpty() && !neighbour.isMarked()
		);
	}

	/**
	 * Renvoie les proches amis de la case. La liste renvoyée n'aura jamais plus de quatre
	 * éléments.
	 *
	 * @return {Cell[]}
	 */
	getFriends() {
		if (this.isEmpty()) {
			return [];
		}
		return this.getNeighbours().filter(neighbour => neighbour.state === this.state);
	}

	/**
	 * Renvoie les proches ennemis de la case. La liste renvoyée n'aura jamais plus de quatre
	 * éléments.
	 *
	 * @return {Cell[]}
	 */
	getEnnemies() {
		if (this.isEmpty()) {
			return [];
		}
		return this.getNeighbours().filter(
			neighbour => !neighbour.isEmpty() && neighbour.state !== this.state
		);
	}
	
	/**
	 * Renvoie la liste des amis non-marqués.
	 *
	 * @return {Cell[]}
	 */
	getUnmarkedFriends() {
		return this.getFriends().filter(friend => !friend.isMarked());
	}

	/**
	 * Fonction récursive pour `this.getChain()`.
	 *
	 * @return {Cell[]}
	 */
	_getChainedFriends() {
		let friends = [];
		let unmarked_friends = this.getUnmarkedFriends();

		friends.push(...unmarked_friends);

		// Marque les éléments amis:
		markCells(unmarked_friends);
		this.mark();

		// Ajoute récursivement les éléments amis d'amis d'amis...:
		for (let friend of unmarked_friends) {
			let friends_of_friend = friend._getChainedFriends();
			friends.push(...friends_of_friend);
		}

		return friends;
	}

	/**
	 * Retourne la chaine à laquelle appartient cette cellule.
	 *
	 * @param {boolean} unmark  Interne: si =`false`, ne nettoie pas les marquages utilisés
	 *
	 * @return {Chain}
	 */
	getChain(unmark = true) {
		if (this.isEmpty() || this.isMarked()) {
			return [];
		}

		let cells = this._getChainedFriends();
		cells.push(this);

		// Nettoie les marquages utilisés durant le process:
		if (unmark) {
			unmarkCells(cells);
		}

		return new Chain(this.game, cells);
	}

	/**
	 * Renvoie toutes les chaînes ennemies voisines.
	 * La liste renvoyée n'aura jamais plus de quatre éléments.
	 *
	 * @return {Chain[]}
	 */
	getEnnemyChains() {
		let chains = [];
		let ennemies = this.getEnnemies();
		for (let ennemy of ennemies) {
			if (!ennemy.isMarked()) {
				// Récupère la chaîne de l'ennemi, sans nettoyer les marquages des cases:
				let ennemy_chain = ennemy.getChain(false);
				chains.push(ennemy_chain);
			}
		}

		// Nettoie tous les marquages utilisés durant le process:
		chains.map(chain => chain.unmark());

		return chains;
	}

	/**
	 * Renvoie la liste des chaînes capturables immédiatement.
	 *
	 * @return {Chain[]}
	 */
	checkCapturedChains() {
		let chains = this.getEnnemyChains();
		return chains.filter(chain => chain.getLiberties().length === 0);
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
		switch (this.currentPlayer) {
			case WHITE:
				this.currentPlayer = BLACK;
				break;
			case BLACK:
				this.currentPlayer = WHITE;
		}
	}

	/**
	 * Effectue un tour de jeu pour le joueur courant.
	 *
	 * @param {Cell} cell  Case dans laquelle poser une pierre.
	 */
	play(cell) {
		cell.setState(this.currentPlayer);

		// Vérifie si des pions ont été supprimés:
		let chains_to_be_captured = cell.checkCapturedChains();

		// Capture tous les pions (en mémoire):
		chains_to_be_captured.map(chain => chain.capture());

		this.togglePlayer();

		let cells_to_be_captured = [];
		for (let chain of chains_to_be_captured) {
			cells_to_be_captured.push(...chain.cells);
		}

		return cells_to_be_captured;
	}
}


module.exports = {
	GoGame,
	BLACK,
	WHITE,
};

