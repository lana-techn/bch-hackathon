/**
 * Token Deployment API Route
 * 
 * POST /api/deploy
 * Handles real token deployment server-side
 * Requires: user payment of launch fee
 */

import { NextRequest, NextResponse } from 'next/server';
import { deployTokenCashTokens, checkDeploymentRequirements } from '@/lib/blockchain/cashtokens-deployment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      ticker, 
      description, 
      creatorAddress,
      creatorPublicKey,
      paymentTxHex, // User pays the launch fee
    } = body;

    // Validate inputs
    if (!name || !ticker || !creatorAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: name, ticker, creatorAddress' },
        { status: 400 }
      );
    }

    // Check if we have deployer credentials
    const deployerWif = process.env.DEPLOYER_WIF;
    const feeAddress = process.env.FEE_ADDRESS;
    const network = (process.env.NEXT_PUBLIC_NETWORK || 'chipnet') as 'chipnet' | 'mainnet';

    if (!deployerWif || !feeAddress) {
      return NextResponse.json(
        { error: 'Deployment not configured. Contact admin.' },
        { status: 500 }
      );
    }

    // Check creator balance
    const balanceCheck = await checkDeploymentRequirements(creatorAddress, network);
    if (!balanceCheck.canDeploy) {
      return NextResponse.json(
        { error: balanceCheck.message },
        { status: 400 }
      );
    }

    // Deploy token
    const result = await deployTokenCashTokens(
      {
        network,
        deployerWif,
        feeAddress,
      },
      name,
      ticker,
      description,
      creatorAddress
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        tokenId: result.tokenId,
        bondingCurveAddress: result.bondingCurveAddress,
        tokenAddress: result.tokenAddress,
        genesisTxid: result.genesisTxid,
        lockTxid: result.lockTxid,
        explorerUrl: network === 'chipnet' 
          ? `https://chipnet.imaginary.cash/tx/${result.genesisTxid}`
          : `https://blockchair.com/bitcoin-cash/transaction/${result.genesisTxid}`,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Deployment failed' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('API deployment error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Check deployment status or requirements
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const network = (process.env.NEXT_PUBLIC_NETWORK || 'chipnet') as 'chipnet' | 'mainnet';

  if (!address) {
    return NextResponse.json(
      { error: 'Address required' },
      { status: 400 }
    );
  }

  const check = await checkDeploymentRequirements(address, network);
  
  return NextResponse.json({
    canDeploy: check.canDeploy,
    balance: Number(check.balance),
    required: Number(check.required),
    message: check.message,
  });
}
