const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TSconfigPathsWebpackPlugin = require("tsconfig-paths-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ImageminPlugin = require("imagemin-webpack-plugin").default;

const isProduction = process.env.NODE_ENV === "productions";

const babelLoader = {
	loader: "babel-loader",
	options: {
		presets: ["@babel/preset-env", "@babel/preset-react"],
	},
};

const stylesLoaders = [
	{
		loader: "css-loader",
		options: {
			modules: {
				auto: /\.module.(sa|sc|c)ss$/i,
				mode: "pure",
				localeIndentName: "[name]__[local]--[hash:base64:8]",
			},
		},
	},
	{
		loader: "postcss-loader",
		options: {
			postcssOptions: {
				plugins: ["autoprefixer"],
			},
		},
	},
];

const commonConfig = {
	entry: `./src/index.tsx`,
	output: {
		path: path.resolve(__dirname, "build"),
		filename: "[name].bundle.js",
		publicPath: "/",
		clean: true,
		crossOriginLoading: "anonymous",
		module: true,
	},
	resolve: {
		extensions: [".js", ".jsx", ".ts", ".tsx"],
		plugins: [new TSconfigPathsWebpackPlugin()],
	},
	experiments: {
		topLevelAwait: true,
		outputModule: true,
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/i,
				use: babelLoader,
				exclude: /node_modules/,
			},
			{
				test: /.tsx?$/i,
				use: "ts-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.(sa|sc)ss$/i,
				use: ["style-loader", ...stylesLoaders, "sass-loader"],
				exclude: /node_modules/,
			},
			{
				test: /\.css$/i,
				use: ["style-loader", ...stylesLoaders],
				exclude: /node_modules/,
			},
			{
				test: /\.(jpe?g|png|gif|svg|eot|ttf|woff2?)$/i,
				type: "asset",
			},
		],
	},
	plugins: [
		new webpack.ProgressPlugin(),

		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, "./public/assets"),
					to: "assets",
					noErrorOnMissing: true,
				},
			],
		}),

		new HtmlWebpackPlugin({
			template: `./public/index.html`,
			filename: "index.html",
			title: "React Webpack Config",
		}),

		new webpack.ProvidePlugin({
			React: "react",
		}),
	],
};

const productionConfig = {
	mode: "production",
	entry: {
		index: {
			import: `./src/index.tsx`,
			dependOn: ["react"],
		},
		react: ["react", "react-dom"],
	},
	devtool: false,
	output: {
		filename: "js/[name].[contenthash].bundle.js",
		publicPath: "./",
	},
	module: {
		rules: [
			{
				test: /\.(c|sa|sc)ss$/i,
				use: [MiniCssExtractPlugin.loader, ...stylesLoaders, "sass-loader"],
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: "css/[name].[contenthash].css",
			chunkFilename: "[id].css",
		}),

		new ImageminPlugin({
			test: /\.(jpe?g|png|gif|svg)$/i,
		}),
	],
	performance: {
		hints: "warning",
		maxEntrypointSize: 512000,
		maxAssetSize: 512000,
	},
};

const developmentConfig = {
	mode: "development",
	devtool: "inline-source-map",
	devServer: {
		compress: true,
		historyApiFallback: true,
		hot: true,
		open: true,
		port: 8080,
	},
	plugins: [new webpack.HotModuleReplacementPlugin()],
};

module.exports = () => {
	if (isProduction) return merge(commonConfig, productionConfig);

	return merge(commonConfig, developmentConfig);
};
