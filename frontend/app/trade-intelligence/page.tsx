'use client';

import DashboardLayout from '@/components/dashboard-layout';
import TradeIntelligencePanel from '@/components/TradeIntelligencePanel';

export default function TradeIntelligencePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trade Intelligence</h1>
          <p className="text-muted-foreground">
            Real-time trade data and market intelligence powered by UN Comtrade
          </p>
        </div>
        
        <TradeIntelligencePanel />
      </div>
    </DashboardLayout>
  );
}
