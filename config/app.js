/**
 * Created by paulbarrass on 02/05/2017.
 */
export default {
	spotify: {
		webApiBaseUrl: 'https://api.spotify.com',
		pollPlayerDelay: 6000,
		apiRetryDelay: 3000,
		maxRetry: 5,
		minSeekFromStart: 2000
	},
	playlist: {
		recentlyPlayedMaxLength: 5,
		playlistMaxLength: 300,
		actionLogMaxLength: 350
	},
	player: {
		progressUpdateDelay: 1000
	}
};
