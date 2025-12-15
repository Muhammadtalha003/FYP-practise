#!/bin/bash

# HEC University Degree Verification System - Main Startup Script
# This script provides easy commands to start and manage the entire application

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print banner
print_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║     HEC University Degree Verification System                 ║"
    echo "║     Powered by Hyperledger Fabric                             ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Print colored output
print_step() {
    echo -e "${BLUE}► $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Start demo mode (without Fabric network)
start_demo() {
    print_banner
    echo -e "${PURPLE}Starting in DEMO MODE (without Fabric network)${NC}"
    echo ""
    
    # Check prerequisites
    print_step "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
    echo ""
    
    # Install backend dependencies
    print_step "Installing backend dependencies..."
    cd "${SCRIPT_DIR}/backend"
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    # Create .env if it doesn't exist
    if [ ! -f ".env" ]; then
        cp .env.example .env 2>/dev/null || echo "PORT=5000
NODE_ENV=development
JWT_SECRET=demo-secret-key-change-in-production
DEMO_MODE=true" > .env
    fi
    print_success "Backend ready!"
    
    # Install frontend dependencies
    print_step "Installing frontend dependencies..."
    cd "${SCRIPT_DIR}/frontend"
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    print_success "Frontend ready!"
    echo ""
    
    # Start backend
    print_step "Starting backend server on port 5000..."
    cd "${SCRIPT_DIR}/backend"
    npm run dev &
    BACKEND_PID=$!
    sleep 3
    
    if check_port 5000; then
        print_success "Backend started!"
    else
        print_warning "Backend might take a moment to start..."
    fi
    
    # Start frontend
    print_step "Starting frontend on port 3000..."
    cd "${SCRIPT_DIR}/frontend"
    npm start &
    FRONTEND_PID=$!
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                    APPLICATION STARTED!                        ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${CYAN}Frontend:${NC}     http://localhost:3000"
    echo -e "  ${CYAN}Backend API:${NC}  http://localhost:5000"
    echo ""
    echo -e "  ${YELLOW}Demo Credentials:${NC}"
    echo -e "  ${CYAN}HEC Admin:${NC}    admin@hec.edu.pk / admin123"
    echo -e "  ${CYAN}University:${NC}   registrar@pu.edu.pk / password123"
    echo ""
    echo -e "  ${YELLOW}Press Ctrl+C to stop the application${NC}"
    echo ""
    
    # Wait for user to stop
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
    wait
}

# Start full mode (with Fabric network)
start_full() {
    print_banner
    echo -e "${PURPLE}Starting FULL MODE (with Fabric network)${NC}"
    echo ""
    
    # Check prerequisites
    print_step "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
    echo ""
    
    # Start Fabric network
    print_step "Starting Hyperledger Fabric network..."
    cd "${SCRIPT_DIR}/network"
    chmod +x scripts/*.sh
    ./scripts/network.sh up
    
    if [ $? -ne 0 ]; then
        print_error "Failed to start Fabric network"
        exit 1
    fi
    print_success "Fabric network started!"
    echo ""
    
    # Deploy chaincode
    print_step "Deploying chaincode..."
    ./scripts/deploy-chaincode.sh deploy
    
    if [ $? -ne 0 ]; then
        print_error "Failed to deploy chaincode"
        exit 1
    fi
    print_success "Chaincode deployed!"
    echo ""
    
    # Start backend
    print_step "Starting backend server..."
    cd "${SCRIPT_DIR}/backend"
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm start &
    BACKEND_PID=$!
    sleep 3
    print_success "Backend started!"
    
    # Start frontend
    print_step "Starting frontend..."
    cd "${SCRIPT_DIR}/frontend"
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm start &
    FRONTEND_PID=$!
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                    APPLICATION STARTED!                        ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${CYAN}Frontend:${NC}     http://localhost:3000"
    echo -e "  ${CYAN}Backend API:${NC}  http://localhost:5000"
    echo ""
    echo -e "  ${YELLOW}Fabric Network:${NC}"
    echo -e "  ${CYAN}Orderer:${NC}      localhost:7050"
    echo -e "  ${CYAN}HEC Peer:${NC}     localhost:7051"
    echo -e "  ${CYAN}PU Peer:${NC}      localhost:9051"
    echo -e "  ${CYAN}LUMS Peer:${NC}    localhost:11051"
    echo ""
    echo -e "  ${YELLOW}Press Ctrl+C to stop the application${NC}"
    echo ""
    
    # Wait for user to stop
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
    wait
}

# Stop everything
stop_all() {
    print_banner
    print_step "Stopping all services..."
    
    # Kill Node processes
    pkill -f "node.*backend" 2>/dev/null
    pkill -f "react-scripts" 2>/dev/null
    
    # Stop Fabric network
    cd "${SCRIPT_DIR}/network"
    if [ -f "docker-compose.yaml" ]; then
        docker-compose down -v --remove-orphans 2>/dev/null
    fi
    
    print_success "All services stopped!"
}

# Show status
show_status() {
    print_banner
    echo -e "${CYAN}Service Status:${NC}"
    echo ""
    
    # Check backend
    if check_port 5000; then
        echo -e "  ${GREEN}●${NC} Backend API (port 5000):    ${GREEN}Running${NC}"
    else
        echo -e "  ${RED}○${NC} Backend API (port 5000):    ${RED}Stopped${NC}"
    fi
    
    # Check frontend
    if check_port 3000; then
        echo -e "  ${GREEN}●${NC} Frontend (port 3000):       ${GREEN}Running${NC}"
    else
        echo -e "  ${RED}○${NC} Frontend (port 3000):       ${RED}Stopped${NC}"
    fi
    
    # Check Fabric network
    echo ""
    echo -e "${CYAN}Fabric Network:${NC}"
    if docker ps --filter "name=peer0.hec.edu.pk" --filter "status=running" --format "{{.Names}}" | grep -q "peer0.hec.edu.pk"; then
        echo -e "  ${GREEN}●${NC} HEC Peer0:                  ${GREEN}Running${NC}"
    else
        echo -e "  ${RED}○${NC} HEC Peer0:                  ${RED}Stopped${NC}"
    fi
    
    if docker ps --filter "name=peer0.pu.edu.pk" --filter "status=running" --format "{{.Names}}" | grep -q "peer0.pu.edu.pk"; then
        echo -e "  ${GREEN}●${NC} PU Peer0:                   ${GREEN}Running${NC}"
    else
        echo -e "  ${RED}○${NC} PU Peer0:                   ${RED}Stopped${NC}"
    fi
    
    if docker ps --filter "name=orderer.hec.edu.pk" --filter "status=running" --format "{{.Names}}" | grep -q "orderer.hec.edu.pk"; then
        echo -e "  ${GREEN}●${NC} Orderer:                    ${GREEN}Running${NC}"
    else
        echo -e "  ${RED}○${NC} Orderer:                    ${RED}Stopped${NC}"
    fi
    
    echo ""
}

# Main function
main() {
    case "$1" in
        demo)
            start_demo
            ;;
        start)
            start_full
            ;;
        stop)
            stop_all
            ;;
        status)
            show_status
            ;;
        *)
            print_banner
            echo "Usage: $0 {demo|start|stop|status}"
            echo ""
            echo "Commands:"
            echo -e "  ${CYAN}demo${NC}    - Start in demo mode (no Fabric network required)"
            echo -e "  ${CYAN}start${NC}   - Start full application with Fabric network"
            echo -e "  ${CYAN}stop${NC}    - Stop all services"
            echo -e "  ${CYAN}status${NC}  - Show status of all services"
            echo ""
            echo "Quick Start:"
            echo -e "  ${YELLOW}./start.sh demo${NC}   - Recommended for testing the UI"
            echo -e "  ${YELLOW}./start.sh start${NC}  - For full blockchain functionality"
            echo ""
            exit 1
            ;;
    esac
}

main "$@"
