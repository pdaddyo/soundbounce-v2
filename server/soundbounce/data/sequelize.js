/**
 * Created by paulbarrass on 23/04/2017.
 */
import Sequelize from 'sequelize';
import secrets from '../../../config/secrets/secrets';

const options = {};
const sequelize = new Sequelize(secrets.postgres.uri, options);

export default sequelize;

