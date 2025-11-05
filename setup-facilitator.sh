#!/bin/bash

# X402 Facilitator Setup Script for ParallaxPay
# This script helps configure and start the x402 payment facilitator

set -e

echo "🚀 Starting X402 Facilitator Setup..."
echo ""

# Check if facilitator directory exists
if [ ! -d "x402_facilitator" ]; then
    echo "❌ Error: x402_facilitator directory not found"
    echo "Please run this script from the parallaxpay root directory"
    exit 1
fi

# Check if facilitator is already running
if pm2 list | grep -q "x402-facilitator.*online"; then
    echo "✅ Facilitator is already running"
    echo ""
    echo "To view logs: cd x402_facilitator && npm run logs"
    echo "To restart: cd x402_facilitator && npm restart"
    echo "To stop: cd x402_facilitator && npm stop"
else
    echo "📦 Building and starting facilitator..."
    cd x402_facilitator
    npm run build
    npm start
    cd ..
    echo ""
    echo "✅ Facilitator started successfully!"
fi

echo ""
echo "📊 Service Status:"
echo "=================="
echo ""

# Check facilitator status
if curl -s http://localhost:3002/health > /dev/null 2>&1; then
    echo "✅ Facilitator: Running on http://localhost:3002"
else
    echo "⚠️  Facilitator: Not responding"
fi

# Check provider agent
if curl -s http://localhost:4001/health > /dev/null 2>&1; then
    echo "✅ Provider Agent: Running on http://localhost:4001"
else
    echo "⚠️  Provider Agent: Not running (run 'cd agents/provider && npm start')"
fi

# Check Parallax
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Parallax: Running on http://localhost:3001"
else
    echo "⚠️  Parallax: Not running (run './start-parallax.sh')"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start Parallax: ./start-parallax.sh"
echo "2. Start Provider Agent: cd agents/provider && npm start"
echo "3. Test payment flow (see X402_QUICKSTART.md)"
