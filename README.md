# HEC University Degree Verification System

A complete blockchain-based degree verification system for the Higher Education Commission (HEC) of Pakistan. Built using **Hyperledger Fabric**, **Node.js**, and **React.js**.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Demo Credentials](#demo-credentials)

## 🎯 Overview

This system allows:
- **HEC** to manage universities and employees across Pakistan
- **Universities** to issue and manage student degrees
- **HEC** to verify and attest degrees from all universities
- **Public** to verify degree authenticity using blockchain

## ✨ Features

### HEC Admin Portal
- ✅ Add/manage universities to the network
- ✅ Add/manage HEC employees with admin access
- ✅ View and attest degrees from all universities
- ✅ Dashboard with system-wide statistics

### University Portal
- ✅ Role-based access (VC, Registrar, Controller, Dean, HOD)
- ✅ Issue student degrees
- ✅ Request HEC attestation
- ✅ Manage university staff
- ✅ View degree statistics

### Public Verification
- ✅ Verify degree authenticity
- ✅ Search by Degree ID, Student ID, or QR Code
- ✅ View HEC attestation status

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Hyperledger Fabric Network                   │
│                                                                  │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐   │
│  │   HEC Org     │  │ Punjab Univ   │  │      LUMS         │   │
│  │ peer0 peer1   │  │ peer0 peer1   │  │   peer0 peer1     │   │
│  └───────────────┘  └───────────────┘  └───────────────────┘   │
│           │                 │                   │                │
│           └─────────────────┴───────────────────┘                │
│                          │                                       │
│              ┌───────────┴───────────┐                          │
│              │     Orderer Node      │                          │
│              └───────────────────────┘                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │    Node.js Backend      │
              │   (Express + Gateway)   │
              └────────────┬────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │         React.js Frontend          │
         │   (HEC Portal | University Portal) │
         └────────────────────────────────────┘
```

## 📁 Project Structure

```
hec-university-system/
├── chaincode/                    # Hyperledger Fabric Smart Contracts
│   └── javascript/
│       ├── lib/
│       │   ├── hecContract.js      # HEC employee management
│       │   ├── universityContract.js# University management
│       │   ├── userContract.js     # University staff management
│       │   └── degreeContract.js   # Degree issuance & verification
│       ├── index.js
│       └── package.json
│
├── backend/                      # Node.js Express Backend
│   └── src/
│       ├── routes/
│       │   ├── auth.routes.js      # Authentication
│       │   ├── hec.routes.js       # HEC operations
│       │   ├── university.routes.js # University operations
│       │   ├── user.routes.js      # User management
│       │   └── degree.routes.js    # Degree operations
│       ├── middleware/
│       │   └── auth.middleware.js  # JWT & role-based auth
│       ├── utils/
│       │   ├── fabric.js           # Fabric Gateway connection
│       │   └── logger.js           # Winston logger
│       └── server.js
│
├── frontend/                     # React.js Frontend
│   └── src/
│       ├── components/
│       │   ├── Layout.js           # Sidebar layout
│       │   ├── Modal.js            # Reusable modal
│       │   └── ProtectedRoute.js   # Route protection
│       ├── pages/
│       │   ├── LandingPage.js      # Public landing page
│       │   ├── PublicVerification.js# Public degree verification
│       │   ├── auth/               # Login pages
│       │   ├── hec/                # HEC admin pages
│       │   └── university/         # University portal pages
│       ├── context/
│       │   └── AuthContext.js      # Auth state management
│       └── services/
│           └── api.js              # API service layer
│
└── network/                      # Hyperledger Fabric Network
    ├── configtx.yaml             # Channel configuration
    ├── crypto-config.yaml        # Crypto material config
    ├── docker-compose.yaml       # Docker services
    └── scripts/
        ├── network.sh            # Network setup script
        └── deploy-chaincode.sh   # Chaincode deployment
```

## 🔧 Prerequisites

- **Docker** (20.10+) and **Docker Compose** (2.0+)
- **Node.js** (16.x or 18.x LTS)
- **npm** (8.x+)
- **Git**

### Install Prerequisites (Ubuntu/Debian)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installations
docker --version
docker compose version
node --version
npm --version
```

## 🚀 Quick Start

### Option 1: Demo Mode (Without Fabric Network)

This runs the application with mock data for testing the UI:

```bash
# Clone/navigate to project
cd hec-university-system

# Start Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Start Frontend (new terminal)
cd frontend
npm install
npm start
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Option 2: Full Setup (With Fabric Network)

```bash
# 1. Start the Fabric Network
cd network
chmod +x scripts/*.sh
./scripts/network.sh up

# 2. Deploy Chaincode
./scripts/deploy-chaincode.sh deploy

# 3. Start Backend
cd ../backend
cp .env.example .env
npm install
npm start

# 4. Start Frontend (new terminal)
cd ../frontend
npm install
npm start
```

## 📖 Detailed Setup

### 1. Start Hyperledger Fabric Network

```bash
cd hec-university-system/network

# Start network with all organizations
./scripts/network.sh up

# This will:
# - Generate crypto materials
# - Create channel artifacts
# - Start all Docker containers
# - Create and join channels
# - Update anchor peers
```

### 2. Deploy Smart Contracts

```bash
./scripts/deploy-chaincode.sh deploy

# This will:
# - Package chaincode
# - Install on all peers
# - Approve for all organizations
# - Commit to channel
# - Initialize ledger with sample data
```

### 3. Configure Backend

```bash
cd ../backend

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Environment variables:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-key
FABRIC_CHANNEL=degreechannel
FABRIC_CHAINCODE=degree
```

### 4. Start Backend Server

```bash
npm install
npm start  # Production
npm run dev  # Development with nodemon
```

### 5. Start Frontend

```bash
cd ../frontend
npm install
npm start
```

## 👤 Demo Credentials

### HEC Admin Portal
- **Email:** admin@hec.edu.pk
- **Password:** admin123
- **Access:** Full system administration

### University Portal (Punjab University)
- **Email:** vc@pu.edu.pk
- **Password:** password123
- **Role:** Vice Chancellor

- **Email:** registrar@pu.edu.pk
- **Password:** password123
- **Role:** Registrar

### University Portal (LUMS)
- **Email:** vc@lums.edu.pk
- **Password:** password123
- **Role:** Vice Chancellor

## 📡 API Documentation

### Authentication

```bash
# HEC Login
POST /api/auth/hec/login
Body: { "email": "admin@hec.edu.pk", "password": "admin123" }

# University Login
POST /api/auth/university/login
Body: { "email": "registrar@pu.edu.pk", "password": "password123" }
```

### HEC Operations

```bash
# Get all universities
GET /api/universities

# Register new university
POST /api/universities
Body: { "name": "...", "address": "...", ... }

# Attest degree
PUT /api/degrees/:degreeId/attest
```

### University Operations

```bash
# Issue degree
POST /api/degrees
Body: { "studentName": "...", "program": "...", ... }

# Get university degrees
GET /api/degrees/university/:universityId
```

### Public Verification

```bash
# Verify degree by ID
GET /api/degrees/verify/:degreeId
```

## 🏭 Network Architecture

### Organizations

| Organization | MSP ID | Peers |
|-------------|--------|-------|
| HEC | HECMSP | peer0.hec.edu.pk, peer1.hec.edu.pk |
| Punjab University | PunjabUniversityMSP | peer0.pu.edu.pk, peer1.pu.edu.pk |
| LUMS | LUMSMSP | peer0.lums.edu.pk, peer1.lums.edu.pk |

### Ports

| Service | Port |
|---------|------|
| Orderer | 7050 |
| HEC Peer0 | 7051 |
| HEC Peer1 | 8051 |
| PU Peer0 | 9051 |
| PU Peer1 | 10051 |
| LUMS Peer0 | 11051 |
| LUMS Peer1 | 12051 |
| Backend API | 5000 |
| Frontend | 3000 |

## 🛠️ Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Network Commands

```bash
# Stop network
./scripts/network.sh down

# Restart network
./scripts/network.sh restart

# Test chaincode
./scripts/deploy-chaincode.sh test
```

### Logs

```bash
# View peer logs
docker logs peer0.hec.edu.pk -f

# View orderer logs
docker logs orderer.hec.edu.pk -f

# View all containers
docker ps
```

## 🔐 Security

- All API endpoints (except public verification) are protected with JWT
- Role-based access control for different operations
- TLS enabled on all Fabric network communications
- Passwords are hashed using bcrypt

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For support, email support@hec.edu.pk or create an issue in the repository.
