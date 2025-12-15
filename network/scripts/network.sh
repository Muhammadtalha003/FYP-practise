#!/bin/bash

# HEC University Degree Verification Network - Setup Script
# This script generates crypto materials, creates channel artifacts,
# starts the network, and deploys chaincode

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_step() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

print_error() {
    echo -e "${RED}ERROR: $1${NC}"
}

# Configuration
CHANNEL_NAME="degreechannel"
CC_NAME="degree"
CC_VERSION="1.0"
CC_SEQUENCE=1
CC_SRC_PATH="../chaincode/javascript"

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check cryptogen
    if ! command -v cryptogen &> /dev/null; then
        print_warning "cryptogen not found in PATH. Will use fabric-tools container."
    fi
    
    # Check configtxgen
    if ! command -v configtxgen &> /dev/null; then
        print_warning "configtxgen not found in PATH. Will use fabric-tools container."
    fi
    
    echo "Prerequisites check passed!"
}

# Clean up existing network
cleanup() {
    print_step "Cleaning up existing network..."
    
    # Stop and remove containers
    docker-compose down -v --remove-orphans 2>/dev/null || true
    
    # Remove generated files
    rm -rf crypto-config channel-artifacts
    rm -f *.tar.gz
    
    # Remove chaincode containers and images
    docker rm -f $(docker ps -aq --filter "name=dev-peer") 2>/dev/null || true
    docker rmi -f $(docker images -q "dev-peer*") 2>/dev/null || true
    
    echo "Cleanup completed!"
}

# Generate crypto materials
generate_crypto() {
    print_step "Generating crypto materials..."
    
    # Create output directory
    mkdir -p crypto-config
    
    # Generate crypto materials using cryptogen
    if command -v cryptogen &> /dev/null; then
        cryptogen generate --config=./crypto-config.yaml --output=./crypto-config
    else
        docker run --rm \
            -v $(pwd):/data \
            -w /data \
            hyperledger/fabric-tools:2.5 \
            cryptogen generate --config=/data/crypto-config.yaml --output=/data/crypto-config
    fi
    
    echo "Crypto materials generated!"
}

# Generate channel artifacts
generate_artifacts() {
    print_step "Generating channel artifacts..."
    
    # Create output directory
    mkdir -p channel-artifacts
    
    # Set FABRIC_CFG_PATH
    export FABRIC_CFG_PATH=$(pwd)
    
    if command -v configtxgen &> /dev/null; then
        # Generate genesis block
        configtxgen -profile HECOrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block
        
        # Generate channel configuration transaction
        configtxgen -profile DegreeVerificationChannel -outputCreateChannelTx ./channel-artifacts/${CHANNEL_NAME}.tx -channelID ${CHANNEL_NAME}
        
        # Generate anchor peer transactions
        configtxgen -profile DegreeVerificationChannel -outputAnchorPeersUpdate ./channel-artifacts/HECAnchor.tx -channelID ${CHANNEL_NAME} -asOrg HECMSP
        configtxgen -profile DegreeVerificationChannel -outputAnchorPeersUpdate ./channel-artifacts/PUAnchor.tx -channelID ${CHANNEL_NAME} -asOrg PunjabUniversityMSP
        configtxgen -profile DegreeVerificationChannel -outputAnchorPeersUpdate ./channel-artifacts/LUMSAnchor.tx -channelID ${CHANNEL_NAME} -asOrg LUMSMSP
    else
        docker run --rm \
            -v $(pwd):/data \
            -w /data \
            -e FABRIC_CFG_PATH=/data \
            hyperledger/fabric-tools:2.5 \
            bash -c "
                configtxgen -profile HECOrdererGenesis -channelID system-channel -outputBlock /data/channel-artifacts/genesis.block
                configtxgen -profile DegreeVerificationChannel -outputCreateChannelTx /data/channel-artifacts/${CHANNEL_NAME}.tx -channelID ${CHANNEL_NAME}
                configtxgen -profile DegreeVerificationChannel -outputAnchorPeersUpdate /data/channel-artifacts/HECAnchor.tx -channelID ${CHANNEL_NAME} -asOrg HECMSP
                configtxgen -profile DegreeVerificationChannel -outputAnchorPeersUpdate /data/channel-artifacts/PUAnchor.tx -channelID ${CHANNEL_NAME} -asOrg PunjabUniversityMSP
                configtxgen -profile DegreeVerificationChannel -outputAnchorPeersUpdate /data/channel-artifacts/LUMSAnchor.tx -channelID ${CHANNEL_NAME} -asOrg LUMSMSP
            "
    fi
    
    echo "Channel artifacts generated!"
}

# Start the network
start_network() {
    print_step "Starting the network..."
    
    docker-compose up -d
    
    # Wait for network to start
    echo "Waiting for network to start..."
    sleep 10
    
    # Check if containers are running
    docker ps --filter "name=peer0.hec.edu.pk" --filter "status=running" --format "{{.Names}}"
    docker ps --filter "name=orderer.hec.edu.pk" --filter "status=running" --format "{{.Names}}"
    
    echo "Network started!"
}

# Create and join channel
create_channel() {
    print_step "Creating channel: ${CHANNEL_NAME}..."
    
    docker exec cli bash -c "
        # Create channel
        peer channel create -o orderer.hec.edu.pk:7050 \
            -c ${CHANNEL_NAME} \
            -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.tx \
            --outputBlock /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.block \
            --tls \
            --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/hec.edu.pk/orderers/orderer.hec.edu.pk/msp/tlscacerts/tlsca.hec.edu.pk-cert.pem
    "
    
    echo "Channel created!"
}

