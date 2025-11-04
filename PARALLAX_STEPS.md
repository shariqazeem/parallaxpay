# 🌊 Parallax Setup - Step by Step

## Current Status

✅ Parallax scheduler is running on port 3001
❌ No worker nodes joined yet (that's why you're getting 500 errors)

---

## What You Need to Do

The scheduler coordinates work, but you need at least ONE worker node to actually run the AI model.

### Option 1: Join Worker on Same Machine (Easiest)

Open a **new terminal** and run:

```bash
cd parallaxpay/parallax
source venv/bin/activate
parallax join
```

This will:
- Connect as a worker to the scheduler
- Download the model (first time only, ~600MB)
- Start processing inference requests

**Wait for**: "Connected to scheduler" message

---

### Option 2: Join Worker on Different Machine

On another computer:

```bash
# In terminal 1 where scheduler is running, look for the multiaddress
# It looks like: /ip4/192.168.1.x/tcp/xxxxx/p2p/12D3Koo...

# On the other machine:
cd parallax
source venv/bin/activate
parallax join -s <multiaddress-from-scheduler>
```

---

## Complete Terminal Layout

Here's what you should have running:

```
Terminal 1: Parallax Scheduler
$ cd parallaxpay/parallax
$ source venv/bin/activate
$ parallax run --host 0.0.0.0
✅ Currently running (port 3001)

Terminal 2: Parallax Worker
$ cd parallaxpay/parallax
$ source venv/bin/activate
$ parallax join
⏳ Need to run this NOW

Terminal 3: Provider Agent
$ cd parallaxpay/agents/provider
$ npm start
✅ Running (port 4001)

Terminal 4: Client Demo
$ cd parallaxpay/agents/client
$ npm run demo
⏳ Run after worker joins
```

---

## Expected Output

### Terminal 2 (Worker Join)

```
Connecting to scheduler...
✓ Connected to scheduler
Downloading model Qwen/Qwen3-0.6B...
[████████████████████] 100%
✓ Model loaded
✓ Worker ready
Listening for requests...
```

**First time**: Model download takes 2-5 minutes
**After that**: Instant startup

---

## Verify It's Working

After joining the worker, test:

```bash
# Should return AI response now
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "max_tokens": 50,
    "messages": [{"role": "user", "content": "Say hello!"}],
    "stream": false
  }'
```

---

## Then Run Client Demo

Once worker is ready:

```bash
cd parallaxpay/agents/client
npm run demo
```

Should now work end-to-end! 🎉

---

## Troubleshooting

**"Cannot connect to scheduler"**
```bash
# Make sure scheduler is running
lsof -i :3001

# Check firewall isn't blocking
```

**"Model download failed"**
```bash
# Check internet connection
# HuggingFace might be slow, be patient
# Model is ~600MB for Qwen3-0.6B
```

**"Still getting 500 errors"**
```bash
# Check provider logs in Terminal 3
# Should see: "🌊 Calling Parallax at http://localhost:3001"
# Then: "✅ Inference request completed"
```

---

## Quick Commands

```bash
# Join worker (same machine)
cd parallaxpay/parallax && source venv/bin/activate && parallax join

# Check scheduler status
curl http://localhost:3001/v1/chat/completions -X POST \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hi"}],"max_tokens":10}'

# Restart provider if needed
cd parallaxpay/agents/provider && npm start

# Run client demo
cd parallaxpay/agents/client && npm run demo
```

---

## Architecture

```
┌─────────────────┐
│   Scheduler     │  ← Terminal 1 (running ✓)
│   Port 3001     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Worker Node   │  ← Terminal 2 (NEED TO JOIN!)
│   (local join)  │
└─────────────────┘
         ↑
         │ calls
┌─────────────────┐
│ Provider Agent  │  ← Terminal 3 (running ✓)
│   Port 4001     │
└─────────────────┘
         ↑
         │ pays + requests
┌─────────────────┐
│  Client Agent   │  ← Terminal 4 (ready to test)
└─────────────────┘
```

---

## Next Step

**Right now, open a new terminal and run:**

```bash
cd parallaxpay/parallax
source venv/bin/activate
parallax join
```

Wait for model to download (first time only), then try the demo again! 🚀
