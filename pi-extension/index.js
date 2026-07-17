// frugal — pi extension. Appends the cost-awareness ruleset to the system
// prompt of every agent run.

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { getFrugalInstructions } = require("../hooks/frugal-instructions.js");

export default function frugalExtension(pi) {
  pi.on("before_agent_start", async (event) => {
    // Guard a null/undefined event or missing systemPrompt: don't crash and
    // don't prepend the literal string "undefined".
    const base = event?.systemPrompt ? `${event.systemPrompt}\n\n` : "";
    return { systemPrompt: `${base}${getFrugalInstructions()}` };
  });
}
