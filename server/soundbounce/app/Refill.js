/**
 * Created by paulbarrass on 08/07/2017.
 */
import _debug from 'debug';
import spotifyApi from './SpotifyApi';

import defaultRoomConfig from '../data/defaultRoomConfig';
import {TrackActivity} from '../data/schema';
import sequelize from '../data/sequelize';

export default class Refill {
	constructor({room, app}) {
		this.room = room;
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
			limit: count,
		});
	}

	check() {
		const room = this.room.get({plain: true});
		const {refill: {sources, targetPlaylistSize: {from, to}}} = {
			...defaultRoomConfig,
			...room.config
		};
		this.debug(`Checking if '${room.name}' needs a refill...`);
		let promises = [];
		for (let source of sources) {
			if (source.percent === 0) {
				return;
			}

			const handler = ({
				'room-history': ({percent}) => {
					this.debug(`${percent}% from room history`);
					this.getRandomTracksFromRoomHistory(percent).then(results => {

						this.debug(results.map(track => track.trackId));
					});
				},
				'suggestions-from-room-history': ({percent}) => {
					this.debug(`${percent}% from history suggestions`);
				},
				'suggestions-from-current-playlist': ({percent}) => {
					this.debug(`${percent}% from current playlist suggestions`);
				}
			})[source.type];

			if (handler) {
				handler(source);
			} else {
				this.debug(`Unsupported source type: ${source.type}`);
			}
		}

		// we now have a list of promises to wait for
		Promise.all(promises).then(results => {
			this.debug(results);
		})
	}
}
