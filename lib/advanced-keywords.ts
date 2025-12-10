/**
 * Advanced keyword extraction and text analysis
 * Improved with N-gram support and better scoring
 */

// Extended stopwords list for better filtering
const STOPWORDS = new Set([
  // Common English words
  "the", "and", "or", "is", "at", "be", "by", "for", "from", "in", "of", "to", "with",
  "a", "an", "as", "are", "was", "were", "been", "have", "has", "had", "do", "does", "did",
  "will", "would", "should", "could", "can", "may", "might", "must", "shall", "this", "that",
  "these", "those", "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
  "my", "your", "his", "her", "its", "our", "their", "mine", "yours", "hers", "ours", "theirs",
  "who", "what", "when", "where", "why", "how", "which", "whose", "whom",
  "on", "up", "down", "out", "off", "over", "under", "again", "further", "then", "once",
  "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
  "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too",
  "very", "s", "t", "can", "will", "just", "don", "should", "now", "also", "into", "about",
  // Web-specific stopwords
  "www", "http", "https", "html", "htm", "php", "asp", "jsp", "com", "org", "net", "edu", "gov",
  "click", "here", "more", "read", "view", "see", "get", "go", "home", "about", "contact", "page",
  "site", "website", "web", "link", "links", "menu", "navigation", "nav", "footer", "header",
  "copyright", "rights", "reserved", "privacy", "policy", "terms", "conditions", "login", "sign",
  "signup", "register", "account", "profile", "dashboard", "admin", "logout", "search",
  // Code/Technical noise
  "var", "let", "const", "function", "return", "true", "false", "null", "undefined", "void",
  "class", "import", "export", "default", "extends", "implements", "interface", "package",
  "private", "protected", "public", "static", "yield", "typeof", "instanceof", "window",
  "document", "console", "log", "error", "warn", "info", "debug", "alert", "prompt", "confirm",
  "navigator", "location", "history", "screen", "performance", "localstorage", "sessionstorage",
  "cookie", "json", "ajax", "fetch", "axios", "jquery", "bootstrap", "tailwind", "sass", "less",
  "u002f", "u0026", "u003c", "u003e", "nbsp", "amp", "quot", "apos", "copy", "reg", "trade"
]);

// Technology and domain keywords for scoring
const TECH_KEYWORDS = new Set([
  "javascript", "typescript", "python", "java", "react", "vue", "angular", "node", "express",
  "database", "sql", "mongodb", "api", "rest", "graphql", "cloud", "aws", "docker", "kubernetes",
  "machine learning", "artificial intelligence", "blockchain", "cryptocurrency", "security",
  "privacy", "analytics", "data science", "algorithm", "framework", "library", "development",
  "software engineering", "design", "interface", "user experience", "mobile", "responsive",
  "frontend", "backend", "fullstack", "devops", "ci/cd", "git", "github", "gitlab",
  "serverless", "microservices", "architecture", "system design", "scalability", "performance"
]);

const BUSINESS_KEYWORDS = new Set([
  "business", "company", "corporation", "startup", "enterprise", "marketing", "sales", "revenue",
  "profit", "investment", "finance", "banking", "insurance", "consulting", "strategy", "management",
  "leadership", "team", "employee", "career", "job", "opportunity", "growth", "innovation",
  "customer", "client", "service", "support", "product", "solution", "industry", "market",
  "b2b", "b2c", "saas", "ecommerce", "marketplace", "venture capital", "funding", "acquisition"
]);

export interface KeywordAnalysis {
  primary: string[];      // Most important keywords
  secondary: string[];    // Supporting keywords
  technical: string[];    // Tech-related terms
  business: string[];     // Business-related terms
  entities: string[];     // Potential named entities
  score: number;          // Overall content quality score
}

