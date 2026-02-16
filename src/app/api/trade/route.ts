import { NextRequest, NextResponse } from 'next/server';
import { fetchCurveState, buildBuyTransaction, buildSellTransaction, createProvider, instantiateBondingCurve } from '@/lib/contract/sdk';
import { addressToHash160 } from '@/lib/contract/sdk';

export async function POST(request: NextRequest) {
  try {
    const { action, tokenId, tokensToBuy, tokensToSell, buyerAddress, sellerAddress } = await request.json();

    if (!tokenId) {
      return NextResponse.json({ error: 'Missing tokenId' }, { status: 400 });
    }

    // Use mainnet for production
    const network = 'mainnet';
    const provider = createProvider(network);

    // Fee address - platform receives fees here
    const feeAddress = process.env.FEE_ADDRESS || 'bchtest:qp3z6gt5q0rq0wq0q0q0q0q0q0q0q0q0q0q0q0';

    // Instantiate the bonding curve contract
    const instance = await instantiateBondingCurve(tokenId, feeAddress, provider);

    if (action === 'getCurveState') {
      const state = await fetchCurveState(instance);
      return NextResponse.json({ state });
    }

    if (action === 'buy') {
      if (!buyerAddress || !tokensToBuy) {
        return NextResponse.json({ error: 'Missing buyerAddress or tokensToBuy' }, { status: 400 });
      }

      // Get user's UTXOs from the provider
      const userUtxos = await provider.getUtxos(buyerAddress);
      const userBchUtxos = userUtxos.filter(u => !u.token);

      if (userBchUtxos.length === 0) {
        return NextResponse.json({ error: 'No BCH UTXOs found' }, { status: 400 });
      }

      // For now, return the quote without building full transaction
      // Full transaction building requires wallet signing which happens client-side
      const curveState = await fetchCurveState(instance);
      if (!curveState) {
        return NextResponse.json({ error: 'Curve not found' }, { status: 404 });
      }

      return NextResponse.json({
        quote: {
          tokensToBuy: BigInt(tokensToBuy),
          currentSupply: curveState.currentSupply,
          estimatedCost: 'Calculated client-side',
        },
        message: 'Transaction building requires client-side wallet signing'
      });
    }

    if (action === 'sell') {
      if (!sellerAddress || !tokensToSell) {
        return NextResponse.json({ error: 'Missing sellerAddress or tokensToSell' }, { status: 400 });
      }

      const curveState = await fetchCurveState(instance);
      if (!curveState) {
        return NextResponse.json({ error: 'Curve not found' }, { status: 404 });
      }

      return NextResponse.json({
        quote: {
          tokensToSell: BigInt(tokensToSell),
          currentSupply: curveState.currentSupply,
          estimatedReturn: 'Calculated client-side',
        },
        message: 'Transaction building requires client-side wallet signing'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Trade API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}