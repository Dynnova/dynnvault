// netlify/functions/track.js
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    // Ambil IP dari header Netlify
    const ip =
      event.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      event.headers["client-ip"] ||
      "unknown";

    // Fetch IPInfo pakai token dari environment variable
    const ipRes = await fetch(`https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_TOKEN}`);
    const ipData = await ipRes.json();

    // Browser info dari frontend (dikirim via POST body)
    const {
      userAgent = "Unknown",
      language = "Unknown",
      platform = "Unknown",
      screen = "Unknown",
      timezone = "Unknown",
      cookies = "Unknown",
    } = body;

    function detectBrowser(ua) {
      if (ua.includes("Edg"))     return "🟦 Edge";
      if (ua.includes("Chrome"))  return "🟢 Chrome";
      if (ua.includes("Firefox")) return "🟠 Firefox";
      if (ua.includes("Safari"))  return "🔵 Safari";
      return "❓ Unknown";
    }

    // Kirim ke Discord
    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Visitor Tracker",
        avatar_url: "https://i.pinimg.com/736x/31/51/0a/31510a0a2287b9b5a6083acbf7d1042a.jpg",
        embeds: [{
          title: "👁️ New Website Visitor",
          color: 3447003,
          fields: [
            { name: "🌐 IP",        value: ipData.ip || ip,                                              inline: true  },
            { name: "📍 Location",  value: `${ipData.city || "-"}, ${ipData.region || "-"}, ${ipData.country || "-"}`, inline: true  },
            { name: "🛰 ISP",       value: ipData.org || "Unknown",                                      inline: false },
            { name: "💻 Browser",   value: detectBrowser(userAgent),                                     inline: true  },
            { name: "🖥 Platform",  value: platform,                                                     inline: true  },
            { name: "🌍 Language",  value: language,                                                     inline: true  },
            { name: "📱 Screen",    value: screen,                                                       inline: true  },
            { name: "🕐 Timezone",  value: timezone,                                                     inline: true  },
            { name: "🍪 Cookies",   value: cookies,                                                      inline: true  },
            { name: "🧬 User-Agent",value: userAgent.slice(0, 900),                                      inline: false }
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
