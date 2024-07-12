export async function POST(req: Request) {
	const data = await req.json().catch(() => null);

	if (!data?.code || typeof data.code !== 'string') return Response.json('Invalid form body.', { status: 400 });

	const response = await fetch(`https://discord.com/api/oauth2/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			client_id: process.env['NEXT_PUBLIC_DISCORD_CLIENT_ID'] ?? '',
			client_secret: process.env['DISCORD_CLIENT_SECRET'] ?? '',
			grant_type: 'authorization_code',
			code: data.code
		})
	});

	const { access_token } = await response.json();

	return Response.json({ access_token });
}
