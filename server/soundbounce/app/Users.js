import shortid from 'shortid';
import _debug from 'debug';
const debug = _debug('soundbounce:users');
import {User, UserActivity, UserActivities} from '../data/schema';

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
			// log to db (but don't wait for this to resolve, lazy write)
			UserActivity.create({
				userId: id,
				type: UserActivities.login
			});

			// update the access / refresh token in the db
			user.set('accessToken', accessToken);
			user.set('refreshToken', refreshToken);
			user.set('profile', profile);
			user.set('avatar', (images && images.length) > 0 ? images[0].url : emptyAvatar);

			return user.save();
		});
	}

	getUsersForRoomSync(userIds, roomId) {
		// todo: also get room status such as creator, admin based on roomId
		return User
			.findAll({where: {id: {$in: userIds}}, attributes: ['id', 'nickname', 'avatar']})
			.then(users =>
				users ? users.map(user => ({
					...user.get({plain: true}),
					tags: ['listener']
				})) : []);
	}
}

