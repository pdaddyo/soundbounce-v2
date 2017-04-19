/**
 * Created by paulbarrass on 19/04/2017.
 */
import spotifyInit from './spotify';

export default function * rootSaga() {
	yield [
		spotifyInit()
	];
}
