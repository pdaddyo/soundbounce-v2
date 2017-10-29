/**
 * Created by paulbarrass on 29/10/2017.
 */

import {emojify} from 'react-emojione';
import sprites from './emojione-3.1.2-64x64.png';

const emojifyWithOptions = (content, size = 32, moreStyles={}) => {
	const options = {
		convertShortnames: true,
		convertUnicode: true,
		convertAscii: true,
		style: {
			backgroundImage: `url(${sprites})`,
			height: size,
			width: size,
			top: 0,
			...moreStyles
		}
	};
	return emojify(content, options);
};

export default emojifyWithOptions;

