import {applyMiddleware, createStore, compose} from 'redux';
import rootReducer from './rootReducer';
import createSagaMiddleware, {END} from 'redux-saga';
import rootSaga from './sagas/root';
import socketClient from '../socketClient/client';
import {routerMiddleware} from 'react-router-redux';
import {browserHistory} from 'react-router';

export default function configureStore(initialState = {}) {
	const sagaMiddleware = createSagaMiddleware();
	let composeEnhancers = compose;
	if (window.__REDUX_DEVTOOLS_EXTENSION__) {
		composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
			maxAge: 32,
			actionsBlacklist: ['ROOM_TRACK_PROGRESS']
		});
	}
	const middleware = composeEnhancers(
		applyMiddleware(sagaMiddleware, routerMiddleware(browserHistory))
	);
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
