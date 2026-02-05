import { createLogger } from './logger';
import https from 'https';
import http from 'http';

const logger = createLogger('WebSearch');

/**
 * 搜索结果条目
 */
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

/**
 * 搜索响应
 */
export interface SearchResponse {
  success: boolean;
  query: string;
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  error?: string;
}

/**
 * DuckDuckGo Instant Answer 响应
 */
interface DuckDuckGoResponse {
  Abstract?: string;
  AbstractText?: string;
  AbstractSource?: string;
  AbstractURL?: string;
  Image?: string;
  Heading?: string;
  Answer?: string;
  AnswerType?: string;
  Definition?: string;
  DefinitionSource?: string;
  DefinitionURL?: string;
  RelatedTopics?: Array<{
    FirstURL?: string;
    Text?: string;
    Result?: string;
    Icon?: { URL?: string };
  }>;
  Results?: Array<{
    FirstURL?: string;
    Text?: string;
    Result?: string;
  }>;
  Type?: string;
  Redirect?: string;
}

/**
 * 互联网搜索服务
 * 使用 DuckDuckGo Instant Answer API (免费，无需 API Key)
 */
export class WebSearchService {
  private readonly DDG_API_URL = 'https://api.duckduckgo.com/';
  
  constructor() {
    logger.info('WebSearchService initialized');
  }

  /**
   * 执行互联网搜索
   */
  public async search(query: string, maxResults: number = 10): Promise<SearchResponse> {
    const startTime = Date.now();
    
    logger.info('Performing web search', { query, maxResults });

    try {
      // 使用 DuckDuckGo Instant Answer API
      const ddgResults = await this.searchDuckDuckGo(query);
      
      // 如果 DuckDuckGo 没有返回足够结果，尝试使用备用方法
      let results = ddgResults;
      
      if (results.length < maxResults) {
        // 添加一些相关搜索建议
        const suggestions = this.generateSearchSuggestions(query);
        results = [...results, ...suggestions].slice(0, maxResults);
      }

      const searchTime = Date.now() - startTime;
      
      logger.info('Search completed', { 
        query, 
        resultCount: results.length, 
        searchTime 
      });

      return {
        success: true,
        query,
        results: results.slice(0, maxResults),
        totalResults: results.length,
        searchTime
      };

    } catch (error: any) {
      logger.error('Search failed', { query, error: error.message });
      
      return {
        success: false,
        query,
        results: [],
        totalResults: 0,
        searchTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * 使用 DuckDuckGo Instant Answer API 搜索
   */
  private async searchDuckDuckGo(query: string): Promise<SearchResult[]> {
    return new Promise((resolve, reject) => {
      const encodedQuery = encodeURIComponent(query);
      const url = `${this.DDG_API_URL}?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`;
      
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response: DuckDuckGoResponse = JSON.parse(data);
            const results = this.parseDuckDuckGoResponse(response, query);
            resolve(results);
          } catch (parseError: any) {
            logger.error('Failed to parse DuckDuckGo response', { error: parseError.message });
            resolve([]);
          }
        });
      }).on('error', (error) => {
        logger.error('DuckDuckGo API request failed', { error: error.message });
        resolve([]);
      });
    });
  }

  /**
   * 解析 DuckDuckGo 响应
   */
  private parseDuckDuckGoResponse(response: DuckDuckGoResponse, query: string): SearchResult[] {
    const results: SearchResult[] = [];

    // 1. 添加 Abstract (摘要)
    if (response.AbstractText && response.AbstractURL) {
      results.push({
        title: response.Heading || query,
        url: response.AbstractURL,
        snippet: response.AbstractText,
        source: response.AbstractSource || 'DuckDuckGo'
      });
    }

    // 2. 添加 Answer (直接答案)
    if (response.Answer) {
      results.push({
        title: `Answer: ${query}`,
        url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        snippet: response.Answer,
        source: 'DuckDuckGo Instant Answer'
      });
    }

    // 3. 添加 Definition (定义)
    if (response.Definition && response.DefinitionURL) {
      results.push({
        title: `Definition: ${query}`,
        url: response.DefinitionURL,
        snippet: response.Definition,
        source: response.DefinitionSource || 'Dictionary'
      });
    }

    // 4. 添加 Related Topics (相关主题)
    if (response.RelatedTopics && Array.isArray(response.RelatedTopics)) {
      for (const topic of response.RelatedTopics) {
        if (topic.FirstURL && topic.Text) {
          results.push({
            title: this.extractTitleFromText(topic.Text),
            url: topic.FirstURL,
            snippet: topic.Text,
            source: 'DuckDuckGo Related'
          });
        }
        
        // 处理嵌套的 Topics
        if ((topic as any).Topics && Array.isArray((topic as any).Topics)) {
          for (const subTopic of (topic as any).Topics) {
            if (subTopic.FirstURL && subTopic.Text) {
              results.push({
                title: this.extractTitleFromText(subTopic.Text),
                url: subTopic.FirstURL,
                snippet: subTopic.Text,
                source: 'DuckDuckGo Related'
              });
            }
          }
        }
      }
    }

    // 5. 添加 Results (直接结果)
    if (response.Results && Array.isArray(response.Results)) {
      for (const result of response.Results) {
        if (result.FirstURL && result.Text) {
          results.push({
            title: this.extractTitleFromText(result.Text),
            url: result.FirstURL,
            snippet: result.Text,
            source: 'DuckDuckGo Results'
          });
        }
      }
    }

    // 6. 处理重定向
    if (response.Redirect) {
      results.push({
        title: `Redirect: ${query}`,
        url: response.Redirect,
        snippet: `Redirecting to ${response.Redirect}`,
        source: 'DuckDuckGo Redirect'
      });
    }

    return results;
  }

  /**
   * 从文本中提取标题
   */
  private extractTitleFromText(text: string): string {
    // 尝试提取第一个句子或前50个字符作为标题
    const firstSentence = text.split(/[.!?]/)[0];
    if (firstSentence.length <= 80) {
      return firstSentence;
    }
    return text.substring(0, 77) + '...';
  }

  /**
   * 生成搜索建议 (当 API 结果不足时)
   */
  private generateSearchSuggestions(query: string): SearchResult[] {
    const suggestions: SearchResult[] = [
      {
        title: `Search "${query}" on Google`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Click to search "${query}" on Google for more comprehensive results.`,
        source: 'Google Search'
      },
      {
        title: `Search "${query}" on Bing`,
        url: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Click to search "${query}" on Bing for alternative results.`,
        source: 'Bing Search'
      },
      {
        title: `Search "${query}" on Wikipedia`,
        url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
        snippet: `Search for "${query}" on Wikipedia for encyclopedic information.`,
        source: 'Wikipedia'
      },
      {
        title: `Search "${query}" on GitHub`,
        url: `https://github.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Search for "${query}" related code and repositories on GitHub.`,
        source: 'GitHub'
      },
      {
        title: `Search "${query}" on Stack Overflow`,
        url: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Search for "${query}" related programming questions and answers.`,
        source: 'Stack Overflow'
      }
    ];

    return suggestions;
  }

  /**
   * 获取搜索历史 (可扩展为持久化)
   */
  private searchHistory: Array<{ query: string; timestamp: Date; resultCount: number }> = [];

  public recordSearch(query: string, resultCount: number): void {
    this.searchHistory.unshift({
      query,
      timestamp: new Date(),
      resultCount
    });
    
    // 保留最近 100 条搜索记录
    if (this.searchHistory.length > 100) {
      this.searchHistory = this.searchHistory.slice(0, 100);
    }
  }

  public getSearchHistory(limit: number = 20): Array<{ query: string; timestamp: Date; resultCount: number }> {
    return this.searchHistory.slice(0, limit);
  }
}

// 导出单例
export const webSearchService = new WebSearchService();
