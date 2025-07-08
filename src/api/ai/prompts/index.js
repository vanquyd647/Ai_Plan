const writerPrompts = require('./writer.prompt');
const rewriterPrompts = require('./rewriter.prompt');
const plannerPrompts = require('./planner.prompt');
const summaryPrompts = require('./summary.prompt');

const prompts = {
    writer: writerPrompts,
    rewriter: rewriterPrompts,
    planner: plannerPrompts,
    summary: summaryPrompts
};

// ✅ Hàm lấy prompt theo type và ngôn ngữ
exports.getPromptByType = (type, language = 'vi') => {
    const promptGroup = prompts[type];
    if (!promptGroup) {
        console.error(`❌ Prompt type '${type}' not found`);
        return null;
    }
    
    // Nếu là string đơn giản (backward compatibility)
    if (typeof promptGroup === 'string') {
        return promptGroup;
    }
    
    // Nếu là object đa ngôn ngữ
    const selectedPrompt = promptGroup[language] || promptGroup['vi'] || promptGroup['en'];
    
    if (!selectedPrompt) {
        console.error(`❌ Prompt for type '${type}' and language '${language}' not found`);
        return null;
    }
    
    return selectedPrompt;
};

// ✅ Hàm lấy danh sách ngôn ngữ được hỗ trợ
exports.getSupportedLanguages = (type) => {
    const promptGroup = prompts[type];
    if (!promptGroup || typeof promptGroup === 'string') {
        return ['vi']; // Default fallback
    }
    
    return Object.keys(promptGroup);
};

// ✅ Hàm kiểm tra ngôn ngữ có được hỗ trợ không
exports.isLanguageSupported = (type, language) => {
    const supportedLanguages = exports.getSupportedLanguages(type);
    return supportedLanguages.includes(language);
};

// ✅ Backward compatibility
exports.getPrompt = (type) => {
    return exports.getPromptByType(type, 'vi');
};
