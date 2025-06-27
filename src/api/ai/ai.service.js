const Gemini = require('../../utils/gemini');
const AISession = require('../ai/sessions/aiSession.service');

exports.generateContent = async (formattedPrompt) => {
    try {
        console.log('🤖 Calling Gemini with prompt:', formattedPrompt);
        
        const response = await Gemini.generateResponse(formattedPrompt);
        
        console.log('📥 Gemini raw response:', response);
        
        return response;
    } catch (error) {
        console.error('❌ Error in generateContent:', error.message);
        throw error;
    }
};

exports.getSessionById = async (sessionId) => {
    try {
        const session = await AISession.getById(sessionId);
        return session;
    } catch (error) {
        console.error('❌ Error getting session:', error.message);
        throw error;
    }
};
