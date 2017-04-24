import shortid from 'shortid';
import _debug from 'debug';
const debug = _debug('app:data:users');
import {User} from './schema';

const emptyAvatar = 'http://www.teequilla.com/images/tq/empty-avatar.png';

export default class Users {
	loginUser({profile, accessToken, refreshToken}) {
		let {display_name} = profile;
		const {id, email, images} = profile;
		if (!display_name) {
			// use the username (id) as the display name if none provided
			display_name = id;
		}

		debug(`${display_name} (${id}) has authorized with spotify.`);
		return User.findOrCreate({
			where: {id},
			defaults: {
				name: display_name,
				nickname: display_name,
				avatar: images.length > 0 ? images[0].url : emptyAvatar,
				email,
				profile
			}
		}).spread((user, created) => {
			// update the access / refresh token in the db
			user.set('accessToken', accessToken);
			user.set('refreshToken', refreshToken);
			user.set('profile', profile);
			user.set('avatar', images.length > 0 ? images[0].url : emptyAvatar);
			return user.save();
		});
	}
}

