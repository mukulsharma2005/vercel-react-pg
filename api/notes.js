import { neon } from '@neondatabase/serverless';
export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    if (req.method === 'GET') {
      const notes = await sql`
        SELECT id, content, created_at
        FROM notes
        ORDER BY created_at DESC
        LIMIT 50
      `;
      return res.status(200).json({ notes });
    }

    if (req.method === 'POST') {
      const content = (req.body?.content || '').trim();
      if (!content) {
        return res.status(400).json({ error: 'Note content cannot be empty' });
      }
      const [note] = await sql`
        INSERT INTO notes (content)
        VALUES (${content})
        RETURNING id, content, created_at
      `;
      return res.status(201).json({ note });
    }

    if (req.method === 'DELETE') {
      const id = Number(req.query.id);
      if (!id) {
        return res.status(400).json({ error: 'Valid note ID required' });
      }
      await sql`DELETE FROM notes WHERE id = ${id}`;
      return res.status(200).json({ deleted: id });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database operation failed' });
  }
}