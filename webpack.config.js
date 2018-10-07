
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
		rules: [
			{
				test: /\.scss$/,
				use: [
					"style-loader", // creates style nodes from JS strings
					"css-loader", // translates CSS into CommonJS
					{
						loader: "postcss-loader",
						options: {
							plugins: [
								require('autoprefixer'),
							]
						},
					},
					"sass-loader" // compiles Sass to CSS, using Node Sass by default
				]
			}, {
				test: /\.jpg|\.png/,
				use: [
					"file-loader",
					{
						loader: 'image-webpack-loader',
						options: {
							mozjpeg: {
								progressive: true,
								quality: 35
							},
						}
					},
				],
			},
		],
	},
	plugins: [
		new CopyWebpackPlugin([
		  { from: 'node_modules/font-awesome/css', to: 'font-awesome/css' },
		  { from: 'node_modules/font-awesome/fonts', to: 'font-awesome/fonts' },
		])
	],
};


