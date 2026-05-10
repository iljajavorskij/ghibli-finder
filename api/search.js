const YT_KEY = process.env.YT_KEY || 'AIzaSyAAI7rwRra19QFdkuSO81o8-IH_5Gu3Bac';

const QUERIES_LONG = [
  '"GhibliCozy ASMR"',
  '"Ghibli Days" animation cozy',
  '"Sunset Whispers" ghibli',
  '"Cozy Life Nature" ghibli',
  '"Ghibli Dreamy Village"',
  '"Ghibli-Style ASMR"',
  '"Ghibli ASMR" cozy cooking',
  '"Zippy Relax Music" ghibli',
  '"MokalMusic" ghibli cozy',
  'Ghibli Style ASMR cozy rainy',
  'Ghibli animation family village life',
  'Ghibli cozy ASMR rain sleeping',
  'Ghibli village cooking traditional',
  'Studio Ghibli inspired cozy daily life',
];

const QUERIES_SHORTS = [
  'Ghibli style shorts animation cozy',
  'Ghibli ASMR shorts rainy',
  'Studio Ghibli inspired shorts daily',
  'Ghibli cozy shorts village',
];

function isGhibliAI(title, desc, channel) {
  const t = (title + ' ' + desc + ' ' + channel).toLowerCase();
  return ['ghibli', 'iyashikei', 'cozy life nature', 'mokalmusic', 'zippy relax', 'sunset whispers'].some(s => t.includes(s));
}

function parseDur(iso) {
  if (!iso) return '';
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return '';
  const h = parseInt(m[1] || 0), mn = parseInt(m[2] || 0), s = parseInt(m[3] || 0);
  if (h) return `${h}:${String(mn).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${mn}:${String(s).padStart(2, '0')}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const type = req.query.type || 'long';
  const queries = type === 'shorts' ? QUERIES_SHORTS : QUERIES_LONG;
  const duration = type === 'shorts' ? 'short' : 'medium';

  const seen = new Set();
  const raw = [];

  for (const q of queries) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&videoDuration=${duration}&maxResults=20&order=viewCount&key=${YT_KEY}`;
      const r = await fetch(url);
      if (!r.ok) continue;
      const d = await r.json();
      for (const item of (d.items || [])) {
        const id = item.id?.videoId;
        if (!id || seen.has(id)) continue;
        const s = item.snippet;
        if (!isGhibliAI(s.title, s.description || '', s.channelTitle)) continue;
        seen.add(id);
        raw.push({
          id,
          title: s.title,
          channel: s.channelTitle,
          thumb: s.thumbnails?.medium?.url,
          publishedAt: s.publishedAt,
          description: (s.description || '').slice(0, 200),
          views: 0,
          dur: '',
        });
      }
    } catch (e) {
      console.warn('Query failed:', q, e.message);
    }
  }

  // Fetch stats in batches of 50
  const ids = raw.map(v => v.id);
  for (let i = 0; i < ids.length; i += 50) {
    try {
      const batch = ids.slice(i, i + 50);
      const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${batch.join(',')}&key=${YT_KEY}`;
      const r = await fetch(url);
      const d = await r.json();
      for (const v of raw) {
        const s = (d.items || []).find(x => x.id === v.id);
        if (s) {
          v.views = parseInt(s.statistics?.viewCount || 0);
          v.dur = parseDur(s.contentDetails?.duration);
        }
      }
    } catch (e) {}
  }

  const videos = raw
    .filter(v => v.views > 0)
    .sort((a, b) => b.views - a.views);

  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate'); // кэш 30 мин
  res.status(200).json({ videos, count: videos.length, fetchedAt: new Date().toISOString() });
}
