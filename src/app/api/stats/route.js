import { NextResponse } from 'next/server';
import { products } from '@/data/products';
import { branches } from '@/data/branches';

export async function GET() {
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    metrics: {
      todayRevenueKsh: 342890,
      monthlyRevenueKsh: 8450200,
      todayOrders: 184,
      pendingOrders: 12,
      averageBasketValueKsh: 1863,
      mpesaSuccessRate: '99.4%',
      activeBranches: branches.length,
      topBranches: [
        { name: 'Quickmart Kilimani', orders: 48, revenue: 98400 },
        { name: 'Quickmart Westlands', orders: 42, revenue: 86500 },
        { name: 'Quickmart Roysambu', orders: 36, revenue: 64200 },
        { name: 'Quickmart Nakuru Highway', orders: 31, revenue: 53100 },
      ],
      fastestMovingItems: [
        'Brookside Fresh Milk 500ml',
        'Quickmart Crusty White Bread',
        'Jogoo Maize Meal Unga 2kg',
        'Farm Fresh Eggs (Tray of 30)',
        'Fresh Sukuma Wiki',
      ],
    },
  });
}

