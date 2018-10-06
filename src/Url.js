/**
 * Gère les paramètres d'url.
 */

let url = new URL(window.location.href);

let get = url.searchParams.get.bind(url.searchParams);

module.exports = {
	url,
	debug: get('debug') !== null,
	game: get('game'),
};

