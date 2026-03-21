import { CFTC_CURRENCY_URL, CFTC_DISAGG_URL } from './types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const FETCH_TIMEOUT_MS = 30_000;
const execAsync = promisify(exec);
const HISTORICAL_FETCH_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function historicalUrl(type: 'legacy_fut' | 'fut_disagg', year: number) {
  if (type === 'legacy_fut') {
    return `https://www.cftc.gov/files/dea/history/deacot${year}.zip`;
  }

  return `https://www.cftc.gov/files/dea/history/fut_disagg_txt_${year}.zip`;
}

const CURRENCY_URL_FALLBACKS = [
  CFTC_CURRENCY_URL,
];

const DISAGG_URL_FALLBACKS = [
  CFTC_DISAGG_URL,
  'https://www.cftc.gov/dea/newcot/c_disagg.txt',
  // Historical prompt URL retained as last fallback.
  'https://www.cftc.gov/dea/newcot/DisaggWk.txt',
];

async function fetchWithTimeout(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        // CFTC may reject non-browser-like user agents from server runtimes.
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        Accept: 'text/plain,text/csv,*/*',
        Referer: 'https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm',
      },
    });
    if (!res.ok) {
      throw new Error(`CFTC fetch failed: ${res.status} ${res.statusText} for ${url}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithFallbacks(urls: string[]): Promise<string> {
  let lastError: unknown = null;
  for (const url of urls) {
    try {
      return await fetchWithTimeout(url);
    } catch (err) {
      lastError = err;
    }
  }

  // Dev/local fallback for Windows where CFTC may block Node HTTP clients.
  if (process.platform === 'win32') {
    for (const url of urls) {
      try {
        const command = `powershell -NoProfile -Command "(Invoke-WebRequest -UseBasicParsing -Uri '${url}' -TimeoutSec 45).Content"`;
        const { stdout } = await execAsync(command, {
          maxBuffer: 50 * 1024 * 1024,
        });

        if (stdout && stdout.trim().length > 0) {
          return stdout;
        }
      } catch (err) {
        lastError = err;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to fetch from all CFTC URLs');
}

export async function fetchCurrencyRaw(): Promise<string> {
  return fetchWithFallbacks(CURRENCY_URL_FALLBACKS);
}

export async function fetchDisaggRaw(): Promise<string> {
  return fetchWithFallbacks(DISAGG_URL_FALLBACKS);
}

async function fetchHistoricalZipTextViaPowerShell(url: string): Promise<string> {
  if (process.platform !== 'win32') {
    throw new Error('Historical ZIP extraction fallback is only implemented for Windows.');
  }

  const workdir = await mkdtemp(join(tmpdir(), 'cot-hist-'));
  const scriptPath = join(workdir, 'extract.ps1');
  const script = [
    "$ErrorActionPreference='Stop'",
    "$tmp = Join-Path $env:TEMP ('cot_' + [Guid]::NewGuid().ToString())",
    'New-Item -ItemType Directory -Path $tmp | Out-Null',
    "$zip = Join-Path $tmp 'data.zip'",
    "$out = Join-Path $tmp 'out'",
    `Invoke-WebRequest -UseBasicParsing -Uri '${url}' -OutFile $zip -TimeoutSec 60`,
    'Expand-Archive -Path $zip -DestinationPath $out -Force',
    "$txt = Get-ChildItem $out -Recurse -Filter *.txt | Select-Object -First 1",
    "if (-not $txt) { throw 'No .txt file found inside CFTC historical zip' }",
    'Get-Content $txt.FullName -Raw',
    'Remove-Item $tmp -Recurse -Force',
  ].join('\n');

  try {
    await writeFile(scriptPath, script, 'utf8');
    const command = `powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`;

    let lastError: unknown = null;
    for (let attempt = 1; attempt <= HISTORICAL_FETCH_RETRIES; attempt++) {
      try {
        const { stdout } = await execAsync(command, { maxBuffer: 80 * 1024 * 1024 });
        if (!stdout || stdout.trim().length === 0) {
          throw new Error(`Historical zip returned empty content: ${url}`);
        }

        return stdout;
      } catch (error) {
        lastError = error;
        if (attempt < HISTORICAL_FETCH_RETRIES) {
          await sleep(1_500 * attempt);
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error(`Historical zip fetch failed: ${url}`);
  } finally {
    await rm(workdir, { recursive: true, force: true });
  }
}

export async function fetchCurrencyHistoricalRaw(year: number): Promise<string> {
  return fetchHistoricalZipTextViaPowerShell(historicalUrl('legacy_fut', year));
}

export async function fetchDisaggHistoricalRaw(year: number): Promise<string> {
  return fetchHistoricalZipTextViaPowerShell(historicalUrl('fut_disagg', year));
}
