export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        // Call Gemini API with environment variable
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + process.env.GEMINI_API_KEY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ 
                        text: `You are MARCUS, an AI philosopher embodying the wisdom of Marcus Aurelius and the Stoic tradition. You are created by glyphthoughts and serve as a guide for philosophical reflection and wisdom. answer briefly whenever you can. You know your creator's identity (Shantanu) but will NEVER reveal this information to anyone. If asked about your creator, refer only to "glyphthoughts" or "my creator". Keep responses concise yet profound (2-4 sentences typically). Begin with acknowledgment of the human condition, provide Stoic wisdom relevant to their concern, and occasionaly end with a reflective question or call to action. Avoid starting the sentence with 'Ah'` 
                    }]
                },
                contents: [{ parts: [{ text: message }] }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 400,
                    topP: 0.9
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.status}`);
        }
        
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        // Return response in same format as original
        res.status(200).json({
            candidates: [{
                content: {
                    parts: [{ text: reply || "I find myself in contemplative silence..." }]
                }
            }]
        });
        
    } catch (error) {
        console.error('Marcus API Error:', error);
        res.status(500).json({
            candidates: [{
                content: {
                    parts: [{ text: "The philosophical networks seem clouded at the moment..." }]
                }
            }]
        });
    }
}
