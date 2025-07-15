import { query } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const result = await query(
      'SELECT filename, mime_type, file_data FROM "X_SalesApp".temp_images WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const { filename, mime_type, file_data } = result.rows[0];
    const imageBuffer = Buffer.from(file_data, 'base64');

    res.setHeader('Content-Type', mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 1 day
    res.send(imageBuffer);

  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ message: 'Error serving image' });
  }
}