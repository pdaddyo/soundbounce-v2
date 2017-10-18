/**
 * Created by paulbarrass on 18/10/2017.
 */
const rgba = (hex, alpha) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
		: null;
};

export default rgba;
