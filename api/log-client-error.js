// /api/log-client-error.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { message, stack, url } = req.body;
    // Log the error details received from the client
    console.error('Client-side error report:', { message, stack, url });
    res.status(200).json({ message: 'Error logged successfully' });
  } catch (error) {
    console.error('Error handling client log:', error);
    res.status(500).json({ message: 'Failed to log error' });
  }
}
