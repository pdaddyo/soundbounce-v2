/**
 * Created by paulbarrass on 05/11/2017.
 */

import {sortBy, takeRight, take} from 'lodash';
const minGapBeats = 0.25; // seconds
const minGapSegments = 0.6; // seconds

const railsForBeats = 1;
const railsForSegments = 3;

export default class NoteExtractor {
	static extractNotes(analysis) {
		const {segments, bars, tatums, track} = analysis;
		const notes = [];
		let noteId = 0;

		// beats for leftmost rail(s)
		const confidentBeats = sortBy(
			takeRight(sortBy(tatums, 'confidence'), track.duration * 1.5)
			, 'start');
		let lastBeatEnded = 0, barNotes = [];

		confidentBeats.forEach(beat => {
			const barsBeforeThisBeat = sortBy(bars.filter(b => b.start <= beat.start), 'start').length;
			// count the tatums this bar
			if (!barNotes[barsBeforeThisBeat]) {
				barNotes[barsBeforeThisBeat] = 0;
			}
			// always play the first beat of a bar
			if (beat.start >= lastBeatEnded + minGapBeats) {
				// find num bars that started before this beat

				notes.push({
					id: noteId++,
					rail: barNotes[barsBeforeThisBeat] % railsForBeats,
					start: beat.start,
					duration: beat.duration,
					loudness: -5
				});

				barNotes[barsBeforeThisBeat]++;
				lastBeatEnded = beat.start + beat.duration;
			}
		});

		// pitch segments for other rails
		let lastSegmentEnded = [0, 0, 0];
		const confidentSegments = sortBy(
			takeRight(sortBy(segments, 'confidence'), track.duration * 1.5)
			, 'start');
		confidentSegments.forEach(segment => {
			const mostConfidentPitches = take([...segment.pitches].sort(), 3);

			mostConfidentPitches.forEach((pitchConfidence, pitchLoopIndex) => {
				const pitchIndex = segment.pitches.indexOf(pitchConfidence);
				if (pitchLoopIndex > 0 && pitchConfidence < 0.55) {
					return;
				}
				const railForThisSegment = Math.abs((pitchIndex)) % railsForSegments;
				if (segment.start > lastSegmentEnded[railForThisSegment] + minGapSegments) {
					notes.push({
						id: noteId++,
						rail: railForThisSegment + railsForBeats,
						start: segment.start,
						duration: segment.duration,
						loudness: segment.loudness_max
					});
					lastSegmentEnded[railForThisSegment] = segment.start + segment.duration;
				}
			});
		});

		return notes;
	}
}
