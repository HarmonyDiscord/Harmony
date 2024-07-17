export default function getYouTubeVideoId(url: string): string | undefined {
	return url.split('v=')[1]?.split('&')[0]
}
