# IgniteBCH 🚀

<p align="center">
  <strong>Fair Launch Token Platform on Bitcoin Cash</strong>
</p>

<p align="center">
  Create tokens in 30 seconds. Trade with guaranteed liquidity. No rug pulls.
</p>

<p align="center">
  <a href="#-fitur-utama">Fitur</a> •
  <a href="#-cara-kerja">Cara Kerja</a> •
  <a href="#-instalasi">Instalasi</a> •
  <a href="#-penggunaan">Penggunaan</a> •
  <a href="#-dokumentasi">Dokumentasi</a>
</p>

---

## 🎯 Apa itu IgniteBCH?

IgniteBCH adalah platform fair launch untuk token di Bitcoin Cash. Siapa pun bisa membuat token dalam 30 detik dengan satu klik, dan trader bisa buy/sell dengan liquidity terjamin melalui bonding curve.

**Bayangkan pump.fun untuk Bitcoin Cash — tapi dengan biaya 100x lebih murah dan fitur sosial built-in.**

### Masalah yang Diselesaikan

| Masalah | Solusi IgniteBCH |
|---------|------------------|
| 🚫 Launch mahal ($500-5000 di Ethereum) | ✅ $1.50 per launch |
| 🚫 Developer pre-mine & dump | ✅ Fair launch, no pre-mine |
| 🚫 90% token adalah rug pull | ✅ Liquidity terkunci di smart contract |
| 🚫 Tidak ada engagement tools | ✅ SocialFi built-in |

---

## ✨ Fitur Utama

### 1. 🪙 Token Launch System
- **One-Click Creation**: Buat CashToken dalam 30 detik
- **AI-Powered**: Generate logo, nama, dan deskripsi dengan AI
- **Low Cost**: Hanya 0.005 BCH (~$1.50) per launch

### 2. 📈 Bonding Curve Trading
- **Guaranteed Liquidity**: Selalu bisa buy/sell
- **No Slippage**: Harga terprediksi
- **Transparent**: Formula matematis yang jelas

### 3. 🎓 Graduation System
- **Auto-Graduation**: Token sukses otomatis list di DEX
- **Locked Liquidity**: 200M token untuk DEX pool
- **Market Cap Target**: 40 BCH (~$12,000)

### 4. 💬 SocialFi Features
- **Real-Time Comments**: P2P via Gun.js
- **Token Likes**: Community sentiment
- **User Profiles**: Reputation system

---

## 🔧 Cara Kerja

### Token Economics

```
Total Supply: 1,000,000,000 tokens
├── Bonding Curve: 800,000,000 (80%) - Available for trading
└── DEX Reserve: 200,000,000 (20%) - Unlocks at graduation
```

### Bonding Curve Formula

```
Price = Slope × Supply

Dimana:
- Slope = 1 satoshi per token
- Price meningkat linear dengan demand
```

**Contoh:**
- Token #1: 1 satoshi
- Token #100: 100 satoshis
- Token #1,000,000: 1,000,000 satoshis (0.01 BCH)

### Graduation Flow

```
Market Cap mencapai 40 BCH
         │
         ▼
┌─────────────────────────────┐
│ 1. 200M tokens unlock       │
│ 2. Pair dengan BCH di pool  │
│ 3. List di DEX              │
│ 4. Trading dimulai          │
└─────────────────────────────┘
```

---

## 📦 Instalasi

### Prerequisites

- Node.js 18+
- npm atau yarn
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
# Edit .env.local dengan keys Anda

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

## 🚀 Penggunaan

### 1. Membuat Token

1. Buka `/create`
2. Connect wallet (Paytaca/Cashonize)
3. Isi form:
   - Name: Nama token
   - Ticker: Symbol (max 8 chars)
   - Description: Deskripsi token
4. (Optional) Gunakan AI untuk generate logo & deskripsi
5. Klik "Launch Token"
6. Tunggu ~30 detik untuk 3 transaksi

### 2. Trading

**Buy:**
1. Pilih token dari homepage
2. Masukkan jumlah BCH
3. Review quote (tokens received, fee, price impact)
4. Sign & broadcast transaksi

**Sell:**
1. Masukkan jumlah token
2. Review quote (BCH received, fee)
3. Sign & broadcast transaksi

### 3. Social Features

- Post comments di halaman token
- Like tokens untuk menunjukkan support
- View profiles pengguna lain

---

## 📚 Dokumentasi

| Dokumen | Deskripsi |
|---------|-----------|
| [FEATURES.md](docs/features/FEATURES.md) | Detail semua fitur |
| [SYSTEM-ARCHITECTURE.md](docs/architecture/SYSTEM-ARCHITECTURE.md) | Arsitektur sistem |
| [DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md) | Script untuk demo |
| [LAPORAN-HASIL.md](docs/LAPORAN-HASIL.md) | Laporan hasil hackathon |
| [ROADMAP.md](docs/ROADMAP.md) | Rencana pengembangan |

---

## 🏗️ Arsitektur

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

## ✅ Status Fitur

| Fitur | Status | Keterangan |
|-------|--------|------------|
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

## 🤝 Kontribusi

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buka Pull Request

---

## 📄 Lisensi

MIT License - lihat [LICENSE](LICENSE) untuk detail.

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
