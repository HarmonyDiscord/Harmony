import { getYTMusic } from '../../../../../util/ytmusic';

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get('id');
	const name = searchParams.get('name');
	const artist = searchParams.get('artist');
	const album = searchParams.get('album');

	if (name) {
		const data = await fetch(
			`https://lrclib.net/api/search?track_name=${encodeURIComponent(name)}&artist_name=${encodeURIComponent(artist || '')}`
		)
			.then((res) => res.json())
			.catch(() => null);

		const syncedLyricsItem = data?.find((item: any) => item.syncedLyrics);
		if (syncedLyricsItem) {
			return Response.json({ lyrics: syncedLyricsItem.syncedLyrics.split('\n'), type: 'synced' });
		} else {
			const dataRetry = await fetch(
				`https://lrclib.net/api/search?track_name=${encodeURIComponent(name)}&album_name=${encodeURIComponent(album || '')}`
			)
				.then((res) => res.json())
				.catch(() => null);

			const syncedLyricsItemRetry = dataRetry?.find((item: any) => item.syncedLyrics);
			if (syncedLyricsItemRetry)
				return Response.json({ lyrics: syncedLyricsItemRetry.syncedLyrics.split('\n'), type: 'synced' });
		}
	}

	if (!id) return new Response('Invalid', { status: 400 });

	const ytmusic = await getYTMusic();

	return Response.json({ lyrics: await ytmusic.getLyrics(id), type: 'plain' });
}