export function extractAdvancedKeywords(text: string, url?: string): KeywordAnalysis {
  // 1. Clean and normalize text
  // Remove HTML tags if any (basic regex, better to use a parser but this is a fallback)
  const textContent = text.replace(/<[^>]*>/g, ' ');

  const cleanText = textContent
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ') // Keep hyphens for compound words
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Extract N-grams (1, 2, 3 words)
  const words = cleanText.split(' ').filter(w => w.length > 2 && !STOPWORDS.has(w) && !isGarbage(w));
  const bigrams = generateNgrams(cleanText, 2);
  const trigrams = generateNgrams(cleanText, 3);

  // Combine all candidates
  const allCandidates = [...words, ...bigrams, ...trigrams];

  // 3. Count frequencies
  const freqMap = new Map<string, number>();
  allCandidates.forEach(term => {
    // Filter out n-grams that start/end with stopwords
    const parts = term.split(' ');
    if (parts.length > 1) {
      if (STOPWORDS.has(parts[0]) || STOPWORDS.has(parts[parts.length - 1])) return;
    }

    freqMap.set(term, (freqMap.get(term) || 0) + 1);
  });

  // 4. Extract entities (capitalized phrases from original text)
  const entities = extractEntities(textContent);

  // 5. Score candidates
  const scoredTerms = Array.from(freqMap.entries())
    .map(([term, freq]) => ({
      term,
      freq,
      score: calculateTermScore(term, freq, textContent.length)
    }))
    .sort((a, b) => b.score - a.score);

  // 6. Deduplicate (remove "develop" if "developer" exists and has higher score, or vice versa)
  // Actually, we usually want to keep the more specific one if it's significant.
  // Simple dedup: if a term is contained in another higher-scored term, reduce its score or remove it.
  const uniqueTerms = deduplicateTerms(scoredTerms);

  // 7. Categorize
  const technical = uniqueTerms
    .filter(t => TECH_KEYWORDS.has(t.term) || isTechnicalTerm(t.term))
    .map(t => t.term);

  const business = uniqueTerms
    .filter(t => BUSINESS_KEYWORDS.has(t.term) || isBusinessTerm(t.term))
    .map(t => t.term);

  // Primary keywords (top scored, non-categorized or categorized)
  // We allow categorized terms in primary if they are very top scoring
  const primary = uniqueTerms
    .slice(0, 10)
    .map(t => t.term);

  // Secondary keywords
  const secondary = uniqueTerms
    .slice(10, 25)
    .map(t => t.term);

  // Calculate content quality score
  const contentScore = calculateContentScore(words.length, new Set(words).size, entities.length);

  return {
    primary: primary.slice(0, 8),
    secondary: secondary.slice(0, 10),
    technical: technical.slice(0, 8),
    business: business.slice(0, 8),
    entities: entities.slice(0, 8),
    score: contentScore
  };
}

function generateNgrams(text: string, n: number): string[] {
  const words = text.split(' ');
  const ngrams: string[] = [];

  for (let i = 0; i <= words.length - n; i++) {
    const slice = words.slice(i, i + n);
    // Ensure no stopwords inside the n-gram (strict) or just ensure it doesn't consist ONLY of stopwords
    // A better heuristic: n-gram shouldn't start or end with stopword (handled in freq count), 
    // and should contain at least one non-stopword.
    const hasContentWord = slice.some(w => !STOPWORDS.has(w) && w.length > 2 && !isGarbage(w));
    if (hasContentWord) {
      ngrams.push(slice.join(' '));
    }
  }
  return ngrams;
}

function extractEntities(text: string): string[] {
  // Improved entity extraction: look for sequences of Capitalized Words
  // Exclude start of sentences if possible (hard without sentence splitting), 
  // but we can check if the previous char was a period.

  const entityRegex = /(?:^|[\.\!\?]\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)|(?<!^|[\.\!\?]\s+)\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;

  const entities = new Map<string, number>();
  let match;

  // Reset regex index just in case
  entityRegex.lastIndex = 0;

  // We'll use a simpler regex for finding capitalized phrases not at start of sentence
  // Or just find all capitalized phrases and filter common ones.
  const simpleCapRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const matches = text.match(simpleCapRegex) || [];

  matches.forEach(entity => {
    const normalized = entity.toLowerCase();
    if (!STOPWORDS.has(normalized) && entity.length > 3) {
      entities.set(entity, (entities.get(entity) || 0) + 1);
    }
  });

  return Array.from(entities.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([entity]) => entity);
}

