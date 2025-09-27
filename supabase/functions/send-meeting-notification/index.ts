import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// This would be your email provider's API key, set as a Supabase secret
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

serve(async (req) => {
  try {
    const { patientEmail, meetingLink, scheduledAt, doctorName } = await req.json()

    if (!patientEmail || !meetingLink || !scheduledAt) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log(`--- Sending Email (Placeholder) ---`)
    console.log(`To: ${patientEmail}`)
    console.log(`Subject: Your upcoming consultation on ${new Date(scheduledAt).toLocaleDateString()}`)
    console.log(`Body: Hello, your meeting with ${doctorName || 'your doctor'} is scheduled for ${new Date(scheduledAt).toLocaleString()}. You can join using this link: ${meetingLink}`)
    console.log(`------------------------------------`)

    // --- Placeholder for Email API Integration (e.g., Resend) ---
    // In a real implementation, you would make a POST request to your email provider's API.
    // Example using Resend:
    //
    // const resendResponse = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${RESEND_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     from: 'Doctor <no-reply@yourdomain.com>',
    //     to: patientEmail,
    //     subject: `Your upcoming consultation on ${new Date(scheduledAt).toLocaleDateString()}`,
    //     html: `
    //       <p>Hello,</p>
    //       <p>Your meeting with ${doctorName || 'your doctor'} is scheduled for ${new Date(scheduledAt).toLocaleString()}.</p>
    //       <p>You can join using this link: <a href="${meetingLink}">${meetingLink}</a></p>
    //     `,
    //   }),
    // });
    //
    // if (!resendResponse.ok) {
    //   throw new Error('Failed to send email');
    // }

    return new Response(JSON.stringify({ message: "Notification sent successfully (placeholder)" }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})