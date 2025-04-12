import { createClient } from '@supabase/supabase-js';

export class VectorDBService {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  async storeEmbedding(content, metadata = {}, namespace = 'general') {
    try {
      // First, get an embedding from OpenRouter
      const embeddingResponse = await fetch('https://openrouter.ai/api/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nocodeai.app',
          'X-Title': 'NoCode AI'
        },
        body: JSON.stringify({
          model: 'openai/text-embedding-ada-002',
          input: content
        })
      });

      const { data } = await embeddingResponse.json();
      const embedding = data[0].embedding;

      // Store in Supabase
      const { data: insertResult, error } = await this.supabase
        .from('embeddings')
        .insert({
          content,
          embedding,
          metadata,
          namespace
        });

      if (error) throw new Error(`Error storing embedding: ${error.message}`);
      return insertResult;
    } catch (error) {
      console.error('Error in vector DB service:', error);
      throw error;
    }
  }

  async searchSimilar(query, namespace = 'general', limit = 5) {
    try {
      // Get embedding for the query
      const embeddingResponse = await fetch('https://openrouter.ai/api/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nocodeai.app',
          'X-Title': 'NoCode AI'
        },
        body: JSON.stringify({
          model: 'openai/text-embedding-ada-002',
          input: query
        })
      });

      const { data } = await embeddingResponse.json();
      const embedding = data[0].embedding;

      // Search for similar embeddings
      const { data: searchResults, error } = await this.supabase
        .rpc('match_embeddings', {
          query_embedding: embedding,
          match_threshold: 0.7,
          match_count: limit,
          filter_namespace: namespace
        });

      if (error) throw new Error(`Error searching embeddings: ${error.message}`);
      return searchResults;
    } catch (error) {
      console.error('Error in vector search:', error);
      throw error;
    }
  }
}
