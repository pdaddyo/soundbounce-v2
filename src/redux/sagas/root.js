/**
 * Created by paulbarrass on 19/04/2017.
 */
import spotifyInit from './spotify';
import socketInit from './socket';

export default function * rootSaga() {
	yield [
		spotifyInit(),
		socketInit()
	];
}
