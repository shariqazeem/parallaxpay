#!/bin/bash

# ParallaxPay x402 - Start All Services
# This script starts the facilitator, provider, and Next.js app in the correct order

set -e

echo "🚀 Starting ParallaxPay x402 Services..."
echo ""

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "tsx watch" 2>/dev/null || true
pkill -f "x402_facilitator" 2>/dev/null || true
lsof -ti :3002 | xargs kill -9 2>/dev/null || true
lsof -ti :4001 | xargs kill -9 2>/dev/null || true
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
sleep 2

# Start facilitator
echo "1️⃣  Starting x402 Facilitator (port 3002)..."
cd x402_facilitator
npm run dev:facilitator > /tmp/facilitator.log 2>&1 &
FACILITATOR_PID=$!
cd ..

# Wait for facilitator to be ready
echo "   Waiting for facilitator..."
for i in {1..10}; do
  if curl -s http://localhost:3002/health > /dev/null 2>&1; then
    echo "   ✅ Facilitator ready"
    break
  fi
  sleep 1
done

# Start provider
echo "2️⃣  Starting Provider Agent (port 4001)..."
cd agents/provider
npm run dev > /tmp/provider.log 2>&1 &
PROVIDER_PID=$!
cd ../..

# Wait for provider to be ready
echo "   Waiting for provider..."
for i in {1..10}; do
  if curl -s http://localhost:4001/health > /dev/null 2>&1; then
    echo "   ✅ Provider ready"
    break
  fi
  sleep 1
done

# Start Next.js app
echo "3️⃣  Starting Next.js App (port 3000)..."
cd parallaxpayx402
npm run dev > /tmp/nextjs.log 2>&1 &
NEXTJS_PID=$!
cd ..

# Wait for Next.js to be ready
echo "   Waiting for Next.js..."
for i in {1..15}; do
  if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Next.js ready"
    break
  fi
  sleep 1
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✨ All services started successfully!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📝 Service URLs:"
echo "   • Facilitator:  http://localhost:3002/health"
echo "   • Provider:     http://localhost:4001/health"
echo "   • Next.js App:  http://localhost:3000"
echo ""
echo "📋 Logs:"
echo "   • Facilitator:  tail -f /tmp/facilitator.log"
echo "   • Provider:     tail -f /tmp/provider.log"
echo "   • Next.js:      tail -f /tmp/nextjs.log"
echo ""
echo "🛑 To stop all services:"
echo "   pkill -f 'tsx watch'"
echo "   pkill -f 'x402_facilitator'"
echo "   pkill -f 'next dev'"
echo ""
echo "💡 Test the setup:"
echo "   curl http://localhost:4001/health"
echo ""
echo "🌐 Open browser: http://localhost:3000"
echo "═══════════════════════════════════════════════════════════"
