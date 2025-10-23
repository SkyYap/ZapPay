import { Router, Request, Response } from 'express';
import { analyzeWallet } from '../services/scoringEngine';
import { validateWalletAddress } from '../middleware/validation';

const router = Router();

/**
 * GET /api/risk/wallet/:address
 * Get risk analysis for a specific wallet address
 */
router.get('/wallet/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!validateWalletAddress(address)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid wallet address format'
      });
    }

    console.log(`🔍 Fetching analysis for wallet: ${address}`);

    const analysis = await analyzeWallet(address);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Analysis Failed',
      message: error.message || 'Failed to analyze wallet'
    });
  }
});

export default router;
