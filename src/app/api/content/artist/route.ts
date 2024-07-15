import YTMusic from 'ytmusic-api';

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get('id');

	if (!id) return new Response('Invalid', { status: 400 });

	const ytmusic = new YTMusic();
	await ytmusic.initialize();

	return Response.json(await ytmusic.getArtist(id));
}
