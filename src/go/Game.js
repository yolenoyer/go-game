
const Player = require('./Player');
const CellList = require('./CellList');
const Chain = require('./Chain');
const Cell = require('./Cell');
const ContextCell = require('./ContextCell');
const Url = require('../Url');
const History = require('./History');

const {
	NotAFreeCellException,
	GoException,
	SuicideException,
	KoException,
} = require('../Exceptions.js');


/**
 * Compresse et encode une chaine de caractères.
 *
 * @param {string} s  Chaine à encoder
 *
 * @return {string}
 */
function encode(s) {
	return require('lz-string').compressToEncodedURIComponent(s);
}

/**
 * Décode et décompresse une chaine de caractères.
 *
 * @param {string} s  Chaine à décoder
 *
 * @return {string}
 */
function decode(s) {
	return require('lz-string').decompressFromEncodedURIComponent(s);
}


/**
 * Représente le goban.
 */
class Game {
	/**
	 * Constructeur.
	 *
	 * @param {number} width   Largeur du goban
	 * @param {number} height  Hauteur du goban
	 */
	constructor(width, height) {
		this.reset(width, height);
		this.setDebugMode(false);
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
		this.currentPlayer = Player.BLACK;

		// Création du goban:
		this.goban = [];
		for (let y = 0; y != this.height; y++) {
			let line = []
			this.goban.push(line);

			for (let x = 0; x != this.width; x++) {
				line.push(new Cell(this, x, y));
			}
		}

		// Création d'un nouvel historique de jeu:
		this.history = new History(this);
	}

