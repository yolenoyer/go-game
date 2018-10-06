
let url = new URL(window.location.href);
let search = url.searchParams;

module.exports = {
	url,
	debug: search.get('debug') !== null,
};

