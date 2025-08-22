import { getYTMusic } from '../../../../../util/ytmusic';

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get('id');
	const name = searchParams.get('name');
	const artist = searchParams.get('artist');

	if (name) {
		const data = await fetch(
			`https://lrclib.net/api/search?track_name=${encodeURIComponent(name)}&artist_name=${encodeURIComponent(artist || '')}`
		)
			.then((res) => res.json())
			.catch(() => null);

		const syncedLyricsItem = data?.find((item: any) => item.syncedLyrics);
		if (syncedLyricsItem)
			return Response.json({ lyrics: syncedLyricsItem.syncedLyrics.split('\n'), type: 'synced' });
	}

	if (!id) return new Response('Invalid', { status: 400 });

	const ytmusic = await getYTMusic();

	return Response.json({ lyrics: await ytmusic.getLyrics(id), type: 'plain' });
}
