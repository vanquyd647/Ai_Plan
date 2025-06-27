// File: src/utils/gemini.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('../config/gemini');

// This check is good practice to ensure the key is loaded correctly.
if (!config.apiKey) {
    throw new Error("Gemini API key is not found in the configuration file.");
}

const geminiApiKey = config.apiKey; // Lấy API key từ cấu hình

// Khởi tạo SDK của Google Generative AI
const googleAI = new GoogleGenerativeAI(geminiApiKey);

// --- THE MAIN FIX IS HERE ---
// Select the latest model. You can also use "gemini-1.0-pro".
const model = googleAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Gửi yêu cầu đến Gemini AI API để tạo nội dung
 * @param {string} promptText - Nội dung yêu cầu (prompt)
 * @returns {Promise<string>} - Kết quả trả về từ Gemini
 */
async function generateResponse(promptText) {
    try {
        // Gửi yêu cầu tạo nội dung
        const result = await model.generateContent(promptText);

        // Lấy kết quả từ phản hồi
        const response = await result.response;
        return response.text();
    } catch (error) {
        // Log the detailed error for debugging purposes
        console.error("Error generating content from Gemini:", error);
        // Throw a user-friendly error to the caller
        throw new Error("Failed to generate response from Gemini AI.");
    }
}

// It's best practice to only export the function from a utility file.
// The example usage code should be moved to the file where you will actually use this function.
module.exports = { generateResponse };