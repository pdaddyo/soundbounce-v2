/* intersperse: Return an array with the separator interspersed between
 * each element of the input array.
 *
 * > _([1,2,3]).intersperse(0)
 * [1,0,2,0,3]
 */

const intersperse = (arr, sep) => {
	if (arr.length === 0) {
		return [];
	}
	return arr.slice(1).reduce(function (xs, x) {
		return xs.concat([sep, x]);
	}, [arr[0]]);
};

export default intersperse;
