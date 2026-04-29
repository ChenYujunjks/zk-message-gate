const { execSync } = require("child_process");
const fs = require("fs");

fs.mkdirSync("build", { recursive: true });

execSync(
  "circom circuits/merkle_message.circom --r1cs --wasm --sym -o build",
  { stdio: "inherit" }
);

console.log("Compiled circuit.");