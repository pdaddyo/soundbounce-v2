export default {
	description: '',
	locked: false,
	colors: {
		primary: '#ad009f'
	},
	refill: {
		targetPlaylistSize: {from: 75, to: 125},
		sources: [
			{
				type: 'room-history',
				percent: 50
			},
			{
				type: 'suggestions-from-room-history',
				percent: 25
			},
			{
				type: 'suggestions-from-current-playlist',
				percent: 25
			}
		]
	}
};
