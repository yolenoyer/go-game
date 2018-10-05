
// Constantes définissant l'état d'une case:
const WHITE = 1;
const BLACK = 2;


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


module.exports = {
	BLACK,
	WHITE,
	otherPlayer,
}

