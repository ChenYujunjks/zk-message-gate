# DEV.md

## 🧠 Goal of This Project

Build a **zk-gated messaging system** where:

- Message sending requires a valid zk proof
- Proof is bound to message content
- Proof cannot be reused (nullifier)

---

## 🧩 System Mental Model

```text
Off-chain (Node.js)
    ↓
Generate proof (a, b, c, publicSignals)
    ↓
On-chain (Solidity)
    ↓
verifyProof(...)
    ↓
Business logic (store message)
```

---

## 🔑 Key Invariants (Must Always Hold)

### 1. messageHash consistency

```text
JS:
messageHash = sha256(messageText) % FIELD_SIZE

Solidity:
messageHash = sha256(_content) % FIELD_SIZE
```

👉 MUST be identical

If not:

```text
verifyProof = false
```

---

### 2. publicSignals order

```text
[ root, messageHash, nullifierHash ]
```

👉 Order mismatch = always fail

---

### 3. nullifier uniqueness

```text
usedNullifierHashes[nullifierHash] == false
```

👉 Prevent replay attacks

---

## 🏗️ Development Pipeline

### Step 1: Compile circuit

```bash
node scripts/01_compile.js
```

Outputs:

```text
.r1cs
.wasm
```

---

### Step 2: Trusted setup

```bash
node scripts/02_setup.js
```

Outputs:

```text
.zkey
verification_key.json
```

---

### Step 3: Generate input

```bash
node scripts/03_gen_input.js
```

Outputs:

```text
input.json
```

Includes:

```text
root
messageHash
nullifierHash
```

---

### Step 4: Witness

```bash
node scripts/04_witness.js
```

Outputs:

```text
.wtns
```

---

### Step 5: Proof

```bash
node scripts/05_prove.js
```

Outputs:

```text
proof.json
public.json
```

---

### Step 6: Verify locally

```bash
node scripts/06_verify.js
```

---

## ⚠️ Debugging Checklist

### ❌ Invalid zk proof

Check:

- messageHash mismatch
- wrong messageText
- wrong root
- wrong publicSignals order

---

### ❌ Missing files (.r1cs / .wasm)

Cause:

```text
compile step failed
```

Fix:

```bash
node scripts/01_compile.js
```

---

### ❌ Missing dependencies

Errors like:

```text
Cannot find module 'circomlibjs'
```

Fix:

```bash
npm install circomlibjs snarkjs
```

---

### ❌ Proof fails on-chain but works locally

Check:

```text
Remix computeMessageHash == input.json messageHash
```

---

## 🧨 Common Mistakes

### Mistake 1: Thinking Verifier generates proof

```text
❌ Verifier generates proof
✔ Verifier only verifies proof
```

---

### Mistake 2: Using wrong message

```text
Proof uses: "gm zk world"
Contract uses: "hello"
→ FAIL
```

---

### Mistake 3: Mixing old and new circuits

```text
old: publicHash
new: messageHash + nullifierHash
```

---

## 🧪 Testing Strategy

1. First test hash consistency
2. Then test local verify
3. Then test Remix
4. Finally integrate frontend

---

## 🚀 Future Improvements

- Move message content off-chain (IPFS / DB)
- Add frontend proof generation service
- Support dynamic Merkle tree updates
- Batch proof verification

---

## 🧠 Key Insight

```text
ZK is not about Solidity
ZK is about proving correctness off-chain
```

Solidity only enforces it.

---

## ⚠️ messageHash Match Does Not Mean Proof Match

A common confusion:

```text
computeMessageHash("gm zk world") matches input.json.messageHash
```

This only proves:

```text
JS hash logic == Solidity hash logic
```

It does **not** prove that the zk proof is valid.

There are three separate layers:

```text
1. messageHash
   Generated from the message text

2. proof
   Generated from witness + zkey

3. Verifier.sol
   Exported from the same zkey
```

For on-chain verification to succeed:

```text
proof must match the exact Verifier.sol generated from the same zkey
```

Even if `messageHash` is correct, verification will fail if:

```text
- Verifier.sol was exported from an old zkey
- proof was generated from a different zkey
- circuit was changed but verifier was not regenerated
```

Correct workflow:

```bash
node scripts/05_prove.js
node scripts/06_verify.js
node scripts/07_export_verifier.js
```

Then copy the newly exported:

```text
contracts/Groth16Verifier.sol
```

to Remix and redeploy both:

```text
1. Groth16Verifier
2. ZKMessage / MyContract
```

Debug rule:

```text
If computeMessageHash matches but verifyProof returns false,
the problem is usually proof/verifier mismatch, not messageHash.
```
