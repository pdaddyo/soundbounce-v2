/**
 * Created by paulbarrass on 02/05/2017.
 */

// all delays in ms
export default {
	// incrementing this forces clients to download new client code in order to connect
	buildVersion: 27,
	spotify: {
		webApiBaseUrl: 'https://api.spotify.com',
		pollPlayerDelay: 5000,
		apiRetryDelay: 3000,
		maxRetry: 5,
		// when playing a track, don't then send a follow-up seek command if position < ms
		minSeekFromStart: 400
	},
	refill: {
		// check if refill is required every 15 mins
		roomRefillDelay: 15 * 60 * 1000
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
