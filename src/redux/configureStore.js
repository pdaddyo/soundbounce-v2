import {applyMiddleware, createStore} from 'redux';
import rootReducer from './rootReducer';
import createSagaMiddleware, {END} from 'redux-saga';
import rootSaga from './sagas/root';
import socketClient from '../socketClient/client';

export default function configureStore(initialState = {}) {
	// Compose final middleware and use devtools in debug environment
	const sagaMiddleware = createSagaMiddleware();
	let middleware = applyMiddleware(sagaMiddleware);

	// todo: disable login for production once stable
	if (true) { // __DEBUG__) {
		const createLogger = require('redux-logger');
		const logger = createLogger({collapsed: true});
		middleware = applyMiddleware(sagaMiddleware, logger);
	}

	// Create final store and subscribe router in debug env ie. for devtools
	const store = middleware(createStore)(rootReducer, initialState);

	// hot reloading support for reducers
	if (module.hot) {
		module.hot.accept('./rootReducer', () => {
			const nextRootReducer = require('./rootReducer').default;
			store.replaceReducer(nextRootReducer);
		});
	}

	store.runSaga = sagaMiddleware.run;
	store.close = () => store.dispatch(END);

	// connect the socket client to the store
	socketClient.setStore(store);

	// start up the root saga
	sagaMiddleware.run(rootSaga);
	return store;
}
