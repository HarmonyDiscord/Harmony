import { filterFormats, getInfo } from '@distube/ytdl-core';

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get('id');

	if (!id) return new Response('Invalid', { status: 400 });

	const info = await getInfo(`http://www.youtube.com/watch?v=${id}`);

	const audioFormats = filterFormats(info.formats, 'audioonly');


	const url = audioFormats[0]?.url;

	if (!url) return new Response('Invalid', { status: 400 });

	return new Response(await fetch(url).then(r => r.body))
}