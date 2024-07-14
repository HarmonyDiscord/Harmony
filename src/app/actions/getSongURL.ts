'use server';
import { filterFormats, getInfo } from '@distube/ytdl-core';

export default async function getSongURL(videoId: string) {
	const info = await getInfo(`http://www.youtube.com/watch?v=${videoId}`);

	const audioFormats = filterFormats(info.formats, 'audioonly');

	return audioFormats[0]?.url;
}
