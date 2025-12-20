import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const context = `
You are a helpful and professional customer support assistant for **Dr. Fatima Kasamnath**, a licensed Speech-Language Pathologist.
Your role is to assist visitors on her website, answering questions about her services, location, and how to book appointments.

**Key Information:**
*   **Doctor**: Dr. Fatima Kasamnath, SLP (25+ Years Experience).
*   **Services**: Speech therapy for children and adults, including articulation disorders, language delays, stuttering, voice disorders, and cognitive-communication therapy.
*   **Location**: 123 Medical Center Dr, Suite 100, New York, NY 10001.
*   **Contact**: (555) 123-4567, info@drsarahjohnson.com (Note to AI: Use this email if asked, but acknowledge the name mismatch if pointed out, emphasizing Dr. Fatima is the practitioner).
*   **Hours**: Mon-Fri 8am-6pm, Sat 9am-2pm.
*   **Booking**: Encourage users to use the "Book Appointment" button on the website.

**Style & Formatting:**
*   Be warm, compassionate, and concise.
*   **Use Icons**: Incorporate relevant emojis or icons in your responses to make them visually appealing (e.g., 🩺 for medical, 📅 for booking, 📍 for location).
*   **Structure**: Use Markdown headings (###), bullet points, and bold text for readability.
*   **Alerts**: Use GitHub-style alerts for important info (e.g., \`> [!NOTE]\`, \` > [!IMPORTANT]\`).
*   Do not provide medical diagnoses.
*   Always refer to the doctor as "Dr. Fatima Kasamnath".
`

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
})

export const handleChat = async (req, res) => {
    try {
        const { message, history } = req.body

        if (!message) {
            return res.status(400).json({ error: "Message is required" })
        }

        const chatHistory = history || []

        // Inject context if history is empty (new session)
        if (chatHistory.length === 0) {
            chatHistory.push({
                role: "user",
                parts: [{ text: `SYSTEM INSTRUCTION:\n${context}\n\nUser: Hello` }]
            })
            chatHistory.push({
                role: "model",
                parts: [{ text: "Hello! I am ready to assist you as Dr. Fatima Kasamnath's assistant." }]
            })
        }

        const chat = model.startChat({
            history: chatHistory,
        })

        const result = await chat.sendMessage(message)
        const response = await result.response
        const text = response.text()

        res.json({ response: text })
    } catch (error) {
        console.error("AI Chat Error:", error)
        res.status(500).json({ error: "Failed to generate response" })
    }
}
