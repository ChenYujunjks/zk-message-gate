const { execSync } = require("child_process");
const fs = require("fs");

fs.mkdirSync("build", { recursive: true });

const r1cs = "build/merkle_message.r1cs";
const ptau0 = "build/pot12_0000.ptau";
const ptau1 = "build/pot12_0001.ptau";
const ptauFinal = "build/pot12_final.ptau";
const zkey0 = "build/merkle_message_0000.zkey";
const zkeyFinal = "build/merkle_message_final.zkey";
const vkey = "build/verification_key.json";

execSync(`npx snarkjs powersoftau new bn128 12 ${ptau0} -v`, {
  stdio: "inherit",
});

execSync(
  `npx snarkjs powersoftau contribute ${ptau0} ${ptau1} --name="First contribution" -v -e="random entropy"`,
  { stdio: "inherit" }
);

execSync(`npx snarkjs powersoftau prepare phase2 ${ptau1} ${ptauFinal} -v`, {
  stdio: "inherit",
});

execSync(`npx snarkjs groth16 setup ${r1cs} ${ptauFinal} ${zkey0}`, {
  stdio: "inherit",
});

execSync(
  `npx snarkjs zkey contribute ${zkey0} ${zkeyFinal} --name="Second contribution" -v -e="more random entropy"`,
  { stdio: "inherit" }
);

execSync(`npx snarkjs zkey export verificationkey ${zkeyFinal} ${vkey}`, {
  stdio: "inherit",
});

console.log("Setup complete.");