const { execSync } = require("child_process");

execSync(
  `npx snarkjs zkey export solidityverifier build/merkle_message_final.zkey contracts/Groth16Verifier.sol`,
  { stdio: "inherit" }
);

console.log("Verifier exported to contracts/Groth16Verifier.sol");