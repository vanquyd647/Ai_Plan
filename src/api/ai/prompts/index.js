const writerPrompt = require('../prompts/writer.prompt');
const rewriterPrompt = require('../prompts/rewriter.prompt');
const plannerPrompt = require('../prompts/planner.prompt');
const summaryPrompt = require('../prompts/summary.prompt');

const prompts = {
    writer: writerPrompt,
    rewriter: rewriterPrompt,
    planner: plannerPrompt,
    summary: summaryPrompt,
};

exports.getPromptByType = (type) => prompts[type];
