import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getWatchlist } from "@/lib/actions/watchlist.actions";
import { getAlertsByUserId } from "@/lib/actions/alert.actions";
import { getQuote, getCompanyProfile } from "@/lib/actions/finnhub.actions";
import TradingViewWidget from "@/components/TradingViewWidget";
import { MARKET_DATA_WIDGET_CONFIG, WATCHLIST_TABLE_HEADER } from "@/lib/constants";
import WatchlistButton from "@/components/WatchlistButton";
import Link from "next/link";
import { TrendingUp, TrendingDown, Eye, AlertCircle } from "lucide-react";
import WatchlistAlertButton from "@/components/WatchlistAlertButton";
import { redirect } from "next/navigation";

export default async function WatchlistPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect('/sign-in');
  }

  const rawWatchlist = await getWatchlist();
  const userAlerts = await getAlertsByUserId();
  
  // Enrich with current data
  const enrichedWatchlist = await Promise.all(
    rawWatchlist.map(async (item: any) => {
      const [quote, profile] = await Promise.all([
        getQuote(item.symbol),
        getCompanyProfile(item.symbol)
      ]);
      
      const symbolAlerts = userAlerts.filter((alert: any) => alert.symbol === item.symbol && alert.isActive);

      return {
        ...item,
        currentPrice: quote?.c,
        changePercent: quote?.dp,
        marketCap: profile?.marketCapitalization,
        industry: profile?.finnhubIndustry,
        alertsCount: symbolAlerts.length
      };
    })
  );

  const symbolsForWidget = enrichedWatchlist.map(item => ({
    name: item.symbol,
    displayName: item.company || item.symbol
  }));

  const customWidgetConfig = {
    ...MARKET_DATA_WIDGET_CONFIG,
    title: 'Your Watchlist',
    symbolsGroups: [
      {
        name: 'My Stocks',
        symbols: symbolsForWidget
      }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-6 lg:p-8 gap-8">
      <div className="flex items-center justify-between">
        <h1 className="watchlist-title">My Watchlist</h1>
      </div>

      {enrichedWatchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-800 rounded-xl border border-gray-600">
          <p className="text-gray-400 text-lg mb-4">Your watchlist is empty.</p>
          <Link href="/" className="bg-yellow-500 text-yellow-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-600 transition-colors">
            Explore Stocks
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <div className="watchlist-table">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="table-header-row">
                    <tr>
                      {WATCHLIST_TABLE_HEADER.map((header) => (
                        <th key={header} className={`px-4 py-4 text-sm font-medium ${header === 'Company' ? 'pl-6' : ''} ${(header === 'Price' || header === 'Change' || header === 'Action') ? 'text-right' : ''}`}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {enrichedWatchlist.map((item) => (
                      <tr key={item.symbol} className="table-row">
                        <td className="px-4 py-4 pl-6">
                          <Link href={`/stocks/${item.symbol}`} className="flex flex-col">
                            <span className="font-bold text-gray-100">{item.company}</span>
                            <span className="text-xs text-gray-500">{item.industry || 'Common Stock'}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono text-gray-400">{item.symbol}</span>
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-gray-100">
                          {item.currentPrice ? `$${item.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
                        </td>
                        <td className={`px-4 py-4 text-right font-medium ${item.changePercent !== undefined ? (item.changePercent >= 0 ? 'text-green-500' : 'text-red-500') : 'text-gray-500'}`}>
                          <div className="flex items-center justify-end gap-1">
                            {item.changePercent !== undefined && (
                              <>
                                {item.changePercent >= 0 ? '+' : ''}
                                {item.changePercent.toFixed(2)}%
                              </>
                            )}
                            {item.changePercent === undefined && 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-400 text-sm">
                          {item.marketCap ? `${(item.marketCap / 1000).toFixed(2)}B` : 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-gray-400 text-sm">
                          N/A
                        </td>
                        <td className="px-4 py-4">
                           <WatchlistAlertButton 
                                symbol={item.symbol} 
                                company={item.company} 
                                currentPrice={item.currentPrice}
                                alertsCount={item.alertsCount}
                           />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link 
                                href={`/stocks/${item.symbol}`}
                                className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                            >
                                <Eye size={18} />
                            </Link>
                            <WatchlistButton
                              symbol={item.symbol}
                              company={item.company}
                              isInWatchlist={true}
                              isAuthenticated={true}
                              type="icon"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
            <TradingViewWidget
              scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js"
              config={customWidgetConfig}
              height={600}
            />
          </div>
        </div>
      )}
    </div>
  );
}
