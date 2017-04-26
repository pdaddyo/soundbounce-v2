import express from 'express';
import webpack from 'webpack';
import webpackConfig from '../build/webpack.config';
import _debug from 'debug';
import config from '../config';
import cookieParser from 'cookie-parser';
import fs from 'fs';

import SoundbounceServer from './soundbounce/app/Server';
import compress from 'compression';
import path from 'path';

const debug = _debug('soundbounce:server');
const paths = config.utils_paths;
const app = express();
const compiler = webpack(webpackConfig);

app.use(compress());
app.use(cookieParser());

const soundbounce = new SoundbounceServer(app);
soundbounce.init();

if (config.env === 'development') {
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

// Serve static assets (nginx could do this instead in future, although cloudflare will cache)
app.use(express.static(paths.base(config.dir_dist)));

// This rewrites all routes requests to the root /index.html file
// (ignoring file requests). If you want to implement universal
// rendering, you'll want to remove this middleware.
app.use('*', function (req, res, next) {
	const filename = path.join(compiler.outputPath, 'index.html');
	const fs = compiler.outputFileSystem || fs;
	fs.readFile(filename, (err, result) => {
		if (err) {
			return next(err);
		}
		res.set('content-type', 'text/html');
		res.send(result);
		res.end();
	});

});

export default app;
