const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

// Middleware 
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/conversations', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Conversation schema and model
const conversationSchema = new mongoose.Schema({
  userInput: String,
  geminiResponse: String,
  timestamp: { type: Date, default: Date.now }
});

const Conversation = mongoose.model('Conversation', conversationSchema);

// Endpoint to handle user input and interact with Gemini API
app.post('/api/conversation', async (req, res) => {
  const userInput = req.body.input;

  try {
    // Call the Gemini API
    const response = await axios.post('https://api.gemini.com/v1/chat', { input: userInput });
    const geminiResponse = response.data.response;

    // Save the conversation
    const conversation = new Conversation({ userInput, geminiResponse });
    await conversation.save();

    res.json({ geminiResponse });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ message: 'Error communicating with the Gemini API' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
