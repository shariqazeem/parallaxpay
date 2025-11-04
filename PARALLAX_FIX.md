# 🔧 Parallax Setup Fix

## Problem

You're seeing these errors:
- `Failed to get scheduler peer id`
- `Failed to build lattica`
- `Server is not ready`

This means the scheduler started but Lattica (P2P layer) didn't initialize properly.

---

## ✅ Solution: Use Frontend Method (Easiest)

The frontend method handles all the P2P setup automatically.

### Step 1: Stop Current Scheduler

In Terminal 1 where scheduler is running:
```bash
# Press Ctrl+C to stop
```

### Step 2: Start Fresh with Frontend

```bash
cd parallaxpay/parallax
source venv/bin/activate
parallax run --host 0.0.0.0
```

**Wait for**: "Open http://localhost:3002" message

### Step 3: Open Browser Setup

Visit: **http://localhost:3002**

You should see the Parallax setup interface where you can:
1. Select nodes to use (check your machine)
2. Select model (choose Qwen/Qwen3-0.6B for speed)
3. Click "Continue"

### Step 4: The Interface Will Show Join Command

The web UI will display something like:
```bash
parallax join
```

Copy this exact command!

### Step 5: In NEW Terminal, Run Join Command

```bash
cd parallaxpay/parallax
source venv/bin/activate
parallax join
```

**First time**: Model downloads (~600MB, 5-10 min)
**After that**: Connects instantly

---

## Alternative: Manual Configuration

If frontend doesn't work, try specifying everything manually:

### Step 1: Kill Everything

```bash
# Find and kill all parallax processes
pkill -f parallax
```

### Step 2: Start Scheduler with Specific Config

```bash
cd parallaxpay/parallax
source venv/bin/activate

# Start with explicit model and node count
parallax run \
  --model Qwen/Qwen3-0.6B \
  --num-nodes 1 \
  --host 0.0.0.0 \
  --port 3001
```

Look for the **scheduler peer ID** in logs (looks like: `12D3Koo...`)

### Step 3: Join with Explicit Peer ID

In new terminal:
```bash
cd parallaxpay/parallax
source venv/bin/activate

# Replace with actual peer ID from scheduler logs
parallax join -s 12D3KooWLX7MWuzi1Txa5LyZS4eTQ2tPaJijheH8faHggB9SxnBu
```

---

## ⚡ Fastest Demo Alternative: Skip Parallax!

If Parallax is giving you trouble, you can demo the system without it:

### The Provider Agent Already Has Mock Mode!

When Parallax isn't available, it automatically uses mock responses. This still shows:
- ✅ Autonomous agent discovery
- ✅ Real Solana payments on-chain
- ✅ Budget management
- ✅ Reputation tracking
- ✅ Full marketplace UI

**Just run**:
```bash
# Terminal 1: Provider (will use mock when Parallax unavailable)
cd parallaxpay/agents/provider
npm start

# Terminal 2: Client Demo
cd parallaxpay/agents/client
npm run demo

# Terminal 3: Dashboard
cd parallaxpay/parallaxpayx402
npm run dev
```

**For demo**: Say "In production, this would use Gradient Parallax for distributed inference. For this demo, we're showing the autonomous payment and discovery system."

---

## Check Network Permissions (macOS)

The Lattica error might be network permissions:

1. **System Settings** → **Privacy & Security** → **Local Network**
2. Find **Terminal** (or iTerm, VS Code, etc.)
3. Toggle **ON** to allow local network access
4. Restart terminal and try again

---

## Verify Parallax Installation

```bash
cd parallaxpay/parallax
source venv/bin/activate

# Check installation
pip list | grep parallax

# Reinstall if needed
pip uninstall parallax -y
pip install -e '.[mac]'
```

---

## Expected Working Output

### Scheduler (Terminal 1)
```
✓ Lattica initialized
✓ Scheduler started on port 3001
✓ Web UI available at http://localhost:3002
Waiting for nodes to join...
```

### Worker Join (Terminal 2)
```
✓ Connected to scheduler
Downloading Qwen/Qwen3-0.6B...
[████████████] 100%
✓ Model loaded
✓ Worker ready
Waiting for requests...
```

### Test (Terminal 3)
```bash
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role":"user","content":"Hi!"}],
    "max_tokens": 50
  }'

# Should return:
# {"choices":[{"message":{"content":"Hello! How can I help..."}}]}
```

---

## Decision Tree

```
Can you access http://localhost:3002?
├─ YES → Use frontend method (easiest)
│        Visit 3002, configure, copy join command
│
└─ NO → Try these in order:
        1. Check network permissions (System Settings)
        2. Try manual config with explicit peer ID
        3. Use mock mode (skip Parallax for now)
```

---

## Recommended for Hackathon Demo

**Option A**: Get Parallax working with frontend method
- Most impressive for judges
- Shows true distributed inference
- Worth the setup time

**Option B**: Demo without Parallax using mock mode
- Still shows all the x402 + Solana magic
- Real on-chain payments
- Autonomous agents working
- Faster to setup

Both are valid! The hackathon is about the **marketplace concept**, not just Parallax integration.

---

## Next Steps

1. **Try frontend method first** (http://localhost:3002)
2. **If that fails**, use mock mode and focus on polishing the demo
3. **Check network permissions** on macOS
4. **Time box it**: Don't spend >30 min debugging Parallax

Let's get you a working demo! 🚀
