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

	debug('DEV MODE - Enabling webpack dev and HMR middleware');
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

} else {
	// production server mode
	debug('PRODUCTION MODE - hot reloading disabled');
}

// shared between dev + prod servers

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

export default app;
