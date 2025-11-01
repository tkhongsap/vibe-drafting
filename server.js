import express from 'express';
import { load } from 'cheerio';
import { setupAuth, isAuthenticated } from './server/replitAuth.js';
import { storage } from './server/storage.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

app.use((req, res, next) => {
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [process.env.REPLIT_DEV_DOMAIN, process.env.REPL_SLUG && `${process.env.REPL_SLUG}.repl.co`].filter(Boolean)
    : ['*'];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes('*')) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
  } else if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  res.header('Access-Control-Allow-Headers', 'Content-Type, Cookie');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

await setupAuth(app);

function isPrivateIP(hostname) {
  const privateRanges = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^::1$/,
    /^fe80:/,
    /^fc00:/,
    /^fd00:/,
    /^localhost$/i
  ];
  
  return privateRanges.some(range => range.test(hostname));
}

function validateUrl(urlString) {
  try {
    const url = new URL(urlString);
    
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }
    
    if (url.port && !['80', '443', ''].includes(url.port)) {
      return { valid: false, error: 'Only standard HTTP/HTTPS ports are allowed' };
    }
    
    if (isPrivateIP(url.hostname)) {
      return { valid: false, error: 'Cannot fetch from private or local addresses' };
    }
    
    const suspiciousPatterns = ['file://', 'data:', 'javascript:'];
    if (suspiciousPatterns.some(pattern => urlString.toLowerCase().includes(pattern))) {
      return { valid: false, error: 'Invalid URL scheme detected' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

function extractMainContent(html, url) {
  const $ = load(html);
  
  $('script, style, nav, header, footer, iframe, noscript').remove();
  
  let title = $('title').text().trim();
  if (!title) {
    title = $('h1').first().text().trim();
  }
  if (!title) {
    title = $('meta[property="og:title"]').attr('content') || '';
  }
  
  let mainContent = '';
  
  const articleSelectors = [
    'article',
    'main',
    '[role="main"]',
    '.post-content',
    '.article-content',
    '.entry-content',
    '.content',
    '#content'
  ];
  
  for (const selector of articleSelectors) {
    const element = $(selector).first();
    if (element.length > 0) {
      mainContent = element.text();
      break;
    }
  }
  
  if (!mainContent || mainContent.length < 100) {
    mainContent = $('body').text();
  }
  
  mainContent = mainContent
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
  
  if (mainContent.length > 5000) {
    mainContent = mainContent.substring(0, 5000) + '...';
  }
  
  return {
    title: title || 'Untitled',
    content: mainContent || 'No content could be extracted from this page.'
  };
}

app.post('/api/fetch-url', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ 
      error: 'URL is required',
      title: '',
      content: ''
    });
  }
  
  const validation = validateUrl(url);
  if (!validation.valid) {
    return res.status(400).json({ 
      error: validation.error,
      title: '',
      content: ''
    });
  }
  
  try {
    console.log(`Fetching URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContentStudio/1.0; +https://contentstudio.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
      timeout: 10000,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw new Error('URL does not return HTML content');
    }
    
    const html = await response.text();
    const extracted = extractMainContent(html, url);
    
    console.log(`Successfully extracted content from ${url}`);
    console.log(`Title: ${extracted.title}`);
    console.log(`Content length: ${extracted.content.length} characters`);
    
    res.json({
      title: extracted.title,
      content: extracted.content
    });
    
  } catch (error) {
    console.error(`Error fetching URL ${url}:`, error.message);
    res.status(500).json({ 
      error: `Failed to fetch content: ${error.message}`,
      title: '',
      content: ''
    });
  }
});

app.get('/api/auth/user', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'content-studio-backend' });
});

if (isProduction) {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

const host = isProduction ? '0.0.0.0' : '127.0.0.1';
app.listen(PORT, host, () => {
  console.log(`Backend server running on http://${host}:${PORT}`);
  console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
  console.log(`Health check: http://${host}:${PORT}/health`);
  console.log(`Authentication endpoints ready: /api/login, /api/logout, /api/callback`);
  if (isProduction) {
    console.log(`Serving static files from dist/`);
  }
});
