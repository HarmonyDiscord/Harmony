import { getYTMusic } from '../../../../util/ytmusic';

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get('id');

	if (!id) return new Response('Invalid', { status: 400 });

	const ytmusic = await getYTMusic();

	return Response.json(await ytmusic.getArtist(id));
}
