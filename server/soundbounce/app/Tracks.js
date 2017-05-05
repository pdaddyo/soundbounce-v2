/**
 * Created by paulbarrass on 25/04/2017.
 */
import _debug from 'debug';
const debug = _debug('soundbounce:tracks');
import {Track, Artist, TrackArtist} from '../data/schema';
import SpotifyWebApi from 'spotify-web-api-node';
import secrets from '../../../config/secrets/secrets';
import {without, flatten, uniq, chain, value, take} from 'lodash';

const spotifyApi = new SpotifyWebApi(secrets.spotify);
const emptyAlbumArt = 'oops.png';

export default class Tracks {
	constructor(app) {
		this.app = app;
	}

	findTracksInDb(trackIds) {
		return Track.findAll({
			where: {
				id: {$in: trackIds}
			},
			include: [Artist]
		});
	}

	findInDbOrQuerySpotifyApi(trackIds) {
		trackIds = uniq(trackIds);
		// search our db for these tracks first
		return this.findTracksInDb(trackIds)
			.then(tracksInDb => {
				const trackIdsToFetch = without(trackIds,
					...tracksInDb.map(t => t.get('id')));
				if (trackIdsToFetch.length > 0) {
					return spotifyApi
						.getTracks(take(trackIdsToFetch, 50))
						.then(response => {
							if (response.statusCode === 200) {
								// add these spotify tracks to the db
								const {tracks} = response.body;

								// get all the unique artists in the response
								const artists = chain(tracks)
									.map(t => t.album.artists)
									.flatten()
									.uniqBy(a => a.id)
									.value();

								const artistIds = uniq(artists.map(a => a.id));

								// ok see if we have any of these artists in our system already
								return Artist.findAll({
									where: {
										id: {$in: artistIds}
									},
									attributes: ['id']
								}).then(artistsInDb => {
									// work out which ones we don't have yet
									const artistIdsToInsert =
										without(artistIds,
											...artistsInDb.map(t => t.get('id')));

									/*	debug('inserting artists ', artistIdsToInsert,
									 artistsInDb.map(t => t.get('id')), artistIds
									 ); */
									const artistsToInsert = artists
										.filter(a => artistIdsToInsert.indexOf(a.id) > -1);

									// default to just resolving
									let artistsInsertPromise = Promise.resolve();

									// unless we have artists to insert
									if (artistIdsToInsert.length > 0) {
										artistsInsertPromise = Artist.bulkCreate(
											artistsToInsert.map(artist => ({
												id: artist.id,
												name: artist.name,
												json: artist
											}))
										)
									}

									const trackInsertPromise = Track
										.bulkCreate(tracks.map(spotifyTrack => ({
											id: spotifyTrack.id,
											name: spotifyTrack.name,
											duration: spotifyTrack.duration_ms,
											albumArt: spotifyTrack.album.images.length > 1 ?
												spotifyTrack.album.images[1].url :
												(spotifyTrack.album.images.length === 1 ?
													spotifyTrack.album.images[0].url : emptyAlbumArt),
											json: spotifyTrack
										})));

									// wait until we have inserted all the artists and the tracks
									return Promise.all([artistsInsertPromise, trackInsertPromise])
										.then(() => {
											// now associate the saved tracks with the saved artists
											const trackArtistsToInsert =
												flatten(
													tracks.map(track =>
														track.album.artists.map(artist => ({
																artistId: artist.id,
																trackId: track.id
															})
														)
													)
												);
											return TrackArtist.bulkCreate(
												trackArtistsToInsert
											).then(() => {
												// todo: fix bug with track relinking whereby
												// the id back from api is diff to the id
												// we asked for.

												return this.findTracksInDb(trackIds);
											});
										})
										.catch(err => {
											debug('Error during insert of artist/tracks to db', err);
										});
								});

							}
						});
				} else {
					// we didn't need to insert any tracks, so the db result have it all
					return Promise.resolve(tracksInDb);
				}
			});
	}
}
