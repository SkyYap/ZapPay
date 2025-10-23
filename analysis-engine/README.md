# Analysis Engine - Wallet Risk Scoring Service

A standalone microservice for analyzing Ethereum wallet addresses and calculating fraud risk scores for the ZapPay payment platform.

## Features

- 🔍 **On-chain Analysis** - Fetches wallet data from Base Sepolia blockchain via Basescan API
- 🛡️ **AML Compliance** - Professional AML screening powered by MetaSleuth BlockSec API
- 📊 **Multi-Factor Risk Scoring** - Comprehensive risk assessment algorithm (0-100 score)
- ⚡ **Fast Response** - In-memory caching with 24-hour TTL
- 🚫 **Auto-Block** - Automatically blocks wallets with critical AML indicators
- 🛡️ **Pattern Detection** - Identifies suspicious behavior patterns
- 🎯 **RESTful API** - Easy integration with any backend service
- 📝 **Detailed Reports** - Comprehensive risk breakdown with actionable recommendations

## Architecture

```
analysis-engine/
├── src/
│   ├── index.ts                    # Express server setup
│   ├── routes/
│   │   └── risk.ts                 # API endpoints for risk analysis
│   ├── services/
│   │   ├── scoringEngine.ts        # Core risk scoring logic
│   │   ├── onChainAnalyzer.ts      # Blockchain data fetching
│   │   └── metasleuthProvider.ts   # MetaSleuth AML API integration
│   ├── middleware/
│   │   └── validation.ts           # Address validation
│   └── types/
│       └── index.ts                # TypeScript type definitions
├── package.json
├── tsconfig.json
└── .env
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Basescan API key (get one at https://basescan.org/apis)
- MetaSleuth API key (optional, for AML screening - contact BlockSec)

### Installation

1. **Install dependencies:**
   ```bash
   cd analysis-engine
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure your API keys:
   ```env
   PORT=3002
   BASESCAN_API_KEY=your_basescan_api_key_here

   # MetaSleuth AML API (optional but recommended)
   METASLEUTH_API_KEY=your_metasleuth_api_key_here
   ENABLE_METASLEUTH=true
   ```

   **Note:** The service works without MetaSleuth, but AML compliance features will be disabled.

3. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production build
   npm run build
   npm start
   ```

The server will start on `http://localhost:3002`

## API Endpoints

### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "service": "analysis-engine",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Analyze Single Wallet
```http
POST /api/risk/analyze
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb0",
    "riskScore": 45,
    "riskLevel": "medium",
    "factors": {
      "walletAge": {
        "ageInDays": 120,
        "firstSeenDate": "2023-09-15T08:20:00.000Z",
        "score": 40,
        "weight": 0.25,
        "description": "Relatively new (< 6 months)"
      },
      "transactionHistory": {
        "totalTransactions": 28,
        "averageTransactionValue": 0.05,
        "lastTransactionDate": "2024-01-10T14:30:00.000Z",
        "transactionFrequency": "Low",
        "score": 30,
        "weight": 0.30,
        "description": "Moderate activity"
      },
      "addressReputation": {
        "isContract": false,
        "hasBlacklistInteractions": false,
        "knownMaliciousActivity": false,
        "score": 0,
        "weight": 0.25,
        "description": "Standard EOA (Externally Owned Account)"
      },
      "behaviorPatterns": {
        "rapidTransactions": false,
        "unusualPatterns": false,
        "suspiciousGasUsage": false,
        "score": 0,
        "weight": 0.20,
        "description": "Normal behavior patterns"
      }
    },
    "recommendations": [
      "⚡ MONITOR - Medium risk. Allow transaction but monitor closely.",
      "Limited transaction history. Monitor for unusual behavior."
    ],
    "timestamp": "2024-01-15T10:30:00.000Z",
    "cacheExpiry": "2024-01-16T10:30:00.000Z"
  }
}
```

### 3. Get Wallet Analysis (GET)
```http
GET /api/risk/wallet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
```

Same response format as POST /analyze

### 4. Batch Analysis
```http
POST /api/risk/batch
Content-Type: application/json

{
  "walletAddresses": [
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    "0x1234567890123456789012345678901234567890"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [...], // Array of analysis results
  "count": 2
}
```

*Note: Maximum 10 addresses per batch request*

## Risk Scoring Algorithm

### Scoring Factors & Weights

1. **Wallet Age (20%)**
   - 0 days: 100 (highest risk)
   - < 7 days: 80
   - < 30 days: 60
   - < 90 days: 40
   - < 180 days: 20
   - > 180 days: 10 (lowest risk)

2. **Transaction History (25%)**
   - 0 transactions: 100
   - < 5 transactions: 70
   - < 20 transactions: 50
   - < 50 transactions: 30
   - > 50 transactions: 15

3. **Address Reputation (15%)**
   - Smart contract: +30
   - Zero balance with history: +20
   - Blacklist interactions: +50
   - Known malicious: 100

4. **Behavior Patterns (10%)**
   - Rapid transactions: +40
   - Suspicious gas usage: +30
   - Unusual amounts: +30

5. **AML Compliance (30%)** - *MetaSleuth Integration*
   - MetaSleuth score 0-1: 10 (minimal risk)
   - MetaSleuth score 2-3: 35 (low risk)
   - MetaSleuth score 4-5: 60 (medium risk)
   - MetaSleuth score 6-7: 85 (high risk)
   - MetaSleuth score 8-10: 100 (critical risk)

### AML Risk Indicators (Auto-Block)

