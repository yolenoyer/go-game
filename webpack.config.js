
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
	devtool: 'source-map',
	devServer: {
		contentBase: './dist'
	},
	entry: {
		main: './src/index.js',
		vendor: './node_modules/jquery/dist/jquery.min.js',
	},
	module: {
		rules: [{
			test: /\.scss$/,
			use: [
				"style-loader", // creates style nodes from JS strings
				"css-loader", // translates CSS into CommonJS
				"sass-loader" // compiles Sass to CSS, using Node Sass by default
			]
		}],
	},
	plugins: [
		new CopyWebpackPlugin([
		  { from: 'node_modules/font-awesome', to: 'font-awesome' },
		])
	],
};


