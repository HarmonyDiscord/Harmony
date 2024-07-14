import YTMusic, { type SongDetailed } from 'ytmusic-api';
import type { Song } from '../../../../types/Song';

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const query = searchParams.get('q');

	if (!query) return new Response('Invalid', { status: 400 });

	const ytmusic = new YTMusic();
	await ytmusic.initialize();

	try {
		if (!query) return Response.json([]);

		const videoId = getYouTubeVideoId(query);

		if (videoId) {
			const video = await ytmusic.searchSongs(videoId);
			const firstVideo = video[0];

			if (!firstVideo) return Response.json([]);

			return Response.json([parseSearchResult(firstVideo)]);
		}

		const videos = await ytmusic.searchSongs(query);

		return Response.json(videos.map((video) => parseSearchResult(video)));
	} catch (err) {
		return new Response('Failed to search', { status: 409 });
	}
}

function parseSearchResult(results: SongDetailed): Song {
	return {
		id: results.videoId,
		title: results.name,
		artist: results.artist.name,
		album: results.album?.name || 'unknown',
		cover: results.thumbnails.at(0)?.url.replace('w60', 'w250').replace('h60', 'h250'),
		duration: results.duration ?? 0
	};
}

function getYouTubeVideoId(url: string): string | undefined {
	const urlRegex =
		/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
	const match = RegExp(urlRegex).exec(url);
	return match ? match[1] : undefined;
}
