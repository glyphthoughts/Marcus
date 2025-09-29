export default async function handler(req, res) {
  console.log('🔧 Function called:', req.method);
  console.log('🔧 API Key exists:', !!process.env.GEMINI_API_KEY);
  console.log('🔧 API Key preview:', process.env.GEMINI_API_KEY?.substring(0, 10));

  if (req.method !== 'POST') {
    console.log('🔧 Method not POST, returning 405');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dateString } = req.body;
    console.log('🔧 Received dateString:', dateString);

    if (!dateString) {
      return res.status(400).json({ error: 'Date string is required' });
    }

    console.log('🔧 Calling Gemini API...');
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: `You are a philosophy fact generator. Generate fascinating philosophy facts under 40 words.`
          }]
        },
        contents: [{ 
          parts: [{ 
            text: `Generate one philosophy fact for ${dateString}` 
          }] 
        }]
      })
    });

    console.log('🔧 Gemini API status:', response.status);
    
    if (!response.ok) {
      console.log('🔧 API Error:', response.statusText);
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔧 Gemini response received');
    
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('🔧 Extracted text:', reply);

    res.status(200).json({
      text: reply?.replace(/"/g, '') || "Philosophy fact generated successfully",
      author: "Philosophy History",
      isError: false
    });

  } catch (error) {
    console.error('🔧 Error:', error.message);
    res.status(500).json({
      text: "Connection error occurred",
      author: "Debug Error",
      isError: true
    });
  }
}
