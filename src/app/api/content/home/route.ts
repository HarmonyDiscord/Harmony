import { getYTMusic } from '../../../../util/ytmusic';

export async function GET(req: Request) {
	const ytmusic = await getYTMusic();

	const sections = await ytmusic.getHomeSections();

	return Response.json(sections);
}
