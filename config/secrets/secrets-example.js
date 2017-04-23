/**
 * Copy to secrets.js and paste in your values below from the spotify developer console
 */

export default ({
	spotify: {
		clientId: '----copy paste from spotify developer console----',
		clientSecret: '----copy paste from spotify developer console----',
		redirectUri: 'http://localhost:1337/spotify-oauth-callback' // << -- add this url to developer console
	},
	postgres: {
		uri: 'postgres://localhost:5432/soundbounce'
	}
});

