const GPT3Tokenizer = require('gpt-3-encoder');

exports.countTokens = (text) => GPT3Tokenizer.encode(text).length;

exports.estimateCost = (text, ratePer1K = 0.002) => {
    const tokens = GPT3Tokenizer.encode(text).length;
    return {
        tokens,
        costUSD: +(tokens / 1000 * ratePer1K).toFixed(6)
    };
};
