/**
 * Created by paulbarrass on 02/05/2017.
 */
export default {
	buildVersion: 5,
	spotify: {
		webApiBaseUrl: 'https://api.spotify.com',
		pollPlayerDelay: 5000,
		apiRetryDelay: 3000,
		maxRetry: 5,
		// when playing a track, don't then send a follow-up seek command if position < ms
		minSeekFromStart: 400
	},
	playlist: {
		recentlyPlayedMaxLength: 5,
		playlistMaxLength: 300,
		actionLogMaxLength: 350
	},
	player: {
		progressUpdateDelay: 700,
		maxDriftConsideredSynced: 15000,
		maxTracksToQueueWhenPlaying: 10,
		strictSync: false
	},
	unfurling: {
		url: 'https://v2.soundbounce.org/iframely'
	}
};
