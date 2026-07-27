import { config } from 'dotenv';
import { resolve } from 'path';
// Load .env first, then .env.local to override
config();
config({ path: resolve(__dirname, '..', '.env.local'), override: true });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import YahooFinance from 'yahoo-finance2';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });
const yf = new YahooFinance();

// ── 120+ Stocks across all sectors ──────────────────────────────────────────
const STOCKS = [
  // Technology
  { symbol: 'AAPL',  name: 'Apple Inc.',                                   sector: 'Technology',             industry: 'Consumer Electronics' },
  { symbol: 'MSFT',  name: 'Microsoft Corporation',                        sector: 'Technology',             industry: 'Software—Infrastructure' },
  { symbol: 'NVDA',  name: 'NVIDIA Corporation',                           sector: 'Technology',             industry: 'Semiconductors' },
  { symbol: 'AMD',   name: 'Advanced Micro Devices Inc.',                  sector: 'Technology',             industry: 'Semiconductors' },
  { symbol: 'INTC',  name: 'Intel Corporation',                            sector: 'Technology',             industry: 'Semiconductors' },
  { symbol: 'CRM',   name: 'Salesforce Inc.',                              sector: 'Technology',             industry: 'Software—Application' },
  { symbol: 'ORCL',  name: 'Oracle Corporation',                           sector: 'Technology',             industry: 'Software—Infrastructure' },
  { symbol: 'ADBE',  name: 'Adobe Inc.',                                   sector: 'Technology',             industry: 'Software—Infrastructure' },
  { symbol: 'CSCO',  name: 'Cisco Systems Inc.',                           sector: 'Technology',             industry: 'Communication Equipment' },
  { symbol: 'IBM',   name: 'International Business Machines Corp.',        sector: 'Technology',             industry: 'Information Technology Services' },
  { symbol: 'QCOM',  name: 'Qualcomm Inc.',                                sector: 'Technology',             industry: 'Semiconductors' },
  { symbol: 'TXN',   name: 'Texas Instruments Inc.',                       sector: 'Technology',             industry: 'Semiconductors' },
  { symbol: 'AVGO',  name: 'Broadcom Inc.',                                sector: 'Technology',             industry: 'Semiconductors' },
  { symbol: 'MU',    name: 'Micron Technology Inc.',                       sector: 'Technology',             industry: 'Semiconductors' },
  { symbol: 'NOW',   name: 'ServiceNow Inc.',                              sector: 'Technology',             industry: 'Software—Application' },
  { symbol: 'PANW',  name: 'Palo Alto Networks Inc.',                      sector: 'Technology',             industry: 'Software—Infrastructure' },
  { symbol: 'ANET',  name: 'Arista Networks Inc.',                         sector: 'Technology',             industry: 'Computer Hardware' },
  { symbol: 'SNPS',  name: 'Synopsys Inc.',                                sector: 'Technology',             industry: 'Software—Infrastructure' },
  { symbol: 'CDNS',  name: 'Cadence Design Systems Inc.',                  sector: 'Technology',             industry: 'Software—Application' },
  { symbol: 'ADI',   name: 'Analog Devices Inc.',                          sector: 'Technology',             industry: 'Semiconductors' },
  { symbol: 'KLAC',  name: 'KLA Corporation',                              sector: 'Technology',             industry: 'Semiconductor Equipment & Materials' },
  { symbol: 'LRCX',  name: 'Lam Research Corporation',                     sector: 'Technology',             industry: 'Semiconductor Equipment & Materials' },
  { symbol: 'AMAT',  name: 'Applied Materials Inc.',                       sector: 'Technology',             industry: 'Semiconductor Equipment & Materials' },
  { symbol: 'MU',    name: 'Micron Technology Inc.',                       sector: 'Technology',             industry: 'Semiconductors' },
  { symbol: 'DELL',  name: 'Dell Technologies Inc.',                       sector: 'Technology',             industry: 'Computer Hardware' },
  { symbol: 'HPQ',   name: 'HP Inc.',                                      sector: 'Technology',             industry: 'Computer Hardware' },
  { symbol: 'PLTR',  name: 'Palantir Technologies Inc.',                   sector: 'Technology',             industry: 'Software—Infrastructure' },
  { symbol: 'SMCI',  name: 'Super Micro Computer Inc.',                    sector: 'Technology',             industry: 'Computer Hardware' },

  // Communication Services
  { symbol: 'GOOGL', name: 'Alphabet Inc.',                                sector: 'Communication Services', industry: 'Internet Content & Information' },
  { symbol: 'META',  name: 'Meta Platforms Inc.',                          sector: 'Communication Services', industry: 'Internet Content & Information' },
  { symbol: 'NFLX',  name: 'Netflix Inc.',                                 sector: 'Communication Services', industry: 'Entertainment' },
  { symbol: 'DIS',   name: 'The Walt Disney Company',                      sector: 'Communication Services', industry: 'Entertainment' },
  { symbol: 'CMCSA', name: 'Comcast Corporation',                          sector: 'Communication Services', industry: 'Telecom Services' },
  { symbol: 'T',     name: 'AT&T Inc.',                                    sector: 'Communication Services', industry: 'Telecom Services' },
  { symbol: 'VZ',    name: 'Verizon Communications Inc.',                  sector: 'Communication Services', industry: 'Telecom Services' },
  { symbol: 'TMUS',  name: 'T-Mobile US Inc.',                             sector: 'Communication Services', industry: 'Telecom Services' },
  { symbol: 'EA',    name: 'Electronic Arts Inc.',                         sector: 'Communication Services', industry: 'Electronic Gaming & Multimedia' },
  { symbol: 'TTWO',  name: 'Take-Two Interactive Software Inc.',           sector: 'Communication Services', industry: 'Electronic Gaming & Multimedia' },
  { symbol: 'ROKU',  name: 'Roku Inc.',                                    sector: 'Communication Services', industry: 'Entertainment' },
  { symbol: 'SNAP',  name: 'Snap Inc.',                                    sector: 'Communication Services', industry: 'Internet Content & Information' },
  { symbol: 'PINS',  name: 'Pinterest Inc.',                               sector: 'Communication Services', industry: 'Internet Content & Information' },

  // Consumer Cyclical
  { symbol: 'AMZN',  name: 'Amazon.com Inc.',                              sector: 'Consumer Cyclical',      industry: 'Internet Retail' },
  { symbol: 'TSLA',  name: 'Tesla Inc.',                                   sector: 'Consumer Cyclical',      industry: 'Auto Manufacturers' },
  { symbol: 'HD',    name: 'The Home Depot Inc.',                          sector: 'Consumer Cyclical',      industry: 'Home Improvement Retail' },
  { symbol: 'MCD',   name: 'McDonald\'s Corporation',                      sector: 'Consumer Cyclical',      industry: 'Restaurants' },
  { symbol: 'NKE',   name: 'Nike Inc.',                                    sector: 'Consumer Cyclical',      industry: 'Footwear & Accessories' },
  { symbol: 'SBUX',  name: 'Starbucks Corporation',                        sector: 'Consumer Cyclical',      industry: 'Restaurants' },
  { symbol: 'LOW',   name: 'Lowe\'s Companies Inc.',                       sector: 'Consumer Cyclical',      industry: 'Home Improvement Retail' },
  { symbol: 'TJX',   name: 'The TJX Companies Inc.',                       sector: 'Consumer Cyclical',      industry: 'Apparel Retail' },
  { symbol: 'BKNG',  name: 'Booking Holdings Inc.',                        sector: 'Consumer Cyclical',      industry: 'Travel Services' },
  { symbol: 'ABNB',  name: 'Airbnb Inc.',                                  sector: 'Consumer Cyclical',      industry: 'Travel Services' },
  { symbol: 'UBER',  name: 'Uber Technologies Inc.',                       sector: 'Consumer Cyclical',      industry: 'Software—Application' },
  { symbol: 'LYFT',  name: 'Lyft Inc.',                                    sector: 'Consumer Cyclical',      industry: 'Software—Application' },
  { symbol: 'DASH',  name: 'DoorDash Inc.',                                sector: 'Consumer Cyclical',      industry: 'Software—Application' },
  { symbol: 'GM',    name: 'General Motors Company',                       sector: 'Consumer Cyclical',      industry: 'Auto Manufacturers' },
  { symbol: 'F',     name: 'Ford Motor Company',                           sector: 'Consumer Cyclical',      industry: 'Auto Manufacturers' },
  { symbol: 'RIVN',  name: 'Rivian Automotive Inc.',                       sector: 'Consumer Cyclical',      industry: 'Auto Manufacturers' },
  { symbol: 'AMZN',  name: 'Amazon.com Inc.',                              sector: 'Consumer Cyclical',      industry: 'Internet Retail' },

  // Financial Services
  { symbol: 'JPM',   name: 'JPMorgan Chase & Co.',                         sector: 'Financial Services',     industry: 'Banks—Diversified' },
  { symbol: 'V',     name: 'Visa Inc.',                                    sector: 'Financial Services',     industry: 'Credit Services' },
  { symbol: 'MA',    name: 'Mastercard Inc.',                              sector: 'Financial Services',     industry: 'Credit Services' },
  { symbol: 'BAC',   name: 'Bank of America Corporation',                  sector: 'Financial Services',     industry: 'Banks—Diversified' },
  { symbol: 'GS',    name: 'The Goldman Sachs Group Inc.',                 sector: 'Financial Services',     industry: 'Capital Markets' },
  { symbol: 'MS',    name: 'Morgan Stanley',                               sector: 'Financial Services',     industry: 'Capital Markets' },
  { symbol: 'WFC',   name: 'Wells Fargo & Company',                        sector: 'Financial Services',     industry: 'Banks—Diversified' },
  { symbol: 'BLK',   name: 'BlackRock Inc.',                               sector: 'Financial Services',     industry: 'Asset Management' },
  { symbol: 'AXP',   name: 'American Express Company',                     sector: 'Financial Services',     industry: 'Credit Services' },
  { symbol: 'C',     name: 'Citigroup Inc.',                               sector: 'Financial Services',     industry: 'Banks—Diversified' },
  { symbol: 'SCHW',  name: 'Charles Schwab Corporation',                   sector: 'Financial Services',     industry: 'Capital Markets' },
  { symbol: 'PYPL',  name: 'PayPal Holdings Inc.',                         sector: 'Financial Services',     industry: 'Software—Infrastructure' },
  { symbol: 'SQ',    name: 'Block Inc.',                                   sector: 'Financial Services',     industry: 'Software—Infrastructure' },
  { symbol: 'COIN',  name: 'Coinbase Global Inc.',                         sector: 'Financial Services',     industry: 'Capital Markets' },

  // Healthcare
  { symbol: 'UNH',   name: 'UnitedHealth Group Inc.',                      sector: 'Healthcare',             industry: 'Healthcare Plans' },
  { symbol: 'JNJ',   name: 'Johnson & Johnson',                            sector: 'Healthcare',             industry: 'Drug Manufacturers—General' },
  { symbol: 'PFE',   name: 'Pfizer Inc.',                                  sector: 'Healthcare',             industry: 'Drug Manufacturers—General' },
  { symbol: 'ABBV',  name: 'AbbVie Inc.',                                  sector: 'Healthcare',             industry: 'Drug Manufacturers—General' },
  { symbol: 'MRK',   name: 'Merck & Co. Inc.',                             sector: 'Healthcare',             industry: 'Drug Manufacturers—General' },
  { symbol: 'TMO',   name: 'Thermo Fisher Scientific Inc.',                sector: 'Healthcare',             industry: 'Diagnostics & Research' },
  { symbol: 'LLY',   name: 'Eli Lilly and Company',                        sector: 'Healthcare',             industry: 'Drug Manufacturers—General' },
  { symbol: 'ABT',   name: 'Abbott Laboratories',                          sector: 'Healthcare',             industry: 'Medical Devices' },
  { symbol: 'MDT',   name: 'Medtronic plc',                                sector: 'Healthcare',             industry: 'Medical Devices' },
  { symbol: 'SYK',   name: 'Stryker Corporation',                          sector: 'Healthcare',             industry: 'Medical Devices' },
  { symbol: 'ISRG',  name: 'Intuitive Surgical Inc.',                      sector: 'Healthcare',             industry: 'Medical Instruments & Supplies' },
  { symbol: 'GILD',  name: 'Gilead Sciences Inc.',                         sector: 'Healthcare',             industry: 'Drug Manufacturers—General' },
  { symbol: 'AMGN',  name: 'Amgen Inc.',                                   sector: 'Healthcare',             industry: 'Drug Manufacturers—General' },
  { symbol: 'VRTX',  name: 'Vertex Pharmaceuticals Inc.',                  sector: 'Healthcare',             industry: 'Drug Manufacturers—General' },
  { symbol: 'BSX',   name: 'Boston Scientific Corporation',                sector: 'Healthcare',             industry: 'Medical Devices' },
  { symbol: 'REGN',  name: 'Regeneron Pharmaceuticals Inc.',               sector: 'Healthcare',             industry: 'Drug Manufacturers—General' },
  { symbol: 'DHR',   name: 'Danaher Corporation',                          sector: 'Healthcare',             industry: 'Diagnostics & Research' },
  { symbol: 'CVS',   name: 'CVS Health Corporation',                       sector: 'Healthcare',             industry: 'Healthcare Plans' },
  { symbol: 'CI',    name: 'The Cigna Group',                              sector: 'Healthcare',             industry: 'Healthcare Plans' },
  { symbol: 'HCA',   name: 'HCA Healthcare Inc.',                          sector: 'Healthcare',             industry: 'Medical Care Facilities' },

  // Energy
  { symbol: 'XOM',   name: 'Exxon Mobil Corporation',                      sector: 'Energy',                 industry: 'Oil & Gas Integrated' },
  { symbol: 'CVX',   name: 'Chevron Corporation',                          sector: 'Energy',                 industry: 'Oil & Gas Integrated' },
  { symbol: 'COP',   name: 'ConocoPhillips',                               sector: 'Energy',                 industry: 'Oil & Gas Exploration & Production' },
  { symbol: 'EOG',   name: 'EOG Resources Inc.',                           sector: 'Energy',                 industry: 'Oil & Gas Exploration & Production' },
  { symbol: 'SLB',   name: 'Schlumberger N.V.',                            sector: 'Energy',                 industry: 'Oil & Gas Equipment & Services' },
  { symbol: 'HAL',   name: 'Halliburton Company',                          sector: 'Energy',                 industry: 'Oil & Gas Equipment & Services' },
  { symbol: 'OXY',   name: 'Occidental Petroleum Corporation',             sector: 'Energy',                 industry: 'Oil & Gas Exploration & Production' },
  { symbol: 'MPC',   name: 'Marathon Petroleum Corporation',               sector: 'Energy',                 industry: 'Oil & Gas Refining & Marketing' },
  { symbol: 'VLO',   name: 'Valero Energy Corporation',                    sector: 'Energy',                 industry: 'Oil & Gas Refining & Marketing' },
  { symbol: 'PSX',   name: 'Phillips 66',                                  sector: 'Energy',                 industry: 'Oil & Gas Refining & Marketing' },
  { symbol: 'ENPH',  name: 'Enphase Energy Inc.',                          sector: 'Energy',                 industry: 'Solar' },
  { symbol: 'SEDG',  name: 'SolarEdge Technologies Inc.',                  sector: 'Energy',                 industry: 'Solar' },

  // Industrials
  { symbol: 'CAT',   name: 'Caterpillar Inc.',                             sector: 'Industrials',            industry: 'Farm & Heavy Construction Machinery' },
  { symbol: 'BA',    name: 'The Boeing Company',                           sector: 'Industrials',            industry: 'Aerospace & Defense' },
  { symbol: 'GE',    name: 'General Electric Company',                     sector: 'Industrials',            industry: 'Aerospace & Defense' },
  { symbol: 'HON',   name: 'Honeywell International Inc.',                 sector: 'Industrials',            industry: 'Conglomerates' },
  { symbol: 'UPS',   name: 'United Parcel Service Inc.',                   sector: 'Industrials',            industry: 'Integrated Freight & Logistics' },
  { symbol: 'FDX',   name: 'FedEx Corporation',                            sector: 'Industrials',            industry: 'Integrated Freight & Logistics' },
  { symbol: 'UNP',   name: 'Union Pacific Corporation',                    sector: 'Industrials',            industry: 'Railroads' },
  { symbol: 'LMT',   name: 'Lockheed Martin Corporation',                  sector: 'Industrials',            industry: 'Aerospace & Defense' },
  { symbol: 'RTX',   name: 'RTX Corporation',                              sector: 'Industrials',            industry: 'Aerospace & Defense' },
  { symbol: 'DE',    name: 'Deere & Company',                              sector: 'Industrials',            industry: 'Farm & Heavy Construction Machinery' },
  { symbol: 'MMM',   name: '3M Company',                                   sector: 'Industrials',            industry: 'Conglomerates' },
  { symbol: 'EMR',   name: 'Emerson Electric Co.',                         sector: 'Industrials',            industry: 'Industrial—Machinery' },
  { symbol: 'CSX',   name: 'CSX Corporation',                              sector: 'Industrials',            industry: 'Railroads' },
  { symbol: 'NSC',   name: 'Norfolk Southern Corporation',                 sector: 'Industrials',            industry: 'Railroads' },
  { symbol: 'WM',    name: 'Waste Management Inc.',                        sector: 'Industrials',            industry: 'Waste Management' },

  // Consumer Defensive
  { symbol: 'PG',    name: 'The Procter & Gamble Company',                 sector: 'Consumer Defensive',     industry: 'Household & Personal Products' },
  { symbol: 'KO',    name: 'The Coca-Cola Company',                        sector: 'Consumer Defensive',     industry: 'Beverages—Non-Alcoholic' },
  { symbol: 'PEP',   name: 'PepsiCo Inc.',                                 sector: 'Consumer Defensive',     industry: 'Beverages—Non-Alcoholic' },
  { symbol: 'WMT',   name: 'Walmart Inc.',                                 sector: 'Consumer Defensive',     industry: 'Discount Stores' },
  { symbol: 'COST',  name: 'Costco Wholesale Corporation',                 sector: 'Consumer Defensive',     industry: 'Discount Stores' },
  { symbol: 'PM',    name: 'Philip Morris International Inc.',             sector: 'Consumer Defensive',     industry: 'Tobacco' },
  { symbol: 'MO',    name: 'Altria Group Inc.',                            sector: 'Consumer Defensive',     industry: 'Tobacco' },
  { symbol: 'MDLZ',  name: 'Mondelez International Inc.',                  sector: 'Consumer Defensive',     industry: 'Confectioners' },
  { symbol: 'CL',    name: 'Colgate-Palmolive Company',                    sector: 'Consumer Defensive',     industry: 'Household & Personal Products' },
  { symbol: 'SYY',   name: 'Sysco Corporation',                            sector: 'Consumer Defensive',     industry: 'Food Distribution' },
  { symbol: 'KMB',   name: 'Kimberly-Clark Corporation',                   sector: 'Consumer Defensive',     industry: 'Household & Personal Products' },
  { symbol: 'KHC',   name: 'The Kraft Heinz Company',                      sector: 'Consumer Defensive',     industry: 'Packaged Foods' },
  { symbol: 'CAG',   name: 'Conagra Brands Inc.',                          sector: 'Consumer Defensive',     industry: 'Packaged Foods' },

  // Real Estate
  { symbol: 'PLD',   name: 'Prologis Inc.',                                sector: 'Real Estate',            industry: 'REIT—Industrial' },
  { symbol: 'AMT',   name: 'American Tower Corporation',                   sector: 'Real Estate',            industry: 'REIT—Specialty' },
  { symbol: 'CCI',   name: 'Crown Castle Inc.',                            sector: 'Real Estate',            industry: 'REIT—Specialty' },
  { symbol: 'EQIX',  name: 'Equinix Inc.',                                 sector: 'Real Estate',            industry: 'REIT—Specialty' },
  { symbol: 'WELL',  name: 'WELLTower Inc.',                               sector: 'Real Estate',            industry: 'REIT—Healthcare Facilities' },
  { symbol: 'SPG',   name: 'Simon Property Group Inc.',                    sector: 'Real Estate',            industry: 'REIT—Retail' },
  { symbol: 'PSA',   name: 'Public Storage',                               sector: 'Real Estate',            industry: 'REIT—Self Storage' },
  { symbol: 'O',     name: 'Realty Income Corporation',                    sector: 'Real Estate',            industry: 'REIT—Diversified' },

  // Basic Materials
  { symbol: 'LIN',   name: 'Linde plc',                                    sector: 'Basic Materials',        industry: 'Specialty Chemicals' },
  { symbol: 'SHW',   name: 'The Sherwin-Williams Company',                 sector: 'Basic Materials',        industry: 'Specialty Chemicals' },
  { symbol: 'APD',   name: 'Air Products and Chemicals Inc.',              sector: 'Basic Materials',        industry: 'Specialty Chemicals' },
  { symbol: 'ECL',   name: 'Ecolab Inc.',                                  sector: 'Basic Materials',        industry: 'Specialty Chemicals' },
  { symbol: 'NEM',   name: 'Newmont Corporation',                          sector: 'Basic Materials',        industry: 'Gold' },
  { symbol: 'FCX',   name: 'Freeport-McMoRan Inc.',                        sector: 'Basic Materials',        industry: 'Copper' },
  { symbol: 'DOW',   name: 'Dow Inc.',                                     sector: 'Basic Materials',        industry: 'Chemicals' },
  { symbol: 'LYB',   name: 'LyondellBasell Industries N.V.',               sector: 'Basic Materials',        industry: 'Specialty Chemicals' },
  { symbol: 'BHP',   name: 'BHP Group Limited',                            sector: 'Basic Materials',        industry: 'Other Industrial Metals & Mining' },

  // Utilities
  { symbol: 'NEE',   name: 'NextEra Energy Inc.',                          sector: 'Utilities',              industry: 'Utilities—Regulated Electric' },
  { symbol: 'DUK',   name: 'Duke Energy Corporation',                      sector: 'Utilities',              industry: 'Utilities—Regulated Electric' },
  { symbol: 'SO',    name: 'The Southern Company',                         sector: 'Utilities',              industry: 'Utilities—Regulated Electric' },
  { symbol: 'CEG',   name: 'Constellation Energy Corporation',             sector: 'Utilities',              industry: 'Utilities—Independent Power Producers' },
  { symbol: 'AEP',   name: 'American Electric Power Company Inc.',         sector: 'Utilities',              industry: 'Utilities—Regulated Electric' },
  { symbol: 'SRE',   name: 'Sempra',                                       sector: 'Utilities',              industry: 'Utilities—Diversified' },
  { symbol: 'EXC',   name: 'Exelon Corporation',                           sector: 'Utilities',              industry: 'Utilities—Regulated Electric' },
  { symbol: 'XEL',   name: 'Xcel Energy Inc.',                             sector: 'Utilities',              industry: 'Utilities—Regulated Electric' },
  { symbol: 'PEG',   name: 'Public Service Enterprise Group Inc.',         sector: 'Utilities',              industry: 'Utilities—Regulated Electric' },
].filter(
  // Deduplicate by symbol — keep the first occurrence
  (stock, index, self) => self.findIndex((s) => s.symbol === stock.symbol) === index
);

