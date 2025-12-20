import dotenv from "dotenv"
dotenv.config()

async function test() {
    try {
        console.log("Fetching available models...")
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                // Filter for models that support content generation
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log("- " + m.name);
                }
            });
        } else {
            console.log("No models returned. Error response:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Listing failed:", error);
    }
}

test()
