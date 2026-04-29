const { execSync } = require("child_process");

const wasm = "build/merkle_message_js/merkle_message.wasm";
const input = "input.json";
const witness = "build/merkle_message_witness.wtns";

execSync(`npx snarkjs wtns calculate ${wasm} ${input} ${witness}`, {
  stdio: "inherit",
});

console.log("Witness generated:", witness);