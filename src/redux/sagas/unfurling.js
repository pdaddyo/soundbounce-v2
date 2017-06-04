import config from '../../../config/app';
import {put, takeEvery} from 'redux-saga/effects';
import {
	linkUnfurlingRequestOk,
	actions as unfurlingActions
} from '../modules/unfurling';

function * fetchUrlInfo({payload: {url}}) {
	// request from our hosted link unfurling api
	const json = yield fetch(`${config.unfurling.url}?url=${
		encodeURIComponent(url)
		}&align=left&media=1`, {
		method: 'GET'
	}).then(response => response.json())
		.catch(error => console.log(error));

	if (json) {
		// store the result
		yield put(linkUnfurlingRequestOk({json, url}));
	}
}

function * watchForUnfurlingRequestStart() {
	yield takeEvery(unfurlingActions.LINK_UNFURLING_REQUEST_START, fetchUrlInfo);
}

export default function * unfurlingInit() {
	try {
		yield [
			watchForUnfurlingRequestStart()
		];
	} catch (err) {
		console.log('unhandled unfurling saga error: ' + err);
		throw err;
	}
}