function calculateTermScore(term: string, frequency: number, textLength: number): number {
  let score = frequency;
  const wordCount = term.split(' ').length;

  // Boost score for phrases (n-grams)
  if (wordCount > 1) score *= 1.5;
  if (wordCount > 2) score *= 1.2;

  // Boost length
  if (term.length > 6) score *= 1.2;
  if (term.length > 12) score *= 1.1;

  // Boost technical and business terms
  if (TECH_KEYWORDS.has(term)) score *= 2.5;
  if (BUSINESS_KEYWORDS.has(term)) score *= 2.0;

  // Boost domain-specific terms
  if (isDomainSpecific(term)) score *= 1.5;

  // Normalize by text length (dampening factor)
  score = score / Math.log(Math.max(textLength, 100));

  return score;
}

function deduplicateTerms(scoredTerms: { term: string, score: number }[]): { term: string, score: number }[] {
  const result: { term: string, score: number }[] = [];
  const seen = new Set<string>();

  for (const item of scoredTerms) {
    if (seen.has(item.term)) continue;

    // Check if this term is a substring of an already added term with higher score
    // or if an already added term is a substring of this one
    let isRedundant = false;

    // Simple stemming check (very basic)
    const stem = item.term.replace(/s$/, '').replace(/ing$/, '').replace(/ed$/, '');

    for (const existing of result) {
      const existingStem = existing.term.replace(/s$/, '').replace(/ing$/, '').replace(/ed$/, '');

      if (stem === existingStem) {
        isRedundant = true;
        break;
      }

      // If one is "web development" and other is "development", keep "web development" if score is comparable
      // If "development" has much higher score, keep it.
      if (item.term.includes(existing.term) || existing.term.includes(item.term)) {
        // If the longer phrase has a good score (at least 70% of the shorter one), prefer the longer one
        // This is complex, for now let's just avoid exact subset if the score is lower
        if (item.term.includes(existing.term) && item.score < existing.score) {
          isRedundant = true; // Shorter term is better
          break;
        }
        if (existing.term.includes(item.term) && existing.score > item.score) {
          isRedundant = true; // Longer existing term is better
          break;
        }
      }
    }

    if (!isRedundant) {
      result.push(item);
      seen.add(item.term);
    }
  }

  return result;
}

function isTechnicalTerm(word: string): boolean {
  return /^(api|sdk|ui|ux|css|html|xml|json|yaml|sql|nosql|crud|auth|oauth|jwt|ssl|tls|vpn|cdn|dns|seo|crm|erp|saas|paas|iaas|devops|cicd|ide|git|npm|yarn|webpack|babel|eslint|jest|cypress|redux|graphql|restful|microservice|serverless)$/.test(word) ||
    word.endsWith('js') || word.endsWith('py') || word.endsWith('db') ||
    word.includes('tech') || word.includes('dev') || word.includes('code') ||
    word.includes('data') || word.includes('cloud');
}

function isBusinessTerm(word: string): boolean {
  return /^(ceo|cto|cfo|cmo|vp|director|manager|analyst|consultant|sales|marketing|finance|operations|strategy|revenue|profit|roi|kpi|b2b|b2c|startup|enterprise|saas|ecommerce|marketplace|growth|scale)$/.test(word);
}

function isDomainSpecific(word: string): boolean {
  // Check for domain-specific patterns
  return word.length > 7 &&
    !word.includes('http') &&
    (word.includes('system') || word.includes('platform') ||
      word.includes('solution') || word.includes('framework') ||
      word.includes('application') || word.includes('service') ||
      word.includes('network') || word.includes('protocol'));
}

function isGarbage(word: string): boolean {
  // Filter out obvious garbage
  if (word.length > 30) return true; // Too long
  if (word.includes('u00')) return true; // Unicode escapes
  if (/^\d+$/.test(word)) return true; // Just numbers
  if (/^[0-9a-f]{8,}$/.test(word)) return true; // Hex strings
  if (word.includes('_')) return true; // Snake case (often code)
  if (word.includes('=')) return true; // Assignments
  // Check for mashed together words (e.g., "windowfunctionvardocument")
  // This is hard to do perfectly without a dictionary, but we can check for common code patterns
  if (word.includes('function') || word.includes('return') || word.includes('typeof')) return true;

  return false;
}

function calculateContentScore(totalWords: number, uniqueWords: number, entities: number): number {
  if (totalWords === 0) return 0;

  const lexicalDiversity = uniqueWords / totalWords;

  let score = 0;

  // Content length score
  if (totalWords > 200) score += 20;
  if (totalWords > 600) score += 20;
  if (totalWords > 1200) score += 10;

  // Lexical diversity score
  if (lexicalDiversity > 0.3) score += 20;
  if (lexicalDiversity > 0.5) score += 10;

  // Entity presence score
  if (entities > 5) score += 10;
  if (entities > 10) score += 10;

  return Math.max(0, Math.min(100, score));
}

