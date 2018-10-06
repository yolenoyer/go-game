
const Player = require('./go/Player');


// Noms de classe css des layers à ajouter dans les cases de plateau:
const CellLayers = [ 'piece', 'liberty-mark', 'chain-mark' ];


/**
 * Définit une cellule du plateau (DOM).
 */
class BoardCell {
	/**
	 * Constructeur.
	 *
	 * @param {Board} board  Plateau associé
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(board, x, y) {
		this.board = board;
		this.game = this.board.game;
		this.x = x;
		this.y = y;

		// Associe à la cellule du jeu:
		this.cell = this.game.getCell(x, y);
		this.cell.boardCell = this;

		this.buildDom();
	}

	/**
	 * Construit l'élément Dom de la cellule.
	 */
	buildDom() {
		this.dom = $('<td class="board-cell">');

		// Ajoute les layers permettant d'afficher les pierres, les libertés, les chaines...:
		for (let layer_name of CellLayers) {
			this.dom
				.append($(`<div class="layer ${layer_name}">`)
					.append('<div class="visual">')
				)
		}

		// Ajoute l'élément affichant la grille (il est ajouté en dernier car c'est le seul qui
		// n'est pas en position absolute):
		this.dom
			.append($('<table class="cell">')
				.append($('<tr>')
					.append('<td>')
					.append('<td>')
				)
				.append($('<tr>')
					.append('<td>')
					.append('<td>')
				)
			)

		// Comportement lors du survol d'une case:
		this.dom.mouseover(() => {
			if (this.cell.isAllowed()) {
				// Affiche la pierre en semi-transparence:
				this.setPending(this.game.currentPlayer);

				this.dom.one('mouseout', () => {
					// Annule l'effet de semi-transparence:
					this.setState(this.cell.state);
				})
			} else {
				this.dom.addClass('forbidden');
				this.dom.one('mouseout', () => {
					this.dom.removeClass('forbidden');
				})
			}

			// Gère l'affichage des libertés et des chaines:
			if (!this.cell.isFree()) {
				if (this.board.displayLiberties) {
					let liberties = this.cell.chain.getLiberties();
					this.showMarks(liberties, '.liberty-mark');
				}
				if (this.board.displayChains) {
					this.showMarks(this.cell.chain, '.chain-mark');
				}
			}
		})

		// Comportement lors du clic:
		this.dom.click(() => {
			if (this.cell.isAllowed()) {
				this.setState(this.game.currentPlayer);
				let cells_to_be_captured = this.game.tryPlay(this.cell);
				if (cells_to_be_captured !== null) {
					for (let cell of cells_to_be_captured.cells) {
						cell.boardCell.capture();
					}

					// Émet un évênement indiquant la fin du tour:
					this.board.emit('turn-done');
				}
			}
		})

		// Permet de ne pas afficher les lignes/colonnes extérieures du plateau:
		if (this.x == 0) {
			this.dom.addClass('left');
		}
		if (this.x == this.game.width - 1) {
			this.dom.addClass('right');
		}
		if (this.y == 0) {
			this.dom.addClass('top');
		}
		if (this.y == this.game.height - 1) {
			this.dom.addClass('bottom');
		}
	}

	/**
	 * Affiche des marqueurs de case associés à cette case, et programme leur effacement lorsque la
	 * souris quittera la case.
	 *
	 * @param {CellList} cell_list    Liste de cellules à marquer
	 * @param {string} mark_selector  Sélecteur du layer de la case gérant les marqueur voulus
	 *
	 * @return {Object}  Liste des marqueurs modifiés
	 */
	showMarks(cell_list, mark_selector) {
		let marks = $(cell_list.cells.map(cell =>
			cell.boardCell.dom.find(mark_selector)[0]
		));

		marks.addClass('visible');
		this.dom.one('mouseout', () => {
			marks.removeClass('visible');
		})

		return marks;
	}

	/**
	 * Affiche un état en semi-transparence.
	 *
	 * @param {mixed} state BLACK|WHITE|FREE
	 */
	setPending(state) {
		this.setState(state);
		this.dom.addClass('pending');
	}

	/**
	 * Définit l'état visuel de la cellule.
	 *
	 * @param {mixed} state BLACK|WHITE|FREE
	 */
	setState(state) {
		this.dom.removeClass('black white pending');
		if (Player.isPlayer(state)) {
			this.dom.addClass(Player.toLowerName(state));
		}
	}

	/**
	 * Capture la pièce (au niveau graphique).
	 */
	capture() {
		this.setState(Player.FREE);
	}
}


module.exports = BoardCell;
