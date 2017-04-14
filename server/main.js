import express from 'express';
import webpack from 'webpack';
import webpackConfig from '../build/webpack.config';
import _debug from 'debug';
import config from '../config';
import cookieParser from 'cookie-parser';

import SoundbounceServer from './soundbounce/soundbounce-server';
import compress from 'compression';
import path from 'path';

const debug = _debug('app:server');
const paths = config.utils_paths;
const app = express();

app.use(compress());
app.use(cookieParser());

const soundbounce = new SoundbounceServer(app);

soundbounce.init();


if (config.env === 'development') {
	const compiler = webpack(webpackConfig);

	debug('Enabling webpack dev and HMR middleware');
	app.use(require('webpack-dev-middleware')(compiler, {
		publicPath: webpackConfig.output.publicPath,
		contentBase: paths.base(config.dir_client),
		hot: true,
		quiet: config.compiler_quiet,
		noInfo: config.compiler_quiet,
		lazy: false,
		stats: config.compiler_stats,
		watchOptions: {
			aggregateTimeout: 300,
			poll: true,
			ignored: /node_modules/
		}
	}));

	app.use(require('webpack-hot-middleware')(compiler, {
		path: '/__webpack_hmr'
	}));

	// Serve static assets from ~/public since Webpack is unaware of
	// these files. This middleware doesn't need to be enabled outside
	// of development since this directory will be copied into ~/dist
	// when the application is compiled.
	app.use(express.static(paths.base(config.dir_dist)));

	// This rewrites all routes requests to the root /index.html file
	// (ignoring file requests). If you want to implement universal
	// rendering, you'll want to remove this middleware.
	app.use('*', function (req, res, next) {
		console.log('*');
		const filename = path.join(compiler.outputPath, 'index.html');
		compiler.outputFileSystem.readFile(filename, (err, result) => {
			if (err) {
				return next(err);
			}
			res.set('content-type', 'text/html');
			res.send(result);
			res.end();
		});
	});
} else {
	debug(
		'Server is being run outside of live development mode, meaning it will ' +
		'only serve the compiled application bundle in ~/dist. Generally you ' +
		'do not need an application server for this and can instead use a web ' +
		'server such as nginx to serve your static files. See the "deployment" ' +
		'section in the README for more information on deployment strategies.'
	);

	// Serving ~/dist by default. Ideally these files should be served by
	// the web server and not the app server, but this helps to demo the
	// server in production.
	app.use(express.static(paths.base(config.dir_dist)));
}

/*

// ------------------------------------
// Apply Webpack HMR Middleware
// ------------------------------------
if (config.env === 'development') {
	const compiler = webpack(webpackConfig);

	// Enable webpack-dev and webpack-hot middleware
	const {publicPath} = webpackConfig.output;

	if (config.proxy && config.proxy.enabled) {
		const options = config.proxy.options;
		app.use(convert(webpackProxyMiddleware(options)));
	}

	app.use(webpackDevMiddleware(compiler, publicPath));
	app.use(webpackHMRMiddleware(compiler));

	// Serve static assets from ~/src/static since Webpack is unaware of
	// these files. This middleware doesn't need to be enabled outside
	// of development since this directory will be copied into ~/dist
	// when the application is compiled.
	app.use(convert(serve(paths.client('static'))));
} else {
	// Serving ~/dist by default. Ideally these files should be served by
	// the web server and not the app server, but this helps to demo the
	// server in production.
	app.use(convert(serve(paths.base(config.dir_dist))));
}

app	.use(router.routes())
	.use(router.allowedMethods());


// This rewrites all routes requests to the root /index.html file
// (ignoring file requests). If you want to implement isomorphic
// rendering, you'll want to remove this middleware.

app.use(convert(historyApiFallback({
	verbose: false
})));
*/

export default app;
