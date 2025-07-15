import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await query('SELECT NOW()');
      res.status(200).json({ 
        success: true, 
        message: 'Database connected successfully',
        time: result.rows[0].now 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Database connection failed',
        error: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}