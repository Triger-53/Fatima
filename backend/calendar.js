import { google } from 'googleapis';
import { auth } from 'google-auth-library';
import 'dotenv/config';

// Define the scope for Google Calendar API
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Get credentials from environment variables
const client_email = process.env.GOOGLE_CLIENT_EMAIL;
const private_key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

if (!client_email || !private_key) {
  throw new Error('Missing Google Calendar credentials in .env file');
}

// Create a new JWT client using the service account key
const jwtClient = new auth.JWT(
  client_email,
  null,
  private_key,
  SCOPES
);

// Get the calendar instance
const calendar = google.calendar({
  version: 'v3',
  auth: jwtClient
});

/**
 * Creates a new Google Calendar event with a Google Meet link.
 * @param {string} patientEmail - The email address of the patient.
 * @param {string} startDateTime - The start date and time of the event in ISO format.
 * @param {string} endDateTime - The end date and time of the event in ISO format.
 * @returns {Promise<string>} The generated Google Meet link.
 */
export async function createMeeting(patientEmail, startDateTime, endDateTime) {
  const event = {
    summary: 'Patient Consultation',
    description: 'A private consultation with a patient.',
    start: {
      dateTime: startDateTime,
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'Asia/Kolkata',
    },
    attendees: [{ email: patientEmail }],
    conferenceData: {
      createRequest: {
        requestId: `create-meeting-${Date.now()}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
      conferenceDataVersion: 1,
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: process.env.CALENDAR_ID,
      resource: event,
      conferenceDataVersion: 1,
    });

    const meetLink = response.data.hangoutLink;
    console.log('Event created:', response.data.htmlLink);
    console.log('Meet Link:', meetLink);
    return meetLink;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw new Error('Failed to create calendar event.');
  }
}

// Example usage:
// createMeeting(
//   "patient@example.com",
//   "2025-09-28T10:00:00+05:30",
//   "2025-09-28T10:30:00+05:30"
// ).then(link => console.log("Returned Meet Link:", link));