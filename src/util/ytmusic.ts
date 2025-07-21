import YTMusic from 'ytmusic-api';

let instance: YTMusic | null = null;
let isInitialized = false;

export function getYTMusicInstance() {
	if (!instance) {
		instance = new YTMusic();
	}

	return instance;
}

export async function getYTMusic() {
	const ytmusic = getYTMusicInstance();

	if (!isInitialized) {
		await ytmusic.initialize();
		isInitialized = true;
	}

	return ytmusic;
}
