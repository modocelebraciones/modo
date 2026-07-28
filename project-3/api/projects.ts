import type { VercelRequest, VercelResponse } from '@vercel/node';

interface NotionRichText {
  plain_text: string;
}

interface NotionFile {
  type: 'external' | 'file';
  external?: { url: string };
  file?: { url: string };
}

interface NotionProperty {
  type: string;
  title?: NotionRichText[];
  rich_text?: NotionRichText[];
  files?: NotionFile[];
  url?: string;
}

interface NotionPage {
  id: string;
  properties: Record<string, NotionProperty>;
}

interface NotionResponse {
  results: NotionPage[];
  next_cursor: string | null;
  has_more: boolean;
}

function getText(prop?: NotionProperty): string {
  if (!prop) return '';
  if (prop.type === 'title') return prop.title?.[0]?.plain_text ?? '';
  if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text ?? '';
  if (prop.type === 'url') return prop.url ?? '';
  return '';
}

function getImage(prop?: NotionProperty): string {
  if (!prop || prop.type !== 'files') return '';
  const file = prop.files?.[0];
  if (!file) return '';
  return file.type === 'external' ? (file.external?.url ?? '') : (file.file?.url ?? '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { NOTION_KEY, NOTION_DATABASE_ID } = process.env;

  if (!NOTION_KEY || !NOTION_DATABASE_ID) {
    return res.status(500).json({ error: 'Missing Notion environment variables' });
  }

  try {
    const notionRes = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            property: 'Destacado en Web',
            checkbox: { equals: true },
          },
        }),
      }
    );

    if (!notionRes.ok) {
      const error = await notionRes.text();
      return res.status(notionRes.status).json({ error });
    }

    const data: NotionResponse = await notionRes.json();

    const projects = data.results.map((page) => ({
      id: page.id,
      title: getText(page.properties['Proyecto']),
      place: getText(page.properties['Ubicación']),
      desc: getText(page.properties['Descripción']),
      img: getImage(page.properties['Portada']),
    }));

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(projects);
  } catch (err) {
    return res.status(500).json({ error: 'Error connecting to Notion' });
  }
}
