# ZK Message Gate

## 🚀 Overview

This project implements a **zero-knowledge (zk) gated messaging system**.

Users can only send messages if they provide a **valid zk proof**, which proves:

* They are a member of a Merkle tree (membership proof)
* The proof is **bound to a specific message**
* The proof is **not reused** (via nullifier)

---

## 🧠 Key Idea

Instead of allowing anyone to call:

```solidity
sendMessage(address to, string content)
```

we upgrade it to:

```solidity
sendMessageWithProof(...)
```

So that:

```text
Only valid zk proof → message can be sent
```

---

## 🏗️ Architecture

```text
circom (circuit)
    ↓
snarkjs (proof generation, off-chain)
    ↓
proof (a, b, c, publicSignals)
    ↓
Solidity Verifier (on-chain)
    ↓
ZKMessage Contract (business logic)
```

---

## 🔑 Core Design

### 1. Message Binding

The proof is tied to a message:

```text
messageText → sha256 → messageHash
```

* This prevents sending a different message with the same proof
* Solidity recomputes `messageHash` to enforce correctness

---

### 2. Nullifier (Replay Protection)

```text
nullifierHash = Poseidon(nullifier, messageHash)
```

* Each proof can only be used once
* Prevents replay attacks

---

### 3. Merkle Membership

* Users prove they belong to a group
* `root` represents the group state

---

## 📁 Project Structure

```text
zk-message-gate/
├── circuits/
│   └── merkle_message.circom
├── scripts/
│   ├── 01_compile.js
│   ├── 02_setup.js
│   ├── 03_gen_input.js
│   ├── 04_witness.js
│   ├── 05_prove.js
│   ├── 06_verify.js
│   └── 07_export_verifier.js
├── contracts/
│   ├── Groth16Verifier.sol
│   └── ZKMessage.sol
├── build/
├── input.json
├── package.json
└── README.md
```

---

## ⚙️ How It Works

### Step 1: Generate Input

```bash
node scripts/03_gen_input.js
```

This creates:

```text
input.json
```

Example:

```json
{
  "root": "...",
  "messageHash": "...",
  "nullifierHash": "..."
}
```

---

### Step 2: Generate Witness

```bash
node scripts/04_witness.js
```

---

### Step 3: Generate Proof

```bash
node scripts/05_prove.js
```

Outputs:

```text
build/merkle_message_proof.json
build/merkle_message_public.json
```

---

### Step 4: Verify Locally

```bash
node scripts/06_verify.js
```

Expected:

```text
OK!
```

---

## 🔍 Important: Message Consistency

The message used in proof generation must match the one used on-chain.

Example:

```text
messageText = "gm zk world"
```

Then in Remix:

```solidity
computeMessageHash("gm zk world")
```

must equal:

```text
messageHash in input.json
```

Otherwise:

```text
verifyProof = false ❌
```

---

## 🧪 Testing in Remix

1. Deploy `Groth16Verifier.sol`

2. Deploy `ZKMessage.sol` with:

   * verifier address
   * merkle root

3. Call:

```solidity
sendMessageWithProof(
  to,
  "gm zk world",
  pA,
  pB,
  pC,
  nullifierHash
)
```

---

## ⚠️ Common Pitfalls

* ❌ messageHash mismatch (JS vs Solidity)
* ❌ wrong Merkle root
* ❌ reused nullifier
* ❌ using different message content

---

## 🧩 What This Project Demonstrates

* zk proof integration with smart contracts
* off-chain proving + on-chain verification
* binding cryptographic proofs to application logic
* replay protection using nullifiers

---

## 📌 Summary

```text
Proof is generated off-chain → Verified on-chain → Controls application behavior
```

This project upgrades a normal messaging system into a **zk-secured access-controlled system**.

---

## 🔥 Why It Matters

This pattern can be extended to:

* anonymous authentication
* private voting systems
* zk-based access control
* identity verification without revealing identity

---
