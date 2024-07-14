import { filterFormats, getInfo } from '@distube/ytdl-core';
import axios from 'axios';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return new Response('Invalid', { status: 400 });

    const info = await getInfo(`http://www.youtube.com/watch?v=${id}`);

    const audioFormats = filterFormats(info.formats, 'audioonly');

    if (audioFormats.length > 0) {
        const url = audioFormats[0]?.url;

        if (!url) return new Response('Unable to get URL', { status: 400 });

        try {
            const response = await axios.get(url);

            console.log('Got response')

            return new Response(response.data);
        } catch (error) {
            return new Response('Unable to download', { status: 400 });
        }
    }
}
