// frugal — OpenCode plugin. Appends the cost-awareness ruleset to every
// chat's system prompt and registers the skills directory. Reuses the shared
// instruction builder so every host reads one source of truth.
//
// OpenCode loads this as a server plugin — add it to your opencode.json:
//   { "plugin": ["frugal"] }

import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { getFrugalInstructions } = require('../../hooks/frugal-instructions');

export default async () => {
  const skillsDir = path.resolve(__dirname, '../../skills');

  return {
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }
      // ponytail: no slash-command registration — the always-on ruleset is
      // the product; add .opencode/command files if someone asks.
    },

    'experimental.chat.system.transform': async (_input, output) => {
      const instructions = getFrugalInstructions();
      if (output.system.length > 0) {
        output.system[output.system.length - 1] += '\n\n' + instructions;
      } else {
        output.system.push(instructions);
      }
    },
  };
};
