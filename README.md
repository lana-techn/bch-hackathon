# IgniteBCH 🚀

<p align="center">
  <strong>Fair Launch Token Platform on Bitcoin Cash</strong>
</p>

<p align="center">
  Create tokens in 30 seconds. Trade with guaranteed liquidity. No rug pulls.
</p>

<p align="center">
  <a href="#-key-features">Features</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-documentation">Documentation</a>
</p>

---

## 🎯 What is IgniteBCH?

IgniteBCH is a fair launch platform for tokens on Bitcoin Cash. Anyone can create a token in 30 seconds with one click, and traders can buy/sell with guaranteed liquidity through bonding curves.

**Think of it as pump.fun for Bitcoin Cash — but with 100x lower fees and built-in social features.**

### Problems Solved

| Problem | IgniteBCH Solution |
|---------|-------------------|
| 🚫 Expensive launch ($500-5000 on Ethereum) | ✅ $1.50 per launch |
| 🚫 Developers pre-mine & dump | ✅ Fair launch, no pre-mine |
| 🚫 90% of tokens are rug pulls | ✅ Liquidity locked in smart contract |
| 🚫 No engagement tools | ✅ SocialFi built-in |

---

## ✨ Key Features

### 1. 🪙 Token Launch System
- **One-Click Creation**: Create a CashToken in 30 seconds
- **AI-Powered**: Generate logo, name, and description with AI
- **Low Cost**: Only 0.005 BCH (~$1.50) per launch

### 2. 📈 Bonding Curve Trading
- **Guaranteed Liquidity**: Always able to buy/sell
- **No Slippage**: Predictable pricing
- **Transparent**: Clear mathematical formula

### 3. 🎓 Graduation System
- **Auto-Graduation**: Successful tokens auto-list on DEX
- **Locked Liquidity**: 200M tokens for DEX pool
- **Market Cap Target**: 40 BCH (~$12,000)

### 4. 💬 SocialFi Features
- **Real-Time Comments**: P2P via Gun.js
- **Token Likes**: Community sentiment
- **User Profiles**: Reputation system

---

## 🔧 How It Works

### Token Economics

```
Total Supply: 1,000,000,000 tokens
├── Bonding Curve: 800,000,000 (80%) - Available for trading
└── DEX Reserve: 200,000,000 (20%) - Unlocks at graduation
```

### Bonding Curve Formula

```
Price = Slope × Supply

Where:
- Slope = 1 satoshi per token
- Price increases linearly with demand
```

**Example:**
- Token #1: 1 satoshi
- Token #100: 100 satoshis
- Token #1,000,000: 1,000,000 satoshis (0.01 BCH)

### Graduation Flow

```
Market Cap reaches 40 BCH
         │
         ▼
┌─────────────────────────────┐
│ 1. 200M tokens unlock       │
│ 2. Pair with BCH in pool    │
│ 3. List on DEX              │
│ 4. Trading begins           │
└─────────────────────────────┘
```

---

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Quick Start

```bash
# Clone repository
git clone https://github.com/lana-techn/bch-hackathon.git
cd bch-hackathon

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables

```env
# Network
NEXT_PUBLIC_NETWORK=chipnet

# Wallet Keys (for server-side signing)
DEPLOYER_WIF=your_wif_key_here
DEMO_SIGNING_WIF=your_wif_key_here
FEE_ADDRESS=your_fee_address_here

# AI Services (optional)
OPENAI_API_KEY=your_openai_key
OPENROUTER_API_KEY=your_openrouter_key

# IPFS (optional)
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret
```

---

## 🚀 Usage

### 1. Creating a Token

1. Open `/create`
2. Connect wallet (Paytaca/Cashonize)
3. Fill the form:
   - Name: Token name
   - Ticker: Symbol (max 8 chars)
   - Description: Token description
4. (Optional) Use AI to generate logo & description
5. Click "Launch Token"
6. Wait ~30 seconds for 3 transactions

### 2. Trading

**Buy:**
1. Select token from homepage
2. Enter BCH amount
3. Review quote (tokens received, fee, price impact)
4. Sign & broadcast transaction

**Sell:**
1. Enter token amount
2. Review quote (BCH received, fee)
3. Sign & broadcast transaction

### 3. Social Features

- Post comments on token page
- Like tokens to show support
- View other user profiles

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [FEATURES.md](docs/features/FEATURES.md) | Detailed feature list |
| [SYSTEM-ARCHITECTURE.md](docs/architecture/SYSTEM-ARCHITECTURE.md) | System architecture |
| [DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md) | Demo script |
| [RESULTS-REPORT.md](docs/RESULTS-REPORT.md) | Hackathon results report |
| [ROADMAP.md](docs/ROADMAP.md) | Development roadmap |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Pages   │ │Components│ │  Hooks   │ │  Utils   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend (API Routes)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Deploy  │ │  Trade   │ │  Auth    │ │  Upload  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
│  BCH Network    │ │   Gun.js    │ │   AI Services   │
│  (CashTokens)   │ │   (P2P)     │ │  (OpenAI/etc)   │
└─────────────────┘ └─────────────┘ └─────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes |
| Blockchain | Bitcoin Cash, CashTokens, CashScript |
| Smart Contract | BondingCurve.cash |
| P2P Database | Gun.js |
| AI | OpenAI DALL-E 3, OpenRouter |
| Storage | IPFS (Pinata) |
| Wallet | Paytaca, Cashonize, WalletConnect |

---

## ✅ Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Token Creation | ✅ Complete | One-click launch |
| AI Image Gen | ✅ Complete | DALL-E 3 + FLUX.2 |
| Bonding Curve | ✅ Complete | Buy/sell working |
| Transaction Broadcast | ✅ Complete | Verified on-chain |
| Social Comments | ✅ Complete | P2P via Gun.js |
| Token Likes | ✅ Complete | Per-wallet |
| Graduation System | 🔄 Partial | Contract ready, DEX pending |
| User Profiles | 🔄 Partial | Basic implementation |
| Mobile PWA | 📋 Planned | Q2 2026 |

---

## 🧪 Testing

### Verified Transactions (Chipnet)

| Action | TXID | Link |
|--------|------|------|
| Genesis | `9e76895c...` | [View](https://chipnet.bch.ninja/tx/9e76895c9393bb667a3132c3d835467657752904b1c901a235a366bc1e0357b0) |
| Lock | `177f13a6...` | [View](https://chipnet.bch.ninja/tx/177f13a6817a7757faaede3cedad00d58f59ce0d511063e79f573cf682540b42) |
| Buy 10M tokens | `473587e7...` | [View](https://chipnet.bch.ninja/tx/473587e71d40bb6daa14c3b592fc88bcb70cda55a8992ecb73c6d89dde0d28ee) |

### Test Token

```
Token ID: 4703183609b7b037881c800e80f46857215af3945e41e7727499d1f74b370056
Name: IgniteBCH Token
Ticker: OCK
Network: Chipnet (testnet)
```

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- Bitcoin Cash Community
- CashScript Team
- Paytaca Wallet
- Gun.js Community
- OpenAI

---

<p align="center">
  <strong>Ready to ignite? 🚀</strong>
</p>
