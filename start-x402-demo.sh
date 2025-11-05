#!/bin/bash

# Start X402 Demo - All Services
# This script starts all required services for ParallaxPay x402 demo

set -e

echo "🚀 Starting ParallaxPay X402 Demo"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if facilitator is already running
if curl -s http://localhost:3002/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Facilitator already running on port 3002"
else
    echo -e "${BLUE}Starting facilitator...${NC}"
    cd /home/user/parallaxpay/x402_facilitator
    npm run start:facilitator > /tmp/facilitator.log 2>&1 &
    FACILITATOR_PID=$!
    echo "  PID: $FACILITATOR_PID"
    sleep 3

    if curl -s http://localhost:3002/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Facilitator started successfully"
    else
        echo "❌ Facilitator failed to start. Check /tmp/facilitator.log"
        exit 1
    fi
fi

echo ""

# Check if provider agent is already running
if curl -s http://localhost:4001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Provider agent already running on port 4001"
else
    echo -e "${BLUE}Starting provider agent...${NC}"
    cd /home/user/parallaxpay/agents/provider
    npm start > /tmp/provider.log 2>&1 &
    PROVIDER_PID=$!
    echo "  PID: $PROVIDER_PID"
    sleep 3

    if curl -s http://localhost:4001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Provider agent started successfully"
    else
        echo "⚠️  Provider agent may not be running. Check /tmp/provider.log"
    fi
fi

echo ""
echo -e "${BLUE}Starting Next.js dashboard...${NC}"
cd /home/user/parallaxpay/parallaxpayx402
echo "  Running on http://localhost:3000"
echo ""
echo "=================================="
echo "🎉 All services ready!"
echo ""
echo "Services:"
echo "  • Facilitator: http://localhost:3002/health"
echo "  • Provider:    http://localhost:4001/health"
echo "  • Dashboard:   http://localhost:3000"
echo ""
echo "Logs:"
echo "  • Facilitator: /tmp/facilitator.log"
echo "  • Provider:    /tmp/provider.log"
echo ""
echo "Press Ctrl+C to stop Next.js (other services will continue running)"
echo "=================================="
echo ""

npm run dev
