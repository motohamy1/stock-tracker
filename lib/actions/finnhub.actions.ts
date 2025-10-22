'use server';


const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

interface FetchOptions {
  cache?: 'force-cache' | 'no-store';
  next?: {
    revalidate?: number;
  };
}

const fetchJSON = async (url: string, revalidateSeconds?: number): Promise<unknown> => {
  const options: FetchOptions = revalidateSeconds
    ? {
      cache: 'force-cache',
      next: { revalidate: revalidateSeconds }
    }
    : { cache: 'no-store' };

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

interface NewsArticle {
  id?: string;
  category: string;
  datetime: number;
  headline: string;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

interface FormattedArticle {
  id: string;
  headline: string;
  summary: string;
  url: string;
  source: string;
  datetime: number;
  image: string;
  symbol?: string;
}

const validateArticle = (article: unknown): article is NewsArticle => {
  return (
    article !== null &&
    typeof article === 'object' &&
    'headline' in article &&
    'summary' in article &&
    'url' in article &&
    'source' in article &&
    'datetime' in article &&
    typeof (article as NewsArticle).headline === 'string' &&
    typeof (article as NewsArticle).summary === 'string' &&
    typeof (article as NewsArticle).url === 'string' &&
    typeof (article as NewsArticle).source === 'string' &&
    typeof (article as NewsArticle).datetime === 'number' &&
    (article as NewsArticle).headline.trim() !== '' &&
    (article as NewsArticle).summary.trim() !== '' &&
    (article as NewsArticle).url.trim() !== ''
  );
};

const formatArticle = (article: NewsArticle, symbol?: string): FormattedArticle => ({
  id: article.id || `${article.url}-${article.datetime}`,
  headline: article.headline,
  summary: article.summary,
  url: article.url,
  source: article.source,
  datetime: article.datetime,
  image: article.image || '',
  ...(symbol && { symbol })
});

export const getNews = async (symbols?: string[]): Promise<FormattedArticle[]> => {
  try {
    if (!NEXT_PUBLIC_FINNHUB_API_KEY) {
      throw new Error('FINNHUB_API_KEY is not configured');
    }

    // Compute date range for last 5 days
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - 5);

    const to = toDate.toISOString().split('T')[0];
    const from = fromDate.toISOString().split('T')[0];

    if (symbols && symbols.length > 0) {
      // Clean and uppercase symbols
      const cleanSymbols = symbols
        .map(s => s.trim().toUpperCase())
        .filter(s => s.length > 0);

      if (cleanSymbols.length === 0) {
        return getGeneralNews(from, to);
      }

      const articles: FormattedArticle[] = [];
      const maxRounds = 6;

      // Round-robin through symbols, max 6 times
      for (let round = 0; round < maxRounds && articles.length < 6; round++) {
        for (const symbol of cleanSymbols) {
          if (articles.length >= 6) break;

          try {
            const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
            const news = await fetchJSON(url);

            if (Array.isArray(news) && news.length > 0) {
              // Take one valid article from this symbol for this round
              const validArticle = news.find(validateArticle);
              if (validArticle) {
                articles.push(formatArticle(validArticle, symbol));
              }
            }
          } catch (error) {
            console.error(`Failed to fetch news for symbol ${symbol}:`, error);
            // Continue with other symbols
          }
        }
      }

      // Sort by datetime (newest first) and return
      return articles.sort((a, b) => b.datetime - a.datetime);
    } else {
      // No symbols provided, fetch general market news
      return getGeneralNews(from, to);
    }
  } catch (error) {
    console.error('Failed to fetch news:', error);
    throw new Error('Failed to fetch news');
  }
};

const getGeneralNews = async (_from: string, _to: string): Promise<FormattedArticle[]> => {
  const url = `${FINNHUB_BASE_URL}/news?category=general&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
  const news = await fetchJSON(url);

  if (!Array.isArray(news)) {
    return [];
  }

  // Deduplicate by id/url/headline and validate
  const seen = new Set<string>();
  const uniqueArticles: FormattedArticle[] = [];

  for (const article of news) {
    if (!validateArticle(article)) continue;

    const key = article.id || article.url || article.headline;
    if (seen.has(key)) continue;

    seen.add(key);
    uniqueArticles.push(formatArticle(article));

    if (uniqueArticles.length >= 6) break;
  }

  return uniqueArticles.sort((a, b) => b.datetime - a.datetime);
};