**Critical Indicators** (Auto-block immediately):
- 🚫 Terrorism Financing
- 🚫 Child Abuse Material
- 🚫 Sanctions
- 🚫 Stolen Funds

**High Risk Indicators** (Multiple = Auto-block):
- ⚠️ Mixer/Tumbler services
- ⚠️ Ransomware
- ⚠️ Scam
- ⚠️ Phishing
- ⚠️ Hack/Exploit

**Medium Risk Indicators**:
- ⚡ Gambling
- ⚡ Darknet Market
- ⚡ High Risk Exchange

### Risk Levels

- **Low (0-29)**: ✅ Safe to proceed
- **Medium (30-59)**: ⚡ Monitor closely
- **High (60-79)**: ⚠️ Review required
- **Critical (80-100)**: 🚫 Block transaction

**Note:** Wallets with critical AML indicators are auto-blocked regardless of overall score.

## Integration with Server

### Add to your main backend:

**Install axios:**
```bash
cd ../server
npm install axios
```

**Create service file `server/services/riskService.ts`:**
```typescript
import axios from 'axios';

const ANALYSIS_ENGINE_URL = process.env.ANALYSIS_ENGINE_URL || 'http://localhost:3002';

export async function checkWalletRisk(walletAddress: string) {
  try {
    const response = await axios.post(`${ANALYSIS_ENGINE_URL}/api/risk/analyze`, {
      walletAddress
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Risk check failed:', error.message);
    // Fail open - allow if service unavailable
    return { riskScore: 0, riskLevel: 'low', error: 'Service unavailable' };
  }
}
```

**Use in payment endpoint:**
```typescript
app.post('/api/payment', async (req, res) => {
  const { walletAddress, amount } = req.body;

  // Check risk before processing
  const riskAnalysis = await checkWalletRisk(walletAddress);

  if (riskAnalysis.riskScore >= 80) {
    return res.status(403).json({
      error: 'Payment blocked',
      reason: 'High risk wallet detected',
      riskScore: riskAnalysis.riskScore
    });
  }

  // Proceed with payment...
});
```

**Update server `.env`:**
```env
ANALYSIS_ENGINE_URL=http://localhost:3002
```

## Caching

- Risk scores are cached in-memory for 24 hours
- Cache automatically cleans expired entries every hour
- Significantly reduces API calls to Basescan
- Improves response time for repeated wallet checks

## Development

### Running locally with the main server:

**Option 1: Separate terminals**
```bash
# Terminal 1 - Analysis Engine
cd analysis-engine
npm run dev

# Terminal 2 - Main Server
cd ../server
npm run dev

# Terminal 3 - Frontend
cd ../merchant-frontend
npm run dev
```

**Option 2: Use concurrently (from root)**
```bash
npm run dev  # Runs all services
```

## MetaSleuth AML Configuration

### Getting API Access

1. Visit [MetaSleuth Documentation](https://docs.metasleuth.io/blocksec-aml-api/)
2. Contact BlockSec to request API access
3. Add your API key to `.env`:
   ```env
   METASLEUTH_API_KEY=your_api_key_here
   ENABLE_METASLEUTH=true
   ```

### Supported Chains

MetaSleuth supports multiple chains. The analysis engine is configured for:
- **Base Sepolia** (chain_id: 84532)
- **Base Mainnet** (chain_id: 8453)

To add more chains, edit `src/services/metasleuthProvider.ts` and update the `CHAIN_ID_MAP`.

### Graceful Degradation

If MetaSleuth is unavailable or disabled:
- The service continues to work with basic risk scoring
- AML compliance factor is excluded from calculations
- Weights automatically adjust for remaining factors
- No errors are thrown to the client

### Feature Toggle

Disable AML screening temporarily:
```env
ENABLE_METASLEUTH=false
```

This is useful for:
- Testing without AML costs
- Development environments
- Debugging on-chain analysis only

## Future Enhancements

- [ ] PostgreSQL database for persistent risk profiles
- [ ] Redis for distributed caching
- [x] Integration with MetaSleuth AML API (✅ Completed)
- [ ] Integration with Chainalysis/TRM Labs APIs
- [ ] Machine learning model for pattern detection
- [ ] Whitelist/blacklist management
- [ ] Historical risk tracking and analytics
- [ ] Webhook notifications for high-risk wallets
- [ ] Support for multiple chains (Ethereum, Polygon, etc.)

## API Rate Limits

**Basescan** (free tier): 5 requests/second, 100,000 requests/day
**MetaSleuth**: Contact BlockSec for rate limit details

The engine uses 24-hour caching to minimize API calls and costs.

## Troubleshooting

**"Analysis engine unavailable" error:**
- Ensure the service is running on port 3002
- Check CORS settings in `.env`
- Verify network connectivity between services

**"Invalid API key" from Basescan:**
- Get a free API key from https://basescan.org/apis
- Add it to `.env` as `BASESCAN_API_KEY`

**MetaSleuth AML checks not working:**
- Verify `METASLEUTH_API_KEY` is set in `.env`
- Ensure `ENABLE_METASLEUTH=true`
- Check console logs for MetaSleuth API errors
- Service will gracefully continue without AML if API fails

**High risk scores for legitimate wallets:**
- Adjust scoring weights in `src/services/scoringEngine.ts`
- Consider implementing a whitelist for trusted addresses
- Review AML indicators - some legitimate activities may be flagged

**Auto-blocking too aggressive:**
- Review critical indicator codes in `src/services/metasleuthProvider.ts`
- Adjust auto-block thresholds in the `shouldAutoBlock()` function
- Consider adding manual review queue instead of instant blocking

## License

ISC
