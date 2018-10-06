
const Player = require('./Player');
const CellList = require('./CellList');
const Chain = require('./Chain');
const Cell = require('./Cell');
const ContextCell = require('./ContextCell');
const Url = require('../Url');


/**
 * Compresse et encode en base64 une chaine de caractères.
 *
 * @param {string} s  Chaine à encoder
 *
 * @return {string}
 */
function encode(s) {
	return require('lz-string').compressToBase64(s);
}

/**
 * Décode (base64) et décompresse une chaine de caractères.
 *
 * @param {string} s  Chaine à décoder
 *
 * @return {string}
 */
function decode(s) {
	return require('lz-string').decompressFromBase64(s);
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
	resetIsAllowedCache() {
		this.eachCell(cell => cell.resetIsAllowedCache());
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
		if (encoded) {
			dump = decode(dump);
		}

		let sections = dump.split(';');
		let [ size, currentPlayer, board ] = sections;
		let [ width, height ] = size.split('x').map(n => Number(n));
		let lines = board.split('|');

		this.reset(width, height);
		this.setPlayer(Player.fromLowerName(currentPlayer));

		for (var y = 0; y != this.height; y++) {
			for (var x = 0; x != this.width; x++) {
				this.setCell(x, y, Player.fromChar(lines[y][x]));
			}
		}

		this.resetChains();
	}


	/**
	 * Recalcule l'ensemble des chaines présentes sur le plateau.
	 */
	resetChains() {
		this.eachCell(cell => cell.setChain(null));
		this.eachCell(cell => {
			if (!cell.isFree() && !cell.chain) {
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
		this.resetIsAllowedCache();
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
	 *
	 * @param {Cell} cell  Case dans laquelle poser une pierre.
	 *
	 * @return {CellList}  Liste des ennemis capturés
	 */
	_play(cell) {
		cell.setState(this.currentPlayer);

		// Crée la chaine pour le nouveau pion, en fusionnant éventuellement avec les chaines amies
		// voisines:
		let new_chain = new Chain(this, [ cell ]);
		for (let friend_chain of cell.getFriendChains()) {
			new_chain.appendChain(friend_chain);
		}
		new_chain.setChain(new_chain);

		// Change de joueur courant:
		if (!Url.debug) {
			this.togglePlayer();
		}

		// Capture les ennemis à capturer:
		let ennemies_to_capture = cell.getEnnemiesToCapture();
		ennemies_to_capture.capture();

		return ennemies_to_capture;
	}

	/**
	 * Tente de jouer la case indiquée (joueur courant). Si ce coup est interdit, restore l'état
	 * original.
	 *
	 * @param {Cell} cell  Case à jouer
	 *
	 * @return {CellList|null}  Liste des ennemis capturés, ou `null` si le coup est interdit
	 */
	tryPlay(cell) {
		this.startSaveContext();

		let ennemies_to_capture = this._play(cell);

		// Récupère le nombre de libertés que possède la nouvelle chaine de la pierre jouée:
		let nb_liberties = cell.chain.getLiberties().length;

		if (nb_liberties === 0) {
			// Si la chaine n'a aucune liberté, alors ce coup est interdit, et le coup est annulé:
			this.restoreSaveContext();
			return null;
		} else {
			// Si la chaine a au moins une liberté, alors le coup est appliqué:
			this.applySaveContext();
			return ennemies_to_capture;
		}
	}

	/**
	 * Simule entièrement un coup afin de vérifier s'il est autorisé.
	 * Renvoie `true` si le coup est autorisé.
	 *
	 * @param {Cell} cell  Case dans laquelle ouer (joueur courant)
	 *
	 * @return {boolean}  `true` si le coup est autorisé
	 */
	isPlayAllowed(cell) {
		this.startSaveContext();

		this._play(cell);
		let nb_liberties = cell.chain.getLiberties().length;

		this.restoreSaveContext();

		return nb_liberties !== 0;
	}
}


module.exports = Game;

