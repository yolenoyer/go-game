
// Constantes définissant l'état d'une case:
const FREE = 1;
const BLACK = 2;
const WHITE = 3;


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
		case(WHITE): return 'white';
		case(BLACK): return 'black';
		default    : return 'free';
	}
}
/**
 * Renvoie un type de case à partir d'une chaine de caractères en minuscules.
 *
 * @param {string} player
 *
 * @return {number}
 */
function fromLowerName(player)
{
	switch(player) {
		case('white'): return WHITE;
		case('black'): return BLACK;
		default  : return FREE;
	}
}


/**
 * Renvoie un caractère en minuscules représentant le type de case indiqué.
 *
 * @param {number} player  BLACK|WHITE|FREE
 *
 * @return {string}
 */
function toChar(player)
{
	switch(player) {
		case(WHITE): return 'w';
		case(BLACK): return 'b';
		default    : return '.';
	}
}
/**
 * Renvoie un type de case à partir d'un caractère en minuscules.
 *
 * @param {string} player
 *
 * @return {number}
 */
function fromChar(player)
{
	switch(player) {
		case('w'): return WHITE;
		case('b'): return BLACK;
		default  : return FREE;
	}
}


module.exports = {
	FREE,
	BLACK,
	WHITE,
	isPlayer,
	toLowerName, fromLowerName,
	toChar, fromChar,
	other,
}

