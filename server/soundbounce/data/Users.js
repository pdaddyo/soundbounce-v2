import shortid from 'shortid';
import _debug from 'debug';
const debug = _debug('app:data:users');
import {User} from './schema';

export default class Users {
	loginUser({profile, accessToken, refreshToken}) {
		const {id, display_name, email, images} = profile;
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
			return user.save();
		});
	}
}

