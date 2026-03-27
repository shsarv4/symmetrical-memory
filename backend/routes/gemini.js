const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getFirestore, admin } = require('../firebase/admin');
const config = require('../src/config');
const { verifyFirebaseToken } = require('../middleware/auth');

const db = getFirestore();

// Apply auth middleware to all protected routes
router.use(verifyFirebaseToken);

// Initialize Gemini (will be configured per request with user's context)
let genAI = null;

function getGeminiClient() {
  const geminiConfig = config.getGeminiConfig();

  // Check if Gemini is enabled
  if (geminiConfig.enabled === false) {
    throw new Error('Gemini AI is not enabled. Set "gemini.enabled": true in config.json');
  }

  const apiKey = geminiConfig.apiKey;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured in config.json');
  }

  try {
    if (!genAI) {
      console.log('🤖 Initializing Gemini AI with API key...');
      genAI = new GoogleGenerativeAI(apiKey);
      console.log('✅ Gemini AI initialized successfully');
    }
    return genAI;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini:', error.message);
    throw new Error(`Gemini initialization failed: ${error.message}`);
  }
}

// GET /api/gemini-conversations - Get user's conversation history
router.get('/conversations', async (req, res) => {
  try {
    const docRef = db.collection('geminiConversations').doc(req.user.uid);
    const doc = await docRef.get();

    if (doc.exists) {
      const data = doc.data();
      res.json({
        success: true,
        conversations: data.conversations || []
      });
    } else {
      res.json({
        success: true,
        conversations: []
      });
    }
  } catch (error) {
    console.error('Error loading conversations:', error);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
});

// GET /api/gemini-test - Test Gemini connectivity (debug only, PUBLIC)
router.get('/test', async (req, res) => {
  // No auth required for this test endpoint
  try {
    const geminiConfig = config.getGeminiConfig();

    if (!geminiConfig.enabled) {
      return res.json({ error: 'Gemini is disabled in config' });
    }

    if (!geminiConfig.apiKey) {
      return res.json({ error: 'Gemini API key not configured' });
    }

    // Try to initialize and list models
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(geminiConfig.apiKey);

    // List available models
    const models = await genAI.listModels();

    res.json({
      success: true,
      message: 'Gemini connection successful',
      availableModels: models.map(m => ({ name: m.name, displayName: m.displayName, supportedMethods: m.supportedGenerationMethods })),
      hint: 'Use one of these model names in the code'
    });
  } catch (error) {
    console.error('Gemini test error:', error);
    res.status(500).json({
      error: 'Gemini test failed',
      message: error.message,
      details: error.toString()
    });
  }
});

// POST /api/gemini-chat - Send message to Gemini and get streaming response
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get Gemini client
    const ai = getGeminiClient();
    // Use gemini-2.5-flash (latest, fast, supports 1M tokens)
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build conversation history from Firestore
    const docRef = db.collection('geminiConversations').doc(req.user.uid);
    const doc = await docRef.get();
    const conversations = doc.exists ? (doc.data().conversations || []) : [];

    // Build history for context (last 10 exchanges)
    const history = conversations.slice(-10).map(conv => [
      { role: 'user', parts: [{ text: conv.userMessage }] },
      { role: 'model', parts: [{ text: conv.aiResponse }] }
    ]).flat();

    // Build system prompt with context
    let systemPrompt = `You are a supportive learning assistant for SwatiArc, a learning tracker app.
Your role is to:
- Answer questions about programming, data science, and course topics
- Provide encouragement and motivation
- Help users understand difficult concepts
- Give study tips and learning strategies
- Keep responses concise but helpful (2-3 paragraphs max)
- Use a warm, feminine tone (like a supportive friend/mentor)
- If asked about code, provide clear explanations with examples`;

    // Add course context if available
    if (context) {
      systemPrompt += `\n\nCurrent user context:\n`;
      if (context.currentModule) {
        systemPrompt += `- Currently studying: ${context.currentModule.title}\n`;
      }
      if (context.progress !== undefined) {
        systemPrompt += `- Progress: ${context.progress}%\n`;
      }
    }

    // Start chat with history and system instruction
    const chat = model.startChat({
      history: history,
      systemInstruction: { role: 'user', parts: [{ text: systemPrompt }] },
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      }
    });

    // Send message and stream response
    const result = await chat.sendMessageStream(message);

    let fullResponse = '';
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      res.write(chunkText);
    }

    res.end();

    // Save conversation to Firestore (async, don't wait)
    saveConversation(req.user.uid, message, fullResponse, context).catch(console.error);

  } catch (error) {
    console.error('❌ Gemini chat error:', error);
    console.error('  Error code:', error.code);
    console.error('  Error message:', error.message);
    console.error('  Full error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to get response from AI assistant',
        details: error.message,
        code: error.code
      });
    }
  }
});

// POST /api/gemini-conversations/clear - Clear conversation history
router.post('/conversations/clear', async (req, res) => {
  try {
    const docRef = db.collection('geminiConversations').doc(req.user.uid);
    await docRef.set({
      conversations: [],
      clearedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, message: 'Conversation history cleared' });
  } catch (error) {
    console.error('Error clearing conversations:', error);
    res.status(500).json({ error: 'Failed to clear conversations' });
  }
});

async function saveConversation(uid, userMessage, aiResponse, context) {
  const docRef = db.collection('geminiConversations').doc(uid);
  const newConv = {
    userMessage,
    aiResponse,
    context: context || {},
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  };

  // Get existing and append
  const doc = await docRef.get();
  const conversations = doc.exists ? doc.data().conversations || [] : [];

  // Keep last 50 conversations (about 2500 messages)
  const updated = [...conversations, newConv].slice(-50);

  await docRef.set({
    conversations: updated,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  });
}

module.exports = router;
