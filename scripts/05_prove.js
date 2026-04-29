const { execSync } = require("child_process");

const zkey = "build/merkle_message_final.zkey";
const witness = "build/merkle_message_witness.wtns";
const proof = "build/merkle_message_proof.json";
const publicSignals = "build/merkle_message_public.json";

execSync(`npx snarkjs groth16 prove ${zkey} ${witness} ${proof} ${publicSignals}`, {
  stdio: "inherit",
});

console.log("Proof generated:", proof);
console.log("Public signals generated:", publicSignals);