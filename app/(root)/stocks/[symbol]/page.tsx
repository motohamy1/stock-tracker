import TradingViewWidget from "@/components/TradingViewWidget";
import WatchlistButton from "@/components/WatchlistButton";
import WatchlistAlertButton from "@/components/WatchlistAlertButton";
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  BASELINE_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
} from "@/lib/constants";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getAlertsByUserId } from "@/lib/actions/alert.actions";
import { getQuote } from "@/lib/actions/finnhub.actions";
import { AlertItem } from "@/database/models/alert.model";

export default async function StockDetails({ params }: StockDetailsPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAuthenticated = !!session?.user;
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();
  
  let isInWatchlist = false;
  let alertsCount = 0;
  let currentPrice = 0;

  if (isAuthenticated && session?.user?.email) {
    const [watchlistSymbols, userAlerts, quote] = await Promise.all([
      getWatchlistSymbolsByEmail(session.user.email),
      getAlertsByUserId(),
      getQuote(upperSymbol)
    ]);
    
    isInWatchlist = watchlistSymbols.includes(upperSymbol);
    alertsCount = userAlerts.filter((alert: AlertItem) => alert.symbol === upperSymbol && alert.isActive).length;
    currentPrice = quote?.c || 0;
  } else {
     const quote = await getQuote(upperSymbol);
     currentPrice = quote?.c || 0;
  }

  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

  return (
    <div className="flex min-h-screen p-4 md:p-6 lg:p-8">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <TradingViewWidget
            scriptUrl={`${scriptUrl}symbol-info.js`}
            config={SYMBOL_INFO_WIDGET_CONFIG(upperSymbol)}
            height={170}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}advanced-chart.js`}
            config={CANDLE_CHART_WIDGET_CONFIG(upperSymbol)}
            className="custom-chart"
            height={600}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}advanced-chart.js`}
            config={BASELINE_WIDGET_CONFIG(upperSymbol)}
            className="custom-chart"
            height={600}
          />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <WatchlistButton 
              symbol={upperSymbol} 
              company={upperSymbol} 
              isInWatchlist={isInWatchlist} 
              isAuthenticated={isAuthenticated}
            />
            {isAuthenticated && (
                <WatchlistAlertButton 
                  symbol={upperSymbol} 
                  company={upperSymbol} 
                  currentPrice={currentPrice}
                  alertsCount={alertsCount}
                />
            )}
          </div>

          <TradingViewWidget
            scriptUrl={`${scriptUrl}technical-analysis.js`}
            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(upperSymbol)}
            height={400}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}company-profile.js`}
            config={COMPANY_PROFILE_WIDGET_CONFIG(upperSymbol)}
            height={440}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}financials.js`}
            config={COMPANY_FINANCIALS_WIDGET_CONFIG(upperSymbol)}
            height={464}
          />
        </div>
      </section>
    </div>
  );
}