export default {
	description: '',
	locked: false,
	colors: {
		primary: '#ad009f'
	},
	refill: {
		targetPlaylistSize: {from: 50, to: 75},
		sources: [
			{
				type: 'room-history',
				percent: 100
			},
			{
				type: 'suggestions-from-room-history',
				percent: 0
			},
			{
				type: 'suggestions-from-current-playlist',
				percent: 0
			}
		]
	}
};
