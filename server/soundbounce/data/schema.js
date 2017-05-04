import Sequelize from 'sequelize';
import sequelize from './sequelize';
import _debug from 'debug';
const debug = _debug('soundbounce:data:schema');

// helper function to get settings for a required foreign key
const requiredFK = (field) => ({
	foreignKey: {field, allowNull: false},
	onDelete: 'cascade'
});

///
/// Models
///
export const Artist = sequelize.define('artist', {
	id: {type: Sequelize.STRING, allowNull: false, primaryKey: true},
	name: {type: Sequelize.STRING, allowNull: false},
	json: {type: Sequelize.JSONB}
});

export const Track = sequelize.define('track', {
	id: {type: Sequelize.STRING, allowNull: false, primaryKey: true},
	name: {type: Sequelize.STRING, allowNull: false},
	duration: {type: Sequelize.INTEGER},
	albumArt: {type: Sequelize.STRING, allowNull: false},
	json: {type: Sequelize.JSONB},
	youtubeId: {type: Sequelize.STRING}
});

export const User = sequelize.define('user', {
	id: {type: Sequelize.STRING, allowNull: false, primaryKey: true},
	name: {type: Sequelize.STRING, allowNull: false},
	nickname: {type: Sequelize.STRING, allowNull: false},
	avatar: {type: Sequelize.STRING},
	email: {type: Sequelize.STRING},
	profile: {type: Sequelize.JSONB},
	prefs: {type: Sequelize.JSONB},
	accessToken: {type: Sequelize.STRING(400)},
	refreshToken: {type: Sequelize.STRING(400)},
	currentDeviceId: {type: Sequelize.STRING},
	currentRoomId: {type: Sequelize.STRING},
	isSynced: {type: Sequelize.BOOLEAN}
});

export const UserActivity = sequelize.define('userActivity', {
	type: {type: Sequelize.STRING, allowNull: false}, /* login, ... */
	detail: {type: Sequelize.JSONB}
});

UserActivity.belongsTo(User, requiredFK('userId'));
export const UserActivities = {
	login: 'login'
};

export const Room = sequelize.define('room', {
	id: {type: Sequelize.STRING, allowNull: false, primaryKey: true},
	name: {type: Sequelize.STRING, allowNull: false},
	reduxState: {type: Sequelize.JSONB},
	config: {type: Sequelize.JSONB},
	shutdownAt: {type: Sequelize.DATE},
	isActive: {type: Sequelize.BOOLEAN}
});

Room.belongsTo(User, {as: 'Creator', foreignKey: 'creatorId'});
Room.belongsTo(Track, {as: 'NowPlaying', foreignKey: 'nowPlayingTrackId'});

export const RoomUser = sequelize.define('roomUser', {
	details: {type: Sequelize.JSONB}
});

Room.belongsToMany(User, {through: RoomUser});
User.belongsToMany(Room, {through: RoomUser});

export const TrackArtist = sequelize.define('trackArtist', {});
Track.belongsToMany(Artist, {through: TrackArtist});
Artist.belongsToMany(Track, {through: TrackArtist});

export const TrackActivity = sequelize.define('trackActivity', {
	type: {type: Sequelize.STRING, allowNull: false}, /* add, vote up, vote down, play etc */
	detail: {type: Sequelize.JSONB}
});
TrackActivity.belongsTo(User, requiredFK('userId'));
TrackActivity.belongsTo(Room, requiredFK('roomId'));
TrackActivity.belongsTo(Track, requiredFK('trackId'));

export const RoomActivity = sequelize.define('roomActivity', {
	type: {type: Sequelize.STRING, allowNull: false}, /* user:join, user:leave, admin:command */
	detail: {type: Sequelize.JSONB}
});
RoomActivity.belongsTo(Room, requiredFK('roomId'));
RoomActivity.belongsTo(User); // optional

export const RoomActivities = {
	userJoin: 'userJoin',
	userLeave: 'userLeave'
};

/// called on app startup
export function syncDatabaseSchema(done) {
	debug('Syncing database schema (sequelize.sync)...');
	sequelize.sync({force: true}).then(() => {
		debug('Sync success');
		done();
	}).catch(error => {
		debug('Error syncing database :' + error.message);
		throw error;
	});
}

