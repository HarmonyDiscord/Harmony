export default function formatDuration(duration: number) {
	const hr = Math.floor(duration / 3600);
	const mr = Math.floor((duration % 3600) / 60);
	const sr = Math.floor(duration % 60);

	return (
		(hr > 0 ? hr.toString().padStart(2, '0') + ':' : '') +
		mr.toString().padStart(2, '0') +
		':' +
		sr.toString().padStart(2, '0')
	);
}
