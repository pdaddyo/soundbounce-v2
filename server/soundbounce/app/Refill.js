/**
 * Created by paulbarrass on 08/07/2017.
 */
import _debug from 'debug';
import spotifyApi, {checkSpotifyApiAuth} from './SpotifyApi';
import {chain, map, shuffle, take, value} from 'lodash';

import defaultRoomConfig from '../data/defaultRoomConfig';
import {TrackActivity} from '../data/schema';
import sequelize from '../data/sequelize';

export default class Refill {
	constructor({room, app, activeRoom}) {
		this.room = room;
		this.activeRoom = activeRoom;
		this.roomId = this.room.get('id');
		this.app = app;
		this.debug = _debug(`soundbounce:refill:${this.roomId}`);
	}

	getRandomTracksFromRoomHistory(count) {
		return TrackActivity.findAll({
			attributes: [
				'trackId',
			],
			where: {
				roomId: this.roomId
			},
			order: [
				[sequelize.fn('RANDOM')]
			],
			limit: count
		});
	}

	// checks to see if room needs refilling, and adds tracks if it does
	check() {
		checkSpotifyApiAuth().then(() => {
				const room = this.room.get({plain: true});
				const promises = [];
				const {playlist} = room.reduxState;
				const {refill: {sources, targetPlaylistSize: {from, to}}} = {
					...defaultRoomConfig,
					...room.config
				};
				this.debug(`Checking if '${room.name}' needs a refill...`);
				let howManyTracksToAdd = 0;

				if (playlist.length < from) {
					howManyTracksToAdd = to - playlist.length;
				}

				if (howManyTracksToAdd === 0) {
					// nothing to do!
					return;
				}

				// never add more than 50 (spotify api limits)
				if (howManyTracksToAdd > 50) {
					howManyTracksToAdd = 50;
				}

				this.debug(`Trying to find ${howManyTracksToAdd} (ish) tracks to add...`)

				if (howManyTracksToAdd < 1) {
					return;
				}
				for (let source of sources) {
					if (source.percent === 0) {
						continue;
					}
					const handler = ({
						'room-history': ({percent, numTracksFromThisSource}) => {
							this.debug(`${percent}% (${numTracksFromThisSource} tracks)  from room history`);
							promises.push(
								this.getRandomTracksFromRoomHistory(numTracksFromThisSource)
									.then(results => {
										this.debug(`Found ${results.length} tracks, adding now...`);
										const trackIds = results.map(track => track.trackId);
										return {
											trackIds,
											reason: 'Previously added to this room'
										};
									})
							);
						},
						'suggestions-from-room-history': ({percent, numTracksFromThisSource}) => {
							//	this.debug(`${percent}% (${numTracksFromThisSource} tracks) from history suggestions`);
							if (numTracksFromThisSource > 0) {
								promises.push(
									this.getRandomTracksFromRoomHistory(5).then(results => {
										const historyTrackIds = results.map(track => track.trackId);
										if (historyTrackIds.length === 0) {
											return {
												trackIds: [],
												reason: ''
											};
										}

										return spotifyApi.getRecommendations({
											seed_tracks: historyTrackIds,
											limit: numTracksFromThisSource
										}).then(results => {
												if (results && results.body && results.body.tracks) {
													const trackIds = results.body.tracks.map(track => track.id);
													return {
														trackIds,
														reason: 'Suggested by Soundbounce based on room history'
													};
												}
											}
										);
									})
								);
							}
						},
						'suggestions-from-current-playlist': ({percent, numTracksFromThisSource}) => {
							//	this.debug(`${percent}% (${numTracksFromThisSource} tracks) from current playlist suggestions`);

							const seeds = chain(playlist)
								.map(item => item.id) // track id
								.shuffle()
								.take(5)
								.value();

							if (seeds.length > 0) {

								promises.push(
									spotifyApi.getRecommendations({
										seed_tracks: seeds,
										limit: numTracksFromThisSource
									}).then(results => {
										if (results && results.body && results.body.tracks) {
											const trackIds = results.body.tracks.map(track => track.id);
											return {
												trackIds,
												reason: 'Suggested by Soundbounce based on current playlist'
											};
										}
									})
								);
							}
						}
					})[source.type];

					if (handler) {
						handler({
							...source,
							numTracksFromThisSource: Math.round(source.percent * (howManyTracksToAdd / 100))
						});
					}
					else {
						this.debug(`Unsupported source type: ${source.type}`);
					}
				}

				// we now have a list of promises to wait for
				Promise.all(promises).then(trackSources => {

					for (let trackSource of trackSources) {
						const {trackIds, reason} = trackSource;
						// add the tracks to the room
						if (trackIds) {
							this.activeRoom.handleRoomEventMessage({
								event: {
									type: 'addOrVote',
									trackIds,
									reason
								}
							});
						}
					}
				}).catch(err => {
					this.debug(`Error during refill: ${err}`);
				});
			}
		)
		;
	}
}
