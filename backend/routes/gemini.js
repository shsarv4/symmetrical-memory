const express = require('express');
const router = express.Router();
const { getFirestore, admin } = require('../firebase/admin');
const config = require('../src/config');
const { verifyFirebaseToken } = require('../middleware/auth');

const db = getFirestore();
const SETTINGS_COLLECTION = 'appSettings';

// GET /api/gemini-test - Test AI connectivity (public, no auth required)
router.get('/test', async (req, res) => {
  try {
    // Check OpenRouter config
    const openrouterConfig = config.getOpenRouterConfig();

    if (!openrouterConfig.apiKey) {
      return res.json({ error: 'OpenRouter API key not configured' });
    }

    // Return available models list (hardcoded for now, could be dynamic)
    res.json({
      success: true,
      message: 'OpenRouter connection ready',
      availableModels: [
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', type: 'free' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', type: 'free' },
        { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B Instruct', provider: 'Mistral AI', type: 'free' },
        { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct', provider: 'Meta', type: 'free' },
        { id: 'google/gemma-7b-it', name: 'Gemma 7B IT', provider: 'Google', type: 'free' },
        { id: 'microsoft/phi-3-mini-4k-instruct', name: 'Phi-3 Mini 4K Instruct', provider: 'Microsoft', type: 'free' },
        { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', type: 'paid' },
        { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', type: 'paid' }
      ],
      hint: 'Select a model from the admin panel'
    });
  } catch (error) {
    console.error('AI test error:', error);
    res.status(500).json({
      error: 'AI test failed',
      message: error.message,
      details: error.toString()
    });
  }
});

// Apply auth middleware to all protected routes
router.use(verifyFirebaseToken);

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

// POST /api/gemini-chat - Send message and get streaming response
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get selected model from Firestore (admin can change this)
    const settingsDoc = await db.collection(SETTINGS_COLLECTION).doc('aiModel').get();
    // Use config default, then fallback to Mixtral (known working on OpenRouter)
    let selectedModel = (config.getOpenRouterConfig() || {}).model || 'mistralai/mixtral-8x7b-instruct';
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      if (data.model) {
        // Map short model IDs to full OpenRouter IDs if needed
        selectedModel = mapToOpenRouterModel(data.model);
      }
    }

    // Get OpenRouter API key
    const openrouterConfig = config.getOpenRouterConfig();
    const apiKey = openrouterConfig.apiKey;

    if (!apiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    // Build conversation history from Firestore (last 10 exchanges)
    const docRef = db.collection('geminiConversations').doc(req.user.uid);
    const doc = await docRef.get();
    const conversations = doc.exists ? (doc.data().conversations || []) : [];

    // Convert to OpenRouter message format
    const messages = [
      {
        role: 'system',
        content: `You are a supportive learning assistant for SwatiArc, a learning tracker app.
Your role is to:
- Answer questions about programming, data science, and course topics
- Provide encouragement and motivation
- Help users understand difficult concepts
- Give study tips and learning strategies
- Keep responses concise but helpful (2-3 paragraphs max)
- Use a warm, supportive tone (like a friend/mentor)
- If asked about code, provide clear explanations with examples`
      }
    ];

    // Add conversation history
    conversations.slice(-10).forEach(conv => {
      messages.push({ role: 'user', content: conv.userMessage });
      messages.push({ role: 'assistant', content: conv.aiResponse });
    });

    // Add current message
    messages.push({ role: 'user', content: message });

    // Add course context if available
    if (context) {
      const contextStr = Object.entries(context)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n');
      messages[0].content += `\n\nCurrent context:\n${contextStr}`;
    }

    // Call OpenRouter API with streaming
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:5173', // Your app URL
        'X-Title': 'SwatiArc Learning Tracker' // Your app name
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages,
        stream: true,
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `OpenRouter error: ${response.status}`);
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              res.write(content);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    res.end();

    // Save conversation to Firestore (async, don't wait)
    saveConversation(req.user.uid, message, fullResponse, context).catch(console.error);

  } catch (error) {
    console.error('❌ AI chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to get response from AI assistant',
        details: error.message
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

// Helper function to map short model IDs to OpenRouter format
function mapToOpenRouterModel(modelId) {
  // If already in full format (contains /), return as-is
  if (modelId.includes('/')) {
    return modelId;
  }

  // Map short IDs to full OpenRouter model IDs
  const modelMap = {
    'gemini-1.5-flash': 'google/gemini-1.5-flash',
    'gemini-1.5-pro': 'google/gemini-1.5-pro',
    'mixtral-8x7b-instruct': 'mistralai/mixtral-8x7b-instruct',
    'llama-3.3-70b-instruct': 'meta-llama/llama-3.3-70b-instruct',
    'gemma-7b-it': 'google/gemma-7b-it',
    'phi-3-mini-4k-instruct': 'microsoft/phi-3-mini-4k-instruct',
    'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
    'claude-3-opus': 'anthropic/claude-3-opus'
  };

  return modelMap[modelId] || modelId; // fallback to original if not found
}

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

  // Keep last 50 conversations
  const updated = [...conversations, newConv].slice(-50);

  await docRef.set({
    conversations: updated,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  });
}

module.exports = router;
