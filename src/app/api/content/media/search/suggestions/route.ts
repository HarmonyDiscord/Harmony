import YTMusic from 'ytmusic-api';

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const query = searchParams.get('q');

	if (!query) return new Response('Invalid', { status: 400 });

	const ytmusic = new YTMusic();
	await ytmusic.initialize();

	try {
		if (!query) return Response.json([]);

		Response.json(await ytmusic.getSearchSuggestions(query));
	} catch (err) {
		return new Response('Failed to search', { status: 409 });
	}
}