// Enhanced search functionality
export interface SearchOptions {
  query: string;
  algorithm: 'fuzzy' | 'exact' | 'semantic' | 'boolean';
  fields: ('title' | 'url' | 'keywords' | 'content')[];
  minScore?: number;
  category?: 'all' | 'technical' | 'business' | 'entities';
}

export function performAdvancedSearch(
  nodes: Array<{
    id: string;
    url: string;
    title: string;
    keywords: string[];
    content?: string;
    pageText?: string;
    contentScore?: number;
    keywordAnalysis?: KeywordAnalysis;
  }>,
  options: SearchOptions
) {
  const { query, algorithm, fields, minScore = 0, category } = options;
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

  return nodes
    .map(node => {
      let score = 0;
      const matches: string[] = [];

      // Search in specified fields
      fields.forEach(field => {
        let fieldContent = '';
        let fieldWeight = 1;

        switch (field) {
          case 'title':
            fieldContent = node.title.toLowerCase();
            fieldWeight = 3; // Title matches are most important
            break;
          case 'url':
            fieldContent = node.url.toLowerCase();
            fieldWeight = 2;
            break;
          case 'keywords':
            const keywordSource = category === 'technical' ? node.keywordAnalysis?.technical :
              category === 'business' ? node.keywordAnalysis?.business :
                category === 'entities' ? node.keywordAnalysis?.entities :
                  node.keywords;
            fieldContent = (keywordSource || []).join(' ').toLowerCase();
            fieldWeight = 2.5;
            break;
          case 'content':
            fieldContent = (node.content || node.pageText || '').toLowerCase();
            fieldWeight = 1;
            break;
        }

        const fieldScore = calculateFieldScore(fieldContent, queryWords, algorithm);
        score += fieldScore * fieldWeight;

        if (fieldScore > 0) {
          matches.push(field);
        }
      });

      return {
        node,
        score,
        matches,
        relevance: score / Math.max(queryWords.length, 1)
      };
    })
    .filter(result => result.score >= minScore)
    .sort((a, b) => b.score - a.score);
}

function calculateFieldScore(fieldContent: string, queryWords: string[], algorithm: string): number {
  let score = 0;

  queryWords.forEach(word => {
    switch (algorithm) {
      case 'exact':
        if (fieldContent.includes(word)) score += 10;
        break;
      case 'fuzzy':
        score += fuzzyMatch(fieldContent, word) * 5;
        break;
      case 'semantic':
        score += semanticMatch(fieldContent, word) * 3;
        break;
      case 'boolean':
        // Simple boolean search - all words must be present
        if (fieldContent.includes(word)) score += 5;
        else return 0; // If any word is missing, score is 0
        break;
    }
  });

  return score;
}

function fuzzyMatch(text: string, word: string): number {
  // Simple fuzzy matching - check for partial matches
  if (text.includes(word)) return 1;

  // Check for near matches (e.g. off by 1-2 chars)
  // This is computationally expensive for large text, so we stick to substring
  // But we can check if 80% of the word exists as a substring
  if (word.length > 4) {
    const sub = word.substring(0, Math.ceil(word.length * 0.8));
    if (text.includes(sub)) return 0.8;
  }

  return 0;
}

function semanticMatch(text: string, word: string): number {
  // Simple semantic matching using related terms
  const semanticMap: Record<string, string[]> = {
    'web': ['website', 'site', 'page', 'online', 'internet', 'browser'],
    'development': ['dev', 'coding', 'programming', 'software', 'engineering'],
    'design': ['ui', 'ux', 'interface', 'visual', 'layout', 'creative'],
    'business': ['company', 'enterprise', 'corporate', 'commercial', 'startup'],
    'technology': ['tech', 'technical', 'digital', 'innovation', 'modern'],
    'data': ['analytics', 'statistics', 'information', 'database', 'science'],
    'security': ['privacy', 'protection', 'safe', 'secure', 'auth'],
  };

  const related = semanticMap[word] || [];
  let score = 0;

  related.forEach(term => {
    if (text.includes(term)) score += 0.7;
  });

  return score;
}
