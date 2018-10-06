
// Constantes définissant l'état d'une case:
const FREE = 1;
const WHITE = 2;
const BLACK = 3;


/**
 * Renvoie `true` si l'état donné est un joueur.
 *
 * @param {number} state
 *
 * @return {boolean}
 */
function isPlayer(state)
{
	return state === WHITE || state === BLACK;
}


/**
 * Renvoie la valeur représentant le joueur opposé.
 *
 * @param {number} player  BLACK|WHITE|FREE
 *
 * @return {number}
 */
function other(player)
{
	switch(player) {
		case(WHITE): return BLACK;
		case(BLACK): return WHITE;
		default    : return FREE;
	}
}


/**
 * Renvoie une chaine de caractères en minuscules représentant le type de case indiqué.
 *
 * @param {number} player  BLACK|WHITE|FREE
 *
 * @return {string}
 */
function toLowerName(player)
{
	switch(player) {
		case(WHITE): return 'black';
		case(BLACK): return 'white';
		default    : return 'free';
	}
}


module.exports = {
	FREE,
	BLACK,
	WHITE,
	isPlayer,
	toLowerName,
	other,
}

