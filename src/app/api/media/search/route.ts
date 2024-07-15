import YTMusic, { SearchResult as YtSearchResult } from 'ytmusic-api';
import type { SearchResult } from '../../../../types/SearchResult';
import { ContentType } from '../../../../types/content/ContentType';

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

		const results = await ytmusic.search(query);

		console.log('got results', results);

		return Response.json(results.map((result) => parseSearchResult(result)));
	} catch (err) {
		return new Response('Failed to search', { status: 409 });
	}
}

function parseSearchResult(result: YtSearchResult): SearchResult {
	switch (result.type) {
		case 'SONG':
			return {
				type: ContentType.Song,
				id: result.videoId,
				title: result.name,
				artist: result.artist.name,
				album: result.album?.name || 'unknown',
				cover: result.thumbnails.at(0)?.url.replace('w60', 'w250').replace('h60', 'h250'),
				duration: result.duration ?? 0
			};

		case 'VIDEO':
			return {
				type: ContentType.Video,
				id: result.videoId,
				title: result.name,
				artist: result.artist.name,
				cover: result.thumbnails.at(0)?.url.replace('w60', 'w250').replace('h60', 'h250'),
				duration: result.duration ?? 0
			};

		default:
			return null;
	}
}

function getYouTubeVideoId(url: string): string | undefined {
	const urlRegex =
		/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
	const match = RegExp(urlRegex).exec(url);
	return match ? match[1] : undefined;
}
