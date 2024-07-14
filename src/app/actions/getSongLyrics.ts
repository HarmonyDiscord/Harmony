'use server';

import YTMusic from 'ytmusic-api';

export default async function getSongLyrics(videoId: string) {
    const ytmusic = new YTMusic();
    await ytmusic.initialize();

    return await ytmusic.getLyrics(videoId)
}
