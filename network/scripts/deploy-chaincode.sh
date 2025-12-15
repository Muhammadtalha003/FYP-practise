#!/bin/bash

# HEC University Degree Verification Network - Chaincode Deployment Script
# This script packages, installs, and commits the chaincode to the network

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

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}ERROR: $1${NC}"
}

# Configuration
CHANNEL_NAME="degreechannel"
CC_NAME="degree"
CC_VERSION="1.0"
CC_SEQUENCE=1
CC_SRC_PATH="/opt/gopath/src/github.com/chaincode/javascript"

# Package chaincode
package_chaincode() {
    print_step "Packaging chaincode..."
    
    docker exec cli bash -c "
        cd ${CC_SRC_PATH}
        npm install
        
        peer lifecycle chaincode package ${CC_NAME}.tar.gz \
            --path ${CC_SRC_PATH} \
            --lang node \
            --label ${CC_NAME}_${CC_VERSION}
    "
    
    print_success "Chaincode packaged"
}

# Install chaincode on HEC peers
install_on_hec() {
    print_step "Installing chaincode on HEC peers..."
    
    # Install on peer0.hec
    docker exec cli bash -c "
        CORE_PEER_ADDRESS=peer0.hec.edu.pk:7051 \
        CORE_PEER_LOCALMSPID=HECMSP \
        CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hec.edu.pk/peers/peer0.hec.edu.pk/tls/ca.crt \
        CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hec.edu.pk/users/Admin@hec.edu.pk/msp \
        peer lifecycle chaincode install ${CC_NAME}.tar.gz
    "
    print_success "Installed on peer0.hec.edu.pk"
    
    # Install on peer1.hec
    docker exec cli bash -c "
        CORE_PEER_ADDRESS=peer1.hec.edu.pk:8051 \
        CORE_PEER_LOCALMSPID=HECMSP \
        CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hec.edu.pk/peers/peer1.hec.edu.pk/tls/ca.crt \
        CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hec.edu.pk/users/Admin@hec.edu.pk/msp \
        peer lifecycle chaincode install ${CC_NAME}.tar.gz
    "
    print_success "Installed on peer1.hec.edu.pk"
}

# Install chaincode on Punjab University peers
install_on_pu() {
    print_step "Installing chaincode on Punjab University peers..."
    
    # Install on peer0.pu
    docker exec cli bash -c "
        CORE_PEER_ADDRESS=peer0.pu.edu.pk:9051 \
        CORE_PEER_LOCALMSPID=PunjabUniversityMSP \
        CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/pu.edu.pk/peers/peer0.pu.edu.pk/tls/ca.crt \
        CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/pu.edu.pk/users/Admin@pu.edu.pk/msp \
        peer lifecycle chaincode install ${CC_NAME}.tar.gz
    "
    print_success "Installed on peer0.pu.edu.pk"
    
    # Install on peer1.pu
    docker exec cli bash -c "
        CORE_PEER_ADDRESS=peer1.pu.edu.pk:10051 \
        CORE_PEER_LOCALMSPID=PunjabUniversityMSP \
        CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/pu.edu.pk/peers/peer1.pu.edu.pk/tls/ca.crt \
        CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/pu.edu.pk/users/Admin@pu.edu.pk/msp \
        peer lifecycle chaincode install ${CC_NAME}.tar.gz
    "
    print_success "Installed on peer1.pu.edu.pk"
}

