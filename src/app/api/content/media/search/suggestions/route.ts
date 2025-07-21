import { getYTMusic } from '../../../../../../util/ytmusic';

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const query = searchParams.get('q');

	if (!query) return new Response('Invalid', { status: 400 });

	const ytmusic = await getYTMusic();

	try {
		if (!query) return Response.json([]);

		Response.json(await ytmusic.getSearchSuggestions(query));
	} catch (err) {
		return new Response('Failed to search', { status: 409 });
	}
}