// ── Helpers ────────────────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fetch live quote data from Yahoo Finance with retry logic. */
async function fetchQuote(symbol: string, retries = 2): Promise<{
  price: number | null;
  change24h: number | null;
  changePercent24h: number | null;
  volume: number | null;
  marketCap: number | null;
} | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const quote = await yf.quote(symbol);
      const regularPrice = quote.regularMarketPrice ?? null;
      const prevClose = quote.regularMarketPreviousClose ?? null;

      return {
        price: regularPrice,
        change24h:
          regularPrice != null && prevClose != null
            ? Number((regularPrice - prevClose).toFixed(2))
            : null,
        changePercent24h:
          regularPrice != null && prevClose != null && prevClose !== 0
            ? Number((((regularPrice - prevClose) / prevClose) * 100).toFixed(3))
            : null,
        volume: quote.regularMarketVolume ?? null,
        marketCap: quote.marketCap ?? null,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      // Rate-limited — wait and retry
      if (message.includes('429') || message.includes('Too Many Requests')) {
        const wait = 2000 * (attempt + 1);
        console.warn(`  ⏳ Rate limited on ${symbol}, waiting ${wait}ms…`);
        await sleep(wait);
        continue;
      }
      if (attempt < retries) {
        console.warn(`  ⚠️  Retry ${attempt + 1}/${retries} for ${symbol}: ${message}`);
        await sleep(1000);
        continue;
      }
      console.error(`  ❌ Failed to fetch ${symbol} after ${retries + 1} attempts: ${message}`);
      return null;
    }
  }
  return null;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('━'.repeat(50));
  console.log(`📈 Pulse — Seeding ${STOCKS.length} stocks with live data`);
  console.log('━'.repeat(50));

  const BATCH_SIZE = 5;    // concurrent requests per batch
  const BATCH_DELAY = 600; // ms between batches (avoid rate limiting)

  let seeded = 0;
  let failed = 0;

  for (let i = 0; i < STOCKS.length; i += BATCH_SIZE) {
    const batch = STOCKS.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async (stock) => {
        const quote = await fetchQuote(stock.symbol);

        await prisma.stock.upsert({
          where: { symbol: stock.symbol },
          update: {
            name: stock.name,
            sector: stock.sector,
            industry: stock.industry,
            price: quote?.price ?? undefined,
            change24h: quote?.change24h ?? undefined,
            changePercent24h: quote?.changePercent24h ?? undefined,
            volume: quote?.volume ?? undefined,
            marketCap: quote?.marketCap ?? undefined,
            isActive: true,
          },
          create: {
            symbol: stock.symbol,
            name: stock.name,
            sector: stock.sector,
            industry: stock.industry,
            price: quote?.price ?? undefined,
            change24h: quote?.change24h ?? undefined,
            changePercent24h: quote?.changePercent24h ?? undefined,
            volume: quote?.volume ?? undefined,
            marketCap: quote?.marketCap ?? undefined,
            isActive: true,
          },
        });

        const priceStr = quote?.price != null ? `$${Number(quote.price).toFixed(2)}` : 'N/A';
        console.log(`  ✅ ${stock.symbol.padEnd(5)} ${priceStr.padEnd(10)} ${stock.sector}`);
      }),
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        seeded++;
      } else {
        failed++;
      }
    }

    // Progress indicator
    const pct = Math.round(((i + batch.length) / STOCKS.length) * 100);
    console.log(`  ── ${Math.min(i + BATCH_SIZE, STOCKS.length)}/${STOCKS.length} (${pct}%) ──\n`);

    if (i + BATCH_SIZE < STOCKS.length) {
      await sleep(BATCH_DELAY);
    }
  }

  console.log('━'.repeat(50));
  console.log(`🎉 Done — ${seeded} stocks seeded, ${failed} failed`);
  console.log('━'.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Fatal error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
