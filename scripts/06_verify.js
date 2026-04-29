const { execSync } = require("child_process");

const vkey = "build/verification_key.json";
const publicSignals = "build/merkle_message_public.json";
const proof = "build/merkle_message_proof.json";

execSync(`npx snarkjs groth16 verify ${vkey} ${publicSignals} ${proof}`, {
  stdio: "inherit",
});

console.log("Local proof verification finished.");