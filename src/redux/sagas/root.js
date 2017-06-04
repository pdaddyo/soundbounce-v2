/**
 * Created by paulbarrass on 19/04/2017.
 */
import spotifyInit from './spotify';
import socketInit from './socket';
import roomInit from './room';
import unfurlingInit from './unfurling';

export default function * rootSaga() {
	yield [
		spotifyInit(),
		socketInit(),
		roomInit(),
		unfurlingInit()
	];
}