	/**
	 * Définit le mode debug.
	 *
	 * @param {boolean} state
	 */
	setDebugMode(state) {
		this.debugMode = !!state;
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
	 * @param {number} state  WHITE|BLACK|FREE
	 */
	setCell(x, y, state) {
		this.getCell(x, y).setState(state);
	}

	/**
	 * Définit le joueur courant.
	 */
	setPlayer(player) {
		this.currentPlayer = player;
	}

	/**
	 * Change de joueur courant.
	 */
	togglePlayer() {
		this.currentPlayer = Player.other(this.currentPlayer);
	}

	/**
	 * Loope sur chaque case.
	 *
	 * @param {function} func  Fonction à utiliser (1 paramètre = case)
	 */
	eachCell(func) {
		for (let y = 0; y != this.height; y++) {
			for (let x = 0; x != this.width; x++) {
				func(this.getCell(x, y));
			}
		}
	}

	/**
	 * Pour chaque case, supprime le cache indiquant si le coup est jouable.
	 */
	resetPlayableInformation() {
		this.eachCell(cell => cell.resetPlayableInformation());
	}

	/**
	 * Cherche toutes les chaines existantes du jeu.
	 *
	 * @return {Chain[]}
	 */
	findChains() {
		let chains = [];
		this.eachCell(cell => {
			if (cell.chain && !chains.includes(cell.chain)) {
				chains.push(cell.chain);
			}
		});
		return chains;
	}

	/**
	 * Vérifie si la règle du ko s'applique pour ce tour de jeu.
	 *
	 * @return {boolean}
	 */
	isKoRuleVerifed() {
		let lastTurn = this.history.getLastTurn(2);

		// Si l'historique n'est pas encore assez grand pour revenir de deux coups en arrière:
		if (!lastTurn) {
			return false;
		}

		let oldDump = lastTurn.dump;
		let currentDump = this.getDump();

		return oldDump === currentDump;

	}


	//############################################################################################
	//                                       GAME DUMP:                                         //
	//############################################################################################

	/**
	 * Renvoie une chaine décrivant précisément la partie en cours.
	 *
	 * @param {boolean} encoded  Si =true (défaut), encode la chaine
	 *
	 * @return {string}
	 */
	getDump(encoded=true) {
		let dump = '';

		// Dimensions:
		dump += `${this.width}x${this.height};`;

		// À qui le tour:
		dump += `${Player.toLowerName(this.currentPlayer)};`;

		// Contenu du plateau:
		let first = true;
		for (var y = 0; y != this.height; y++) {
			if (first) {
				first = false;
			} else {
				dump += '|';
			}

			for (var x = 0; x != this.width; x++) {
				dump += Player.toChar(this.getCell(x, y).state);
			}
		}

		if (encoded) {
			dump = encode(dump);
		}

		return dump;
	}

	/**
	 * Restore l'état d'un jeu précédemment décrit par la méthode `getDump()`.
	 *
	 * @param {string} dump
	 * @param {boolean} encoded  Si =true (défaut), la chaine est d'abord décodée
	 */
	restoreDump(dump, encoded=true) {
		try {
			if (encoded) {
				dump = decode(dump);
			}

			let sections = dump.split(';');
			let [ size, currentPlayer, board ] = sections;
			let [ width, height ] = size.split('x').map(n => Number(n));
			let lines = board.split('|');

			this.reset(width, height);
			this.setPlayer(Player.fromLowerName(currentPlayer));

			for (var y = 0; y != height; y++) {
				for (var x = 0; x != width; x++) {
					this.setCell(x, y, Player.fromChar(lines[y][x]));
				}
			}

			this.resetChains();
		}
		catch(e) {
			console.error("La partie demandée n'a pas pu être restaurée:");
			throw e;
		}
	}


	/**
	 * Recalcule l'ensemble des chaines présentes sur le plateau.
	 */
	resetChains() {
		this.eachCell(cell => cell.setChain(null));
		this.eachCell(cell => {
			if (cell.isUsed() && !cell.chain) {
				let chain = cell.findChain();
				chain.setChain(chain);
			}
		});
	}


	//############################################################################################
	//                                      CONTEXT SAVE:                                       //
	//############################################################################################

	/**
	 * Démarre le mode `SaveContext`, utilisé pour tester si une case est autorisée pour un joueur.
	 * Lorsque ce mode est activé, chaque modification sur une case (changement d'état, changement
	 * de chaine) implique une sauvegarde préalable du changement opéré.
	 * Les changements opérés sur chaque case peuvent ainsi être annulés si besoin.
	 */
	startSaveContext() {
		// Active le mode 'SaveContext':
		this.saveContext = true;
		// Stocke le joueur actuel, qui sera restauré en cas d'annulation:
		this.saveCurrentPlayer = this.currentPlayer;
		// Va contenir l'état originel des cases modifiées, qui sera restauré en cas d'annulation:
		this.context = [];
	}

	/**
	 * Interne: Stoppe le mode 'SaveContext'.
	 */
	_stopSaveContext() {
		// Désactive le mode 'SaveContext':
		this.saveContext = false;

		// Supprime les propriétés devenue obsolètes:
		delete this.context;
		delete this.saveCurrentPlayer;
	}

	/**
	 * Annule les modifications opérées sur le jeu depuis l'appel à `startSaveContext()`.
	 */
	restoreSaveContext() {
		// Restore l'état de chaque case modifiée (propriétés `state` et `chain`):
		for (let save_context of this.context) {
			save_context.restore();
		}

		// Redéfinit le joueur courant:
		this.currentPlayer = this.saveCurrentPlayer;

		// Stoppe le mode 'SaveContext':
		this._stopSaveContext();
	}

	/**
	 * Applique le contexte sauvegardé des cases modifiées après un appel à `startSaveContext()`.
	 */
	applySaveContext() {
		this._stopSaveContext();
		this.resetPlayableInformation();
		this.resetFreeZones();
	}

	/**
	 * Cherche si une cellule a été stockée dans le contexte (mode 'SaveContext'), et renvoie
	 * l'objet `ContextCell`correspondant.
	 *
	 * @param {Cell} cell  Cellule à chercher
	 *
	 * @return {ContextCell|undefined}  Contexte sauvegardé de la cellule trouvée, ou undefined si
	 *                                  non-trouvé
	 */
	findContextCell(cell) {
		return this.context.find(context_cell => context_cell.cell === cell);
	}

	/**
	 * Trouve un objet `ContextCell`, ou le crée si non-trouvé.
	 *
	 * @param {Cell} cell  Case associée
	 *
	 * @return {ContextCell}  Objet créé
	 */
	getContextCell(cell) {
		let context_cell = this.findContextCell(cell);
		if (!context_cell) {
			context_cell = new ContextCell(cell);
			this.context.push(context_cell);
		}
		return context_cell;
	}


	//############################################################################################
	//                                     JOUER UN COUP:                                       //
	//############################################################################################

	/**
	 * Effectue un tour de jeu pour le joueur courant.
	 * Si le coup n'est pas autorisé, envoie une exception `GoException` détaillant la raison.
	 *
	 * @param {Cell} cell  Case dans laquelle poser une pierre.
	 *
	 * @return {CellList}  Liste des ennemis capturés
	 */
	_play(cell) {
		if (cell.isUsed()) {
			throw new NotAFreeCellException(cell);
		}

		cell.setState(this.currentPlayer);

		// Crée la chaine pour le nouveau pion, en fusionnant éventuellement avec les chaines amies
		// voisines:
		let new_chain = new Chain(this, [ cell ]);
		for (let friend_chain of cell.getFriendChains()) {
			new_chain.appendChain(friend_chain);
		}
		new_chain.setChain(new_chain);

		// Change de joueur courant:
		if (!this.debugMode) {
			this.togglePlayer();
		}

		// Capture les ennemis à capturer:
		let ennemies_to_capture = cell.getEnnemiesToCapture();
		ennemies_to_capture.capture();

		// Récupère le nombre de libertés que possède la nouvelle chaine de la pierre jouée:
		let nb_liberties = cell.chain.getLiberties().length;

		if (nb_liberties === 0) {
			throw new SuicideException(cell);
		}

		if (this.isKoRuleVerifed()) {
			throw new KoException(cell);
		}

		return ennemies_to_capture;
	}

	/**
	 * Joue la case indiquée (joueur courant). Si ce coup est interdit, restore l'état original et
	 * envoie une exception.
	 *
	 * @param {Cell} cell  Case à jouer
	 *
	 * @return {CellList|null}  Liste des ennemis capturés, ou `null` si le coup est interdit
	 */
	play(cell) {
		this.startSaveContext();

		try {
			// Joue le coup:
			let ennemies_to_capture = this._play(cell);

			// Si le coup était illégal, une exception est envoyée et la suite n'est donc pas
			// exécutée:

			// Applique le coup:
			this.applySaveContext();

			// Sauve le tour dans l'historique:
			this.history.saveLastTurn(cell);

			// Renvoie les ennemis supprimés, afin de les supprimer en mirroir dans le dom:
			return ennemies_to_capture;
		}
		catch (error) {
			if (!(error instanceof GoException)) {
				throw error;
			}

			// Si la chaine n'a aucune liberté, ou que la règle du ko est vérifiée, alors ce coup
			// est interdit, et le coup doit être est annulé:
			this.restoreSaveContext();

			throw error;
		}
	}

	/**
	 * Simule entièrement un coup afin de vérifier s'il est autorisé.
	 *
	 * @param {Cell} cell  Case dans laquelle ouer (joueur courant)
	 *
	 * @return {boolean|GoException}  `true` si le coup est autorisé, sinon une exception
	 */
	getPlayableInformation(cell) {
		let info = true;

		this.startSaveContext();

		try {
			this._play(cell);
		}
		catch (error) {
			if (!(error instanceof GoException)) {
				throw error;
			}
			info = error;
		}

		this.restoreSaveContext();

		return info;
	}

	//############################################################################################
	//                                        CALCUL DES POINTS                                 //
	//############################################################################################

	/**
	 * Supprime toutes les free zones éventuellement définies.
	 */
	resetFreeZones() {
		this.eachCell(cell => cell.resetFreeZone());
	}

	/**
	 * Cherche toutes les zones libres du plateau.
	 *
	 * @return {FreeZone[]}
	 */
	findFreeZones() {
		let free_zones = [];

		this.eachCell(cell => {
			if (cell.isUsed() || cell.freeZone) {
				return;
			}

			let free_zone = cell.findFreeZone();
			free_zone.setCellsFreeZones();
			free_zones.push(free_zone);
		});

		return free_zones;
	}

	/**
	 * Calcule les points en fin de partie.
	 */
	calculatePoints() {
		let free_zones = this.findFreeZones();
	}
}


module.exports = Game;

