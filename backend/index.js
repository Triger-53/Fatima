import express from 'express';
import cors from 'cors';
import { createMeeting } from './calendar.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint to create a meeting
app.post('/create-meeting', async (req, res) => {
  const { patientEmail, startDateTime, endDateTime } = req.body;

  if (!patientEmail || !startDateTime || !endDateTime) {
    return res.status(400).json({ error: 'Missing required fields: patientEmail, startDateTime, endDateTime' });
  }

  try {
    const meetLink = await createMeeting(patientEmail, startDateTime, endDateTime);
    res.status(200).json({ meetLink });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create meeting.' });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});