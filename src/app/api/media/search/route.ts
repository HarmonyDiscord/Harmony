import getYouTubeVideoId from '../../../../util/getYouTubeVideoId';
import parseSearchResult from '../../../../util/parseSearchResult';
import YTMusic from 'ytmusic-api';

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

		const results = await ytmusic.searchSongs(query);


		return Response.json(results.map((result) => parseSearchResult(result)));
	} catch (err) {
		return new Response('Failed to search', { status: 409 });
	}
}

