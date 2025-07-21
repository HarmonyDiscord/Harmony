import type { SearchResult } from '../types/SearchResult';
import type { Album } from '../types/content/Album';
import type { Artist } from '../types/content/Artist';
import { ContentType } from '../types/content/ContentType';
import type { Playlist } from '../types/content/Playlist';
import type { Song } from '../types/content/Song';

type APIAlbum = {
	type: string;
	albumId: string;
	name: string;
	playlistId: string;
	artist: {
		artistId: string;
		name: string;
	};
	year: number;
	thumbnails: Array<{
		url: string;
		width: number;
		height: number;
	}>;
	songs: Array<{
		type: string;
		videoId: string;
		name: string;
		artist: {
			artistId: string;
			name: string;
		};
		album: {
			albumId: string;
			name: string;
		};
		duration: number;
		thumbnails: Array<{
			url: string;
			width: number;
			height: number;
		}>;
	}>;
};

type APIPlaylist = {
	type: string;
	playlistId: string;
	name: string;
	artist: {
		artistId: string;
		name: string;
	};
	thumbnails: Array<{
		url: string;
		width: number;
		height: number;
	}>;
	songs: Array<{
		type: string;
		videoId: string;
		name: string;
		artist: {
			artistId: string;
			name: string;
		};
		album: {
			albumId: string;
			name: string;
		};
		duration: number;
		thumbnails: Array<{
			url: string;
			width: number;
			height: number;
		}>;
	}>;
};

function normalizeSong(song: any): Song {
	return {
		type: ContentType.Song,
		id: song.videoId ?? song.id ?? '',
		videoId: song.videoId ?? song.id ?? '',
		name: song.name ?? '',
		artist: song.artist
			? {
					id: song.artist.artistId ?? null,
					name: song.artist.name ?? ''
				}
			: { id: null, name: '' },
		album:
			song.album?.albumId || song.album?.name
				? {
						id: song.album?.albumId ?? '',
						name: song.album?.name ?? ''
					}
				: null,
		duration: typeof song.duration === 'number' && !isNaN(song.duration) ? song.duration : 0,
		thumbnail:
			Array.isArray(song.thumbnails) && song.thumbnails.length > 0
				? song.thumbnails[song.thumbnails.length - 1].url
				: (song.thumbnail ?? null)
	};
}

export function normalizeAlbum(apiAlbum: any): Album {
	const normalizedArtist =
		apiAlbum.artist && (apiAlbum.artist.artistId || apiAlbum.artist.name)
			? {
					id: apiAlbum.artist.artistId ?? null,
					name: apiAlbum.artist.name ?? ''
				}
			: { id: null, name: '' };

	const songs = Array.isArray(apiAlbum.songs) ? apiAlbum.songs.map(normalizeSong) : [];

	return {
		type: ContentType.Album,
		id: apiAlbum.albumId ?? apiAlbum.id ?? '',
		name: apiAlbum.name ?? '',
		artist: normalizedArtist,
		thumbnail:
			Array.isArray(apiAlbum.thumbnails) && apiAlbum.thumbnails.length > 0
				? apiAlbum.thumbnails[apiAlbum.thumbnails.length - 1].url
				: (apiAlbum.thumbnail ?? null),
		playlistId: apiAlbum.playlistId ?? '',
		year: apiAlbum.year ?? null,
		songs
	};
}

export function normalizePlaylist(apiPlaylist: APIPlaylist): Playlist {
	const artist =
		apiPlaylist.artist && (apiPlaylist.artist.artistId || apiPlaylist.artist.name)
			? {
					id: apiPlaylist.artist.artistId ?? null,
					name: apiPlaylist.artist.name ?? ''
				}
			: { id: null, name: '' };

	const thumbnail =
		apiPlaylist && Array.isArray(apiPlaylist.thumbnails) && apiPlaylist.thumbnails.length > 0
			? apiPlaylist.thumbnails[apiPlaylist.thumbnails.length - 1]?.url
			: undefined;

	const songs = Array.isArray(apiPlaylist.songs) ? apiPlaylist.songs.map(normalizeSong) : [];

	return {
		type: ContentType.Playlist,
		id: apiPlaylist.playlistId,
		name: apiPlaylist.name,
		artist,
		thumbnail,
		songs
	};
}

export function normalizeArtist(apiArtist: any) {
	const thumbnail =
		Array.isArray(apiArtist.thumbnails) && apiArtist.thumbnails.length > 0
			? apiArtist.thumbnails[apiArtist.thumbnails.length - 1].url
			: (apiArtist.thumbnail ?? null);

	const topSongs = Array.isArray(apiArtist.topSongs) ? apiArtist.topSongs.map(normalizeSong) : [];

	const topAlbums = Array.isArray(apiArtist.topAlbums) ? apiArtist.topAlbums.map(normalizeAlbum) : [];

	const topVideos = Array.isArray(apiArtist.topVideos)
		? apiArtist.topVideos.map((video: any) => ({
				type: ContentType.Video,
				id: video.videoId ?? video.id ?? '',
				name: video.name ?? '',
				artist: video.artist
					? {
							id: video.artist.artistId ?? video.artist.id ?? null,
							name: video.artist.name ?? ''
						}
					: { id: null, name: '' },
				album: null,
				duration: video.duration ?? 0,
				thumbnail:
					Array.isArray(video.thumbnails) && video.thumbnails.length > 0
						? video.thumbnails[video.thumbnails.length - 1].url
						: (video.thumbnail ?? null)
			}))
		: [];

	const topSingles = Array.isArray(apiArtist.topSingles) ? apiArtist.topSingles.map(normalizeAlbum) : [];

	const featuredOn = Array.isArray(apiArtist.featuredOn) ? apiArtist.featuredOn.map(normalizePlaylist) : [];

	const similarArtists = Array.isArray(apiArtist.similarArtists) ? apiArtist.similarArtists.map(normalizeArtist) : [];

	return {
		type: ContentType.Artist,
		id: apiArtist.artistId ?? apiArtist.id ?? '',
		name: apiArtist.name ?? '',
		thumbnail,
		songs: topSongs,
		topSongs,
		topAlbums,
		topVideos,
		topSingles,
		featuredOn,
		similarArtists
	} as Artist;
}
