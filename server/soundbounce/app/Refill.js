/**
 * Created by paulbarrass on 08/07/2017.
 */
import _debug from 'debug';

import defaultRoomConfig from '../data/defaultRoomConfig';

export default class Refill {
	constructor({room, app}) {
		this.room = room;
		this.app = app;
		this.id = room.get('id');
		this.name = room.get('name');
		this.debug = _debug(`soundbounce:refill:${this.id}`);
	}

	check() {
		const room = this.room.get({plain: true});
		const {refill: {sources, targetPlaylistSize: {from, to}}} = {
			...defaultRoomConfig,
			...room.config
		};
		this.debug(`Checking if '${room.name}' needs a refill...`);
		this.debug(sources);

		let promises = [];
		for (let source of sources) {
			if (source.percent === 0) {
				return;
			}

			const handler = ({
				'room-history': ({percent}) => {
					this.debug(`${percent} from room history`);
					promises.push()

				},
				'suggestions-from-room-history': ({percent}) => {
					this.debug(`${percent} from history suggestions`);
				},
				'suggestions-from-current-playlist': ({percent}) => {
					this.debug(`${percent} from current playlist suggestions`);
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
