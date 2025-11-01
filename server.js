import express from 'express';
import { load } from 'cheerio';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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
  
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Only HTTP and HTTPS protocols are supported');
    }
  } catch (error) {
    return res.status(400).json({ 
      error: 'Invalid URL format',
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'content-studio-backend' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Backend server running on http://127.0.0.1:${PORT}`);
  console.log(`Health check: http://127.0.0.1:${PORT}/health`);
});
