pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

// Whitelist leaf in Merkle tree MUST be:
// leaf = Poseidon(identitySecret)
//
// nullifierHash is derived as:
// nullifierHash = Poseidon(identitySecret, messageHash)
template MerkleMessageGate(depth) {
    // private inputs
    signal input identitySecret;
    signal input pathElements[depth];
    signal input pathIndices[depth];

    // public inputs
    signal input root;
    signal input messageHash;
    signal input nullifierHash;

    // leaf = Poseidon(identitySecret)
    component leafHasher = Poseidon(1);
    leafHasher.inputs[0] <== identitySecret;

    signal level[depth + 1];
    level[0] <== leafHasher.out;

    component h[depth];
    signal left[depth];
    signal right[depth];

    for (var i = 0; i < depth; i++) {
        // pathIndices[i] must be 0 or 1
        pathIndices[i] * (pathIndices[i] - 1) === 0;

        left[i] <== level[i] + pathIndices[i] * (pathElements[i] - level[i]);
        right[i] <== pathElements[i] + pathIndices[i] * (level[i] - pathElements[i]);

        h[i] = Poseidon(2);
        h[i].inputs[0] <== left[i];
        h[i].inputs[1] <== right[i];

        level[i + 1] <== h[i].out;
    }

    // Check Merkle root
    root === level[depth];

    // nullifierHash = Poseidon(identitySecret, messageHash)
    component nHash = Poseidon(2);
    nHash.inputs[0] <== identitySecret;
    nHash.inputs[1] <== messageHash;

    nullifierHash === nHash.out;
}

component main { public [root, messageHash, nullifierHash] } = MerkleMessageGate(3);