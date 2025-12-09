# Web Crawler

An web crawling system that combines multiple Data Structures & Algorithms (DSA) concepts with advanced keyword extraction and powerful search capabilities.

## 🚀 Key Features

### 1. **Multiple Crawling Algorithms**
- **BFS (Breadth-First Search)**: Explores websites level by level for comprehensive site mapping
- **DFS (Depth-First Search)**: Follows paths deeply for complete branch exploration
- **Real-time Algorithm Switching**: Choose the best algorithm for your use case

### 2. **Enhanced Keyword Extraction**
- **Smart Categorization**: Automatically identifies technical, business, and entity keywords
- **Advanced Filtering**: Extended stopword list removes noise and web-specific terms
- **Quality Scoring**: Evaluates content based on lexical diversity and entity presence
- **Domain Recognition**: Boosts scores for domain-specific terminology
- **Entity Extraction**: Identifies company names, products, and proper nouns

### 3. **Powerful Search System**
- **Fuzzy Search**: Tolerates typos and partial matches
- **Semantic Search**: Understands related terms and concepts
- **Boolean Search**: Requires all search terms to be present
- **Exact Search**: Precise keyword matching
- **Field Targeting**: Search specific fields (titles, URLs, keywords, content)
- **Content Quality Filtering**: Filter by content quality scores

### 4. **Advanced Data Structures**
- **Graph Representation**: Adjacency list for efficient link relationships
- **HashMap Indexing**: O(1) URL deduplication and fast lookups
- **Priority Scoring**: Advanced ranking algorithms for relevance

## 🛠️ Algorithm Comparison

### BFS (Breadth-First Search)
```
Benefits:
✅ Level-by-level exploration
✅ Finds pages close to starting URL
✅ Comprehensive site structure discovery
✅ Optimal for broad analysis

Best for: Site mapping, finding related content, discovering site structure
```

### DFS (Depth-First Search)
```
Benefits:
✅ Memory efficient for deep sites
✅ Finds deeply nested content
✅ Complete path exploration
✅ Good for following specific topics

Best for: Deep content discovery, following specific topics, technical documentation
```

## 🔍 Search Methods

| Method | Description | Use Case |
|--------|-------------|----------|
| **Fuzzy** | Partial matches, typo-tolerant | User-friendly general search |
| **Exact** | Precise keyword matching | Technical terms, API names |
| **Semantic** | Related terms and concepts | Content discovery, topic exploration |
| **Boolean** | All terms must be present | Precise filtering |

## 🏷️ Keyword Categories

### Technical Keywords
- Programming languages (JavaScript, Python, React)
- Frameworks and tools (Docker, AWS, API)
- Development concepts (microservices, DevOps)

### Business Keywords
- Company roles (CEO, CTO, sales, marketing)
- Commercial terms (revenue, enterprise, B2B)
- Industry concepts (SaaS, consulting, strategy)

### Named Entities
- Company names (Google, Microsoft, Apple)
- Product names (iPhone, Windows, React)
- Proper nouns and specific identifiers

## 📊 Quality Metrics

### Content Quality Score (0-100)
- **Length Score**: Optimal content length (100-2000 words)
- **Lexical Diversity**: Unique word ratio
- **Entity Density**: Named entity presence
- **Technical Depth**: Domain-specific terminology

### Search Relevance
- **Field Weighting**: Titles (3x), URLs (2x), Keywords (2.5x), Content (1x)
- **Frequency Scoring**: Word occurrence analysis
- **Semantic Matching**: Related term recognition

## 🎯 Use Cases

### 1. **Competitive Analysis**
```bash
Algorithm: BFS
Search: Semantic search for business keywords
Filter: High-quality content only
```

### 2. **Technical Documentation Discovery**
```bash
Algorithm: DFS
Search: Exact search for technical terms
Filter: Technical keyword category
```

### 3. **Content Strategy Research**
```bash
Algorithm: BFS
Search: Fuzzy search with content targeting
Filter: Entity extraction for brand mentions
```

## 🚀 Getting Started

1. **Choose Your Algorithm**: Select BFS for broad exploration or DFS for deep analysis
2. **Configure Search**: Set max depth (1-5) and page limit (5-500)
3. **Run Crawl**: Watch real-time progress with algorithm-specific traversal
4. **Analyze Results**: Use advanced search and filtering to find insights

## 📈 Performance Features

- **Real-time Updates**: Live crawl progress with streaming data
- **Memory Optimization**: Efficient graph structures and deduplication
- **Scalable Architecture**: Handles websites up to 500 pages
- **Quality Filtering**: Smart content scoring to focus on valuable pages

## 🔧 Technical Stack

- **Frontend**: Next.js 16, React, TypeScript
- **Algorithms**: Custom BFS/DFS implementations
- **Data Processing**: Advanced NLP for keyword extraction
- **Visualization**: Interactive graph and analytics dashboard
- **UI/UX**: Shadcn/ui components with responsive design

## 📚 Educational Value

This project demonstrates practical applications of:
- **Graph Theory**: Website structure as directed graphs
- **Search Algorithms**: BFS vs DFS trade-offs and use cases
- **Data Structures**: Hash maps, queues, stacks, and trees
- **Text Processing**: NLP techniques for keyword extraction
- **Algorithm Analysis**: Time/space complexity considerations

## 🎨 User Interface

- **Algorithm Selection**: Visual comparison of BFS vs DFS
- **Real-time Visualization**: Graph view of crawled websites
- **Advanced Search Panel**: Multiple search methods with filtering
- **Keyword Analysis**: Interactive demonstration of extraction algorithms
- **Analytics Dashboard**: Comprehensive crawl statistics and insights

---

**Built with ❤️ using Data Structures & Algorithms concepts**
