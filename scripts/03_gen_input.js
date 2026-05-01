const fs = require("fs");
const crypto = require("crypto");
const { buildPoseidon } = require("circomlibjs");

const FIELD_SIZE = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);

function sha256ToField(text) {
  const hex = crypto.createHash("sha256").update(text, "utf8").digest("hex");
  return (BigInt("0x" + hex) % FIELD_SIZE).toString();
}

async function main() {
  const poseidon = await buildPoseidon();
  const F = poseidon.F;

  const leaves = ["100", "101", "102", "103", "104", "105", "106", "107"];
  const index = 2;
  const leaf = leaves[index];

  const hash2 = (a, b) =>
    F.toObject(poseidon([BigInt(a), BigInt(b)])).toString();

  const level1 = [
    hash2(leaves[0], leaves[1]),
    hash2(leaves[2], leaves[3]),
    hash2(leaves[4], leaves[5]),
    hash2(leaves[6], leaves[7]),
  ];

  const level2 = [
    hash2(level1[0], level1[1]),
    hash2(level1[2], level1[3]),
  ];

  const root = hash2(level2[0], level2[1]);

  const pathElements = [leaves[3], level1[0], level2[1]];
  const pathIndices = ["0", "1", "0"];

  const messageText = "hello from chicago";
  const messageHash = sha256ToField(messageText);

  const nullifier = "9002";
  const nullifierHash = hash2(nullifier, messageHash);

  const input = {
    leaf,
    pathElements,
    pathIndices,
    nullifier,
    root,
    messageHash,
    nullifierHash,
  };

  fs.writeFileSync("input.json", JSON.stringify(input, null, 2));

  console.log("Wrote input.json");
  console.log("messageText:", messageText);
  console.log("root:", root);
  console.log("messageHash:", messageHash);
  console.log("nullifierHash:", nullifierHash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});