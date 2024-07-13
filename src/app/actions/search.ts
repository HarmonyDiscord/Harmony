'use server';

import YTMusic, { SongDetailed } from 'ytmusic-api';
import type { Song } from '../../types/Song';

export default async function search(query: string) {
	const ytmusic = new YTMusic();
	await ytmusic.initialize();
	try {
		if (!query) return [];

		const videoId = getYouTubeVideoId(query);

		if (videoId) {
			const video = await ytmusic.searchSongs(videoId);
			const firstVideo = video[0];

			if (!firstVideo) return [];

			return [parseSearchResult(firstVideo)];
		}

		const videos = await ytmusic.searchSongs(query);

		return videos.map((video) => parseSearchResult(video));
	} catch (err) {
		console.error(err);
		throw new Error('Failed to search');
	}
}

function parseSearchResult(results: SongDetailed): Song {
	return {
		id: results.videoId,
		title: results.name,
		artist: results.artist.name,
		album: results.album?.name || 'unknown',
		cover: results.thumbnails.at(0)?.url.replace('w60', 'w250').replace('h60', 'h250'),
		duration: results.duration?.toString() || '0'
	};
}

function getYouTubeVideoId(url: string): string | undefined {
	const urlRegex =
		/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
	const match = RegExp(urlRegex).exec(url);
	return match ? match[1] : undefined;
}
