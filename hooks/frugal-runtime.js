#!/usr/bin/env node
// Host detection + hook output shaping. One set of hook scripts serves
// Claude Code, Codex, Copilot, and Qoder; the host is detected from env
// vars and the output JSON shape adjusted accordingly.

const isCopilot = Boolean(process.env.COPILOT_PLUGIN_DATA);
const isCodex = !isCopilot && Boolean(process.env.PLUGIN_DATA);
const isQoder = !isCopilot && !isCodex && Boolean(process.env.QODER_SESSION_ID);

function writeHookOutput(event, context = '') {
  if (isCopilot) {
    // Copilot reads additionalContext on SessionStart; ignores output elsewhere.
    process.stdout.write(JSON.stringify(
      event === 'SessionStart' && context ? { additionalContext: context } : {}));
    return;
  }
  if (isCodex || isQoder) {
    const output = isCodex ? { systemMessage: 'FRUGAL:ON' } : {};
    if (context) {
      output.hookSpecificOutput = { hookEventName: event, additionalContext: context };
    }
    process.stdout.write(JSON.stringify(output));
    return;
  }
  // Native Claude Code: SessionStart takes raw stdout; every other event
  // needs the hookSpecificOutput JSON envelope.
  if (event === 'SessionStart') {
    process.stdout.write(context);
    return;
  }
  if (context) {
    process.stdout.write(JSON.stringify(
      { hookSpecificOutput: { hookEventName: event, additionalContext: context } }));
  }
}

module.exports = { isCopilot, isCodex, isQoder, writeHookOutput };
