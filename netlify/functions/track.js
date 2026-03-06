// netlify/functions/track.js
// Dipanggil dari frontend, menyembunyikan token & webhook URL

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { ip_override } = JSON.parse(event.body || "{}");

    // Ambil IP dari header (Netlify otomatis set ini)
    const ip = ip_override || 
      event.headers["x-forwarded-for"]?.split(",")[0].trim() || 
      event.headers["client-ip"] || 
      "unknown";

    // Fetch IPInfo pakai token dari environment variable
    const ipRes = await fetch(`https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_TOKEN}`);
    const data = await ipRes.json();

    const userAgent = event.headers["user-agent"] || "unknown";

    // Kirim ke Discord pakai webhook dari environment variable
    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "New Visitor Detected",
        avatar_url: "https://i.pinimg.com/736x/31/51/0a/31510a0a2287b9b5a6083acbf7d1042a.jpg",
        embeds: [{
          title: "👁️ Someone Looking our Website",
          color: 3447003,
          fields: [
            { name: "🌐 IP",       value: data.ip || ip,                                    inline: true  },
            { name: "📍 Location", value: `${data.city}, ${data.region}, ${data.country}`, inline: true  },
            { name: "🛰️ ISP",      value: data.org || "unknown",                           inline: false },
            { name: "💻 Device",   value: userAgent,                                        inline: false }
          ],
          timestamp: new Date().toISOString(),
          footer: { text: "Dynnova Webhook Tracker" }
        }]
      })
    });

    return { statusCode: 200, body: "ok" };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: "error" };
  }
};
