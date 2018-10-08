
const Player = require('./go/Player');
const { NotAFreeCellException } = require('./Exceptions.js');


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
				// Si cette case n'est pas jouable, récupère l'exception qui indique pourquoi:
				let goException = this.cell.getPlayableInformation();

				// Ajoute un attribut html 'title' expliquant pourquoi la case n'est pas jouable, à
				// l'exception du cas trop commun d'une case non-libre:
				if (!(goException instanceof NotAFreeCellException)) {
					this.dom
						.attr('title', goException.message)
				}

				this.dom
					.addClass('forbidden')
					.one('mouseout', () => {
						this.dom
							.removeClass('forbidden')
							.attr('title', '')
					})
			}

			// Gère l'affichage des libertés et des chaines:
			if (!this.cell.isFree()) {
				if (this.board.displayOptions.liberties) {
					let liberties = this.cell.chain.getLiberties();
					this.showMarks(liberties, '.liberty-mark');
				}
				if (this.board.displayOptions.chains) {
					this.showMarks(this.cell.chain, '.chain-mark');
				}
			}
		})

		// Comportement lors du clic:
		this.dom.click(() => {
			if (!this.cell.isAllowed()) {
				return;
			}

			let cells_to_be_captured = this.game.play(this.cell);

			this.setState(this.game.currentPlayer);

			// Supprime visuellement les cellules capturées durant le tour:
			for (let cell of cells_to_be_captured.cells) {
				cell.boardCell.capture();
			}

			// Émet un évênement indiquant la fin du tour:
			this.board.emit('turn-done');
		})
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

