'use strict';

const grpc = require('@grpc/grpc-js');
const { connect, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class FabricConnection {
    constructor() {
        this.gateway = null;
        this.client = null;
        this.network = null;
        this.contracts = {};
    }

    async connect(orgConfig) {
        try {
            // Load credentials
            const credentials = await this._loadCredentials(orgConfig);
            
            // Create gRPC client
            this.client = await this._newGrpcConnection(
                orgConfig.peerEndpoint,
                credentials.tlsCert,
                orgConfig.peerHostAlias
            );

            // Create gateway connection
            this.gateway = connect({
                client: this.client,
                identity: {
                    mspId: orgConfig.mspId,
                    credentials: credentials.certificate
                },
                signer: signers.newPrivateKeySigner(credentials.privateKey),
                evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
                endorseOptions: () => ({ deadline: Date.now() + 15000 }),
                submitOptions: () => ({ deadline: Date.now() + 5000 }),
                commitStatusOptions: () => ({ deadline: Date.now() + 60000 })
            });

            // Get network and contract
            this.network = this.gateway.getNetwork(process.env.CHANNEL_NAME || 'hecchannel');
            
            // Get all contracts
            this.contracts.hec = this.network.getContract(process.env.CHAINCODE_NAME || 'heccc', 'HECContract');
            this.contracts.university = this.network.getContract(process.env.CHAINCODE_NAME || 'heccc', 'UniversityContract');
            this.contracts.user = this.network.getContract(process.env.CHAINCODE_NAME || 'heccc', 'UserContract');
            this.contracts.degree = this.network.getContract(process.env.CHAINCODE_NAME || 'heccc', 'DegreeContract');

            logger.info(`Connected to Fabric network as ${orgConfig.mspId}`);
            return this;
        } catch (error) {
            logger.error('Failed to connect to Fabric network:', error);
            throw error;
        }
    }

    async _loadCredentials(orgConfig) {
        const cryptoPath = path.resolve(orgConfig.cryptoPath);
        
        // Load TLS certificate
        const tlsCertPath = path.resolve(orgConfig.tlsCertPath);
        const tlsCert = fs.readFileSync(tlsCertPath);

        // Load user certificate
        const certPath = path.resolve(orgConfig.certPath);
        const certificate = fs.readFileSync(certPath);

        // Load private key
        const keyDirectory = path.resolve(orgConfig.keyDirectoryPath);
        const keyFiles = fs.readdirSync(keyDirectory);
        const keyPath = path.join(keyDirectory, keyFiles[0]);
        const privateKeyPem = fs.readFileSync(keyPath);
        const privateKey = crypto.createPrivateKey(privateKeyPem);

        return { tlsCert, certificate, privateKey };
    }

    async _newGrpcConnection(peerEndpoint, tlsCert, peerHostAlias) {
        const tlsCredentials = grpc.credentials.createSsl(tlsCert);
        return new grpc.Client(peerEndpoint, tlsCredentials, {
            'grpc.ssl_target_name_override': peerHostAlias
        });
    }

    getContract(contractName) {
        if (!this.contracts[contractName]) {
            throw new Error(`Contract ${contractName} not found`);
        }
        return this.contracts[contractName];
    }

    async disconnect() {
        if (this.gateway) {
            this.gateway.close();
        }
        if (this.client) {
            this.client.close();
        }
        logger.info('Disconnected from Fabric network');
    }

    // Transaction methods
    async submitTransaction(contractName, functionName, ...args) {
        try {
            const contract = this.getContract(contractName);
            const result = await contract.submitTransaction(functionName, ...args);
            return result.length > 0 ? JSON.parse(result.toString()) : null;
        } catch (error) {
            logger.error(`Transaction ${functionName} failed:`, error);
            throw error;
        }
    }

    async evaluateTransaction(contractName, functionName, ...args) {
        try {
            const contract = this.getContract(contractName);
            const result = await contract.evaluateTransaction(functionName, ...args);
            return result.length > 0 ? JSON.parse(result.toString()) : null;
        } catch (error) {
            logger.error(`Query ${functionName} failed:`, error);
            throw error;
        }
    }
}

// Singleton instance
let fabricConnection = null;

const getFabricConnection = async (orgConfig) => {
    if (!fabricConnection) {
        fabricConnection = new FabricConnection();
        await fabricConnection.connect(orgConfig);
    }
    return fabricConnection;
};

const getHECConnection = async () => {
    const config = {
        mspId: process.env.HEC_MSP_ID || 'HECMSP',
        peerEndpoint: process.env.HEC_PEER_ENDPOINT || 'localhost:7051',
        peerHostAlias: process.env.HEC_PEER_HOST_ALIAS || 'peer0.hec.gov.pk',
        tlsCertPath: process.env.HEC_TLS_CERT_PATH,
        cryptoPath: process.env.HEC_CRYPTO_PATH,
        keyDirectoryPath: process.env.HEC_KEY_DIRECTORY_PATH,
        certPath: process.env.HEC_CERT_PATH
    };
    return getFabricConnection(config);
};

module.exports = {
    FabricConnection,
    getFabricConnection,
    getHECConnection
};