# Join peers to channel
join_channel() {
    print_step "Joining peers to channel..."
    
    # HEC Peers
    docker exec cli bash -c "
        # Join peer0.hec
        CORE_PEER_ADDRESS=peer0.hec.edu.pk:7051 \
        CORE_PEER_LOCALMSPID=HECMSP \
        CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hec.edu.pk/peers/peer0.hec.edu.pk/tls/ca.crt \
        CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hec.edu.pk/users/Admin@hec.edu.pk/msp \
        peer channel join -b /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.block
    "
    
    docker exec cli bash -c "
        # Join peer1.hec
        CORE_PEER_ADDRESS=peer1.hec.edu.pk:8051 \
        CORE_PEER_LOCALMSPID=HECMSP \
        CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hec.edu.pk/peers/peer1.hec.edu.pk/tls/ca.crt \
        CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hec.edu.pk/users/Admin@hec.edu.pk/msp \
        peer channel join -b /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.block
    "
    
    # Punjab University Peers
    docker exec cli bash -c "
        # Join peer0.pu
        CORE_PEER_ADDRESS=peer0.pu.edu.pk:9051 \
        CORE_PEER_LOCALMSPID=PunjabUniversityMSP \
        CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/pu.edu.pk/peers/peer0.pu.edu.pk/tls/ca.crt \
        CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/pu.edu.pk/users/Admin@pu.edu.pk/msp \
        peer channel join -b /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.block
    "
    
    docker exec cli bash -c "
        # Join peer1.pu
        CORE_PEER_ADDRESS=peer1.pu.edu.pk:10051 \
        CORE_PEER_LOCALMSPID=PunjabUniversityMSP \
        CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/pu.edu.pk/peers/peer1.pu.edu.pk/tls/ca.crt \
        CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/pu.edu.pk/users/Admin@pu.edu.pk/msp \
        peer channel join -b /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.block
    "
    
    # LUMS Peers
    docker exec cli bash -c "
        # Join peer0.lums
        CORE_PEER_ADDRESS=peer0.lums.edu.pk:11051 \
        CORE_PEER_LOCALMSPID=LUMSMSP \
        CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/lums.edu.pk/peers/peer0.lums.edu.pk/tls/ca.crt \
        CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/lums.edu.pk/users/Admin@lums.edu.pk/msp \
        peer channel join -b /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.block
    "
    
    docker exec cli bash -c "
        # Join peer1.lums
        CORE_PEER_ADDRESS=peer1.lums.edu.pk:12051 \
        CORE_PEER_LOCALMSPID=LUMSMSP \
        CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/lums.edu.pk/peers/peer1.lums.edu.pk/tls/ca.crt \
        CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/lums.edu.pk/users/Admin@lums.edu.pk/msp \
        peer channel join -b /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.block
    "
    
    echo "All peers joined to channel!"
}

# Update anchor peers
update_anchors() {
    print_step "Updating anchor peers..."
    
    # HEC anchor peer
    docker exec cli bash -c "
        peer channel update -o orderer.hec.edu.pk:7050 \
            -c ${CHANNEL_NAME} \
            -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/HECAnchor.tx \
            --tls \
            --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/hec.edu.pk/orderers/orderer.hec.edu.pk/msp/tlscacerts/tlsca.hec.edu.pk-cert.pem
    "
    
    # PU anchor peer
    docker exec cli bash -c "
        CORE_PEER_ADDRESS=peer0.pu.edu.pk:9051 \
        CORE_PEER_LOCALMSPID=PunjabUniversityMSP \
        CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/pu.edu.pk/peers/peer0.pu.edu.pk/tls/ca.crt \
        CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/pu.edu.pk/users/Admin@pu.edu.pk/msp \
        peer channel update -o orderer.hec.edu.pk:7050 \
            -c ${CHANNEL_NAME} \
            -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/PUAnchor.tx \
            --tls \
            --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/hec.edu.pk/orderers/orderer.hec.edu.pk/msp/tlscacerts/tlsca.hec.edu.pk-cert.pem
    "
    
    # LUMS anchor peer
    docker exec cli bash -c "
        CORE_PEER_ADDRESS=peer0.lums.edu.pk:11051 \
        CORE_PEER_LOCALMSPID=LUMSMSP \
        CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/lums.edu.pk/peers/peer0.lums.edu.pk/tls/ca.crt \
        CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/lums.edu.pk/users/Admin@lums.edu.pk/msp \
        peer channel update -o orderer.hec.edu.pk:7050 \
            -c ${CHANNEL_NAME} \
            -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/LUMSAnchor.tx \
            --tls \
            --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/hec.edu.pk/orderers/orderer.hec.edu.pk/msp/tlscacerts/tlsca.hec.edu.pk-cert.pem
    "
    
    echo "Anchor peers updated!"
}

# Main function
main() {
    print_step "HEC University Degree Verification Network Setup"
    
    cd "$(dirname "$0")"
    
    case "$1" in
        up)
            check_prerequisites
            cleanup
            generate_crypto
            generate_artifacts
            start_network
            sleep 5
            create_channel
            join_channel
            update_anchors
            print_step "Network is ready! Run './deploy-chaincode.sh' to deploy chaincode."
            ;;
        down)
            cleanup
            ;;
        restart)
            cleanup
            generate_crypto
            generate_artifacts
            start_network
            sleep 5
            create_channel
            join_channel
            update_anchors
            ;;
        *)
            echo "Usage: $0 {up|down|restart}"
            echo ""
            echo "Commands:"
            echo "  up      - Start the network with all organizations"
            echo "  down    - Stop and clean up the network"
            echo "  restart - Restart the network from scratch"
            exit 1
            ;;
    esac
}

main "$@"
