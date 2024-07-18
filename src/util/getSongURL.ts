import axios from 'axios';
import type { CobaltResponse } from '../types/Cobalt';

export default async function getSongURL(songId: string, isActivity: boolean, audioOnly: boolean) {
	const { data } = await axios.post<CobaltResponse>(
		isActivity ? '/api/json' : 'https://api.cobalt.tools/api/json',
		{
			url: 'https://youtube.com/watch?v=' + songId,
			aFormat: 'mp3',
			isAudioOnly: audioOnly
		},
		{
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			}
		}
	);

	const url = isActivity
		? data.url
			?.replace('https://kityune.imput.net/api/stream', '/kityune/stream')
			.replace('https://olly.imput.net/api/stream', '/olly/stream')
		: data.url;

	return url;
}