# Install chaincode on LUMS peers
install_on_lums() {
    print_step "Installing chaincode on LUMS peers..."
    
    # Install on peer0.lums
    docker exec cli bash -c "
        CORE_PEER_ADDRESS=peer0.lums.edu.pk:11051 \
        CORE_PEER_LOCALMSPID=LUMSMSP \
        CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/lums.edu.pk/peers/peer0.lums.edu.pk/tls/ca.crt \
        CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/lums.edu.pk/users/Admin@lums.edu.pk/msp \
        peer lifecycle chaincode install ${CC_NAME}.tar.gz
    "
    print_success "Installed on peer0.lums.edu.pk"
    
    # Install on peer1.lums
    docker exec cli bash -c "
        CORE_PEER_ADDRESS=peer1.lums.edu.pk:12051 \
        CORE_PEER_LOCALMSPID=LUMSMSP \
        CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/lums.edu.pk/peers/peer1.lums.edu.pk/tls/ca.crt \
        CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/lums.edu.pk/users/Admin@lums.edu.pk/msp \
        peer lifecycle chaincode install ${CC_NAME}.tar.gz
    "
    print_success "Installed on peer1.lums.edu.pk"
}

# Get package ID
get_package_id() {
    print_step "Getting chaincode package ID..."
    
    PACKAGE_ID=$(docker exec cli bash -c "
        peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[0].package_id'
    ")
    
    echo "Package ID: ${PACKAGE_ID}"
    export CC_PACKAGE_ID=${PACKAGE_ID}
}

# Approve chaincode for HEC
approve_for_hec() {
    print_step "Approving chaincode for HEC..."
    
    docker exec cli bash -c "
        CORE_PEER_ADDRESS=peer0.hec.edu.pk:7051 \
        CORE_PEER_LOCALMSPID=HECMSP \
        CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hec.edu.pk/peers/peer0.hec.edu.pk/tls/ca.crt \
        CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hec.edu.pk/users/Admin@hec.edu.pk/msp \
        peer lifecycle chaincode approveformyorg \
            -o orderer.hec.edu.pk:7050 \
            --channelID ${CHANNEL_NAME} \
            --name ${CC_NAME} \
            --version ${CC_VERSION} \
            --package-id \$(peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[0].package_id') \
            --sequence ${CC_SEQUENCE} \
            --tls \
            --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/hec.edu.pk/orderers/orderer.hec.edu.pk/msp/tlscacerts/tlsca.hec.edu.pk-cert.pem
    "
    
    print_success "Approved for HEC"
}

# Approve chaincode for Punjab University
approve_for_pu() {
    print_step "Approving chaincode for Punjab University..."
    
    docker exec cli bash -c "
        CORE_PEER_ADDRESS=peer0.pu.edu.pk:9051 \
        CORE_PEER_LOCALMSPID=PunjabUniversityMSP \
        CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/pu.edu.pk/peers/peer0.pu.edu.pk/tls/ca.crt \
        CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/pu.edu.pk/users/Admin@pu.edu.pk/msp \
        peer lifecycle chaincode approveformyorg \
            -o orderer.hec.edu.pk:7050 \
            --channelID ${CHANNEL_NAME} \
            --name ${CC_NAME} \
            --version ${CC_VERSION} \
            --package-id \$(peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[0].package_id') \
            --sequence ${CC_SEQUENCE} \
            --tls \
            --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/hec.edu.pk/orderers/orderer.hec.edu.pk/msp/tlscacerts/tlsca.hec.edu.pk-cert.pem
    "
    
    print_success "Approved for Punjab University"
}

# Approve chaincode for LUMS
approve_for_lums() {
    print_step "Approving chaincode for LUMS..."
    
    docker exec cli bash -c "
        CORE_PEER_ADDRESS=peer0.lums.edu.pk:11051 \
        CORE_PEER_LOCALMSPID=LUMSMSP \
        CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/lums.edu.pk/peers/peer0.lums.edu.pk/tls/ca.crt \
        CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/lums.edu.pk/users/Admin@lums.edu.pk/msp \
        peer lifecycle chaincode approveformyorg \
            -o orderer.hec.edu.pk:7050 \
            --channelID ${CHANNEL_NAME} \
            --name ${CC_NAME} \
            --version ${CC_VERSION} \
            --package-id \$(peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[0].package_id') \
            --sequence ${CC_SEQUENCE} \
            --tls \
            --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/hec.edu.pk/orderers/orderer.hec.edu.pk/msp/tlscacerts/tlsca.hec.edu.pk-cert.pem
    "
    
    print_success "Approved for LUMS"
}

# Check commit readiness
check_commit_readiness() {
    print_step "Checking commit readiness..."
    
    docker exec cli bash -c "
        peer lifecycle chaincode checkcommitreadiness \
            --channelID ${CHANNEL_NAME} \
            --name ${CC_NAME} \
            --version ${CC_VERSION} \
            --sequence ${CC_SEQUENCE} \
            --output json
    "
}

# Commit chaincode
commit_chaincode() {
    print_step "Committing chaincode to channel..."
    
    docker exec cli bash -c "
        peer lifecycle chaincode commit \
            -o orderer.hec.edu.pk:7050 \
            --channelID ${CHANNEL_NAME} \
            --name ${CC_NAME} \
            --version ${CC_VERSION} \
            --sequence ${CC_SEQUENCE} \
            --tls \
            --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/hec.edu.pk/orderers/orderer.hec.edu.pk/msp/tlscacerts/tlsca.hec.edu.pk-cert.pem \
            --peerAddresses peer0.hec.edu.pk:7051 \
            --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hec.edu.pk/peers/peer0.hec.edu.pk/tls/ca.crt \
            --peerAddresses peer0.pu.edu.pk:9051 \
            --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/pu.edu.pk/peers/peer0.pu.edu.pk/tls/ca.crt \
            --peerAddresses peer0.lums.edu.pk:11051 \
            --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/lums.edu.pk/peers/peer0.lums.edu.pk/tls/ca.crt
    "
    
    print_success "Chaincode committed"
}

# Initialize chaincode
init_chaincode() {
    print_step "Initializing chaincode (InitLedger)..."
    
    docker exec cli bash -c "
        peer chaincode invoke \
            -o orderer.hec.edu.pk:7050 \
            --channelID ${CHANNEL_NAME} \
            --name ${CC_NAME} \
            --tls \
            --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/hec.edu.pk/orderers/orderer.hec.edu.pk/msp/tlscacerts/tlsca.hec.edu.pk-cert.pem \
            --peerAddresses peer0.hec.edu.pk:7051 \
            --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hec.edu.pk/peers/peer0.hec.edu.pk/tls/ca.crt \
            --peerAddresses peer0.pu.edu.pk:9051 \
            --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/pu.edu.pk/peers/peer0.pu.edu.pk/tls/ca.crt \
            -c '{\"function\":\"InitLedger\",\"Args\":[]}'
    "
    
    print_success "Chaincode initialized"
}

# Test chaincode
test_chaincode() {
    print_step "Testing chaincode..."
    
    echo "Querying all universities..."
    docker exec cli bash -c "
        peer chaincode query \
            --channelID ${CHANNEL_NAME} \
            --name ${CC_NAME} \
            -c '{\"function\":\"GetAllUniversities\",\"Args\":[]}'
    "
    
    echo ""
    echo "Querying all HEC employees..."
    docker exec cli bash -c "
        peer chaincode query \
            --channelID ${CHANNEL_NAME} \
            --name ${CC_NAME} \
            -c '{\"function\":\"GetAllHECEmployees\",\"Args\":[]}'
    "
    
    print_success "Chaincode test completed"
}

# Main function
main() {
    cd "$(dirname "$0")"
    
    case "$1" in
        deploy)
            package_chaincode
            install_on_hec
            install_on_pu
            install_on_lums
            approve_for_hec
            approve_for_pu
            approve_for_lums
            check_commit_readiness
            commit_chaincode
            sleep 3
            init_chaincode
            sleep 2
            test_chaincode
            print_step "Chaincode deployment completed successfully!"
            ;;
        test)
            test_chaincode
            ;;
        *)
            echo "Usage: $0 {deploy|test}"
            echo ""
            echo "Commands:"
            echo "  deploy  - Package, install, and commit chaincode"
            echo "  test    - Test chaincode with sample queries"
            exit 1
            ;;
    esac
}

main "$@"
