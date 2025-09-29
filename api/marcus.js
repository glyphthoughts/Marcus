export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dateString } = req.body;

    if (!dateString) {
      return res.status(400).json({ error: 'Date string is required' });
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: `You are a philosophy fact generator. Generate only fascinating, educational philosophy facts. Keep responses under 40 words. Focus on historical events, biographical details, and interesting trivia about philosophers and philosophical movements. Be accurate and engaging.`
          }]
        },
        contents: [{ 
          parts: [{ 
            text: `Generate one fascinating philosophy fact for ${dateString}. Example: "Aristotle tutored Alexander the Great when he was just 13 years old."` 
          }] 
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 100,
          topP: 0.9
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    res.status(200).json({
      text: reply?.replace(/"/g, '') || "Philosophy wisdom is contemplating...",
      author: "Philosophy History",
      isError: false
    });

  } catch (error) {
    console.error('Philosophy API Error:', error);
    res.status(500).json({
      text: "Unable to connect to philosophy database. Please check your internet connection and try again.",
      author: "Connection Error",
      isError: true
    });
  }
}
