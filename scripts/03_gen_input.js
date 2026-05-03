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

  const hash1 = (x) => {
    return F.toObject(poseidon([BigInt(x)])).toString();
  };

  const hash2 = (a, b) => {
    return F.toObject(poseidon([BigInt(a), BigInt(b)])).toString();
  };

  // Each member owns an identitySecret off-chain.
  // Admin only puts identityCommitment = Poseidon(identitySecret) into the Merkle tree.
  const identitySecrets = [
    "10001",
    "10002",
    "10003",
    "10004",
    "10005",
    "10006",
    "10007",
    "10008",
  ];

  const memberIndex = 2;
  const identitySecret = identitySecrets[memberIndex];

  // leaves = Poseidon(identitySecret)
  const leaves = identitySecrets.map((s) => hash1(s));

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

  // memberIndex = 2
  // leaf = leaves[2]
  // sibling path:
  // depth 0: leaves[3]
  // depth 1: level1[0]
  // depth 2: level2[1]
  const pathElements = [leaves[3], level1[0], level2[1]];
  const pathIndices = ["0", "1", "0"];

  const messageText = "hello from chicago";
  const messageHash = sha256ToField(messageText);

  // Second version:
  // nullifierHash = Poseidon(identitySecret, messageHash)
  const nullifierHash = hash2(identitySecret, messageHash);

  const input = {
    identitySecret,
    pathElements,
    pathIndices,
    root,
    messageHash,
    nullifierHash,
  };

  fs.writeFileSync("input.json", JSON.stringify(input, null, 2));

  console.log("Wrote input.json");
  console.log("messageText:", messageText);
  console.log("identitySecret:", identitySecret);
  console.log("root:", root);
  console.log("messageHash:", messageHash);
  console.log("nullifierHash:", nullifierHash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});