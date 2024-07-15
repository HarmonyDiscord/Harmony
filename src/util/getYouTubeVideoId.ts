export default function getYouTubeVideoId(url: string): string | undefined {
    const urlRegex =
        /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = RegExp(urlRegex).exec(url);
    return match ? match[1] : undefined;
}
