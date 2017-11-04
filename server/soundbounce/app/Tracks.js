/**
 * Created by paulbarrass on 25/04/2017.
 */
import _debug from 'debug';
const debug = _debug('soundbounce:tracks');
import {Track, Artist, TrackArtist} from '../data/schema';

import {without, flatten, uniq, chain, value, take} from 'lodash';

import spotifyApi, {checkSpotifyApiAuth} from './SpotifyApi';
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
					const promise = checkSpotifyApiAuth();
					return promise.then(tracks =>
						spotifyApi
							.getTracks(take(trackIdsToFetch, 50))
							.then(response => {
									if (response.statusCode !== 200) {
										return Promise.reject();
									}
									// add these spotify tracks to the db
									const {tracks} = response.body;

									// update trackIds for any relinked tracks
									for (let trackIndex in trackIds) {
										const linkedTrack = tracks.find(t =>
											t && t.linked_from && t.linked_from.id === trackIds[trackIndex]
										);
										if (linkedTrack) {
											trackIds[trackIndex] = linkedTrack.id;
										}
									}

									// get all the unique artists in the response
									const artists = chain(tracks)
										.filter(t => t) // only if there is a track
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

											// work out if we have any track ids back from api
											// that we didn't ask for - these may already be in db
											const relinkedTracksCouldBeInDb = tracks.filter(t =>
											t && t.linked_from && t.linked_from.id);

											let tracksAlreadyExistPromise = Promise.resolve([]);

											if (relinkedTracksCouldBeInDb.length > 0) {
												tracksAlreadyExistPromise = Track.findAll({
													where: {
														id: {$in: relinkedTracksCouldBeInDb.map(t => t.id)}
													},
													attributes: ['id']
												});
											}

											const trackInsertPromise =
												tracksAlreadyExistPromise.then(relinkedTracksInDb => {
													const idsAlreadyInDb = relinkedTracksInDb
														.map(t => t.get('id'));
													return Track
														.bulkCreate(tracks
															.filter(t => !idsAlreadyInDb.includes(t.id))
															.map(spotifyTrack => ({
																id: spotifyTrack.id,
																name: spotifyTrack.name,
																duration: spotifyTrack.duration_ms,
																albumArt: spotifyTrack.album.images.length > 1 ?
																	spotifyTrack.album.images[1].url :
																	(spotifyTrack.album.images.length === 1 ?
																		spotifyTrack.album.images[0].url : emptyAlbumArt),
																json: spotifyTrack
															}))).then(() => idsAlreadyInDb);
												});

											// wait until we have inserted all the artists and the tracks
											return Promise.all([artistsInsertPromise, trackInsertPromise])
												.then(([, idsAlreadyInDb]) => {

													// now associate the saved tracks with the saved artists
													const trackArtistsToInsert =
														flatten(
															tracks
																.filter(track => !idsAlreadyInDb.includes(track.id))
																.map(track =>
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
														// we include return ids due to track relinking whereby
														// the id back from api is diff to the id
														// we asked for.
														return this.findTracksInDb(
															uniq([...trackIds])
														);
													});
												})
												.catch(err => {
													debug('Error during insert of artist/tracks to db', err);
												});
										}
									);
								}
							)
					);
				} else {
					// we didn't need to insert any tracks, so the db result have it all
					return Promise.resolve(tracksInDb);
				}
			});
	}
}
