/**
 * PageBuilderService - Handles page building, templates, and content management
 */
import { createClient } from '@supabase/supabase-js';

export class PageBuilderService {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    this.cache = new Map();
    this.cacheTime = 3600000; // 1 hour cache time
  }

  // Site Management
  async getSites(userId) {
    try {
      const { data, error } = await this.supabase
        .from('sites')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching sites:', error);
      throw error;
    }
  }

  async createSite(siteData) {
    try {
      const { data, error } = await this.supabase
        .from('sites')
        .insert(siteData)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating site:', error);
      throw error;
    }
  }

  // Page Management
  async getPages(siteId) {
    const cacheKey = `pages_${siteId}`;
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < this.cacheTime) {
        return data;
      }
    }

    try {
      const { data, error } = await this.supabase
        .from('pages')
        .select('*')
        .eq('site_id', siteId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  }

  async getPageById(pageId) {
    const cacheKey = `page_${pageId}`;
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < this.cacheTime) {
        return data;
      }
    }

    try {
      const { data, error } = await this.supabase
        .from('pages')
        .select('*, revisions(*)')
        .eq('id', pageId)
        .single();
      
      if (error) throw error;
      
      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching page:', error);
      throw error;
    }
  }

  async createPage(pageData) {
    try {
      // Create initial revision
      const revision = {
        content: pageData.content,
        version: 1,
        created_at: new Date().toISOString()
      };

      // Create page without content
      const pageWithoutContent = { ...pageData };
      delete pageWithoutContent.content;
      
      const { data: page, error } = await this.supabase
        .from('pages')
        .insert(pageWithoutContent)
        .select()
        .single();
      
      if (error) throw error;

      // Add page_id to revision and save
      revision.page_id = page.id;
      
      const { error: revisionError } = await this.supabase
        .from('revisions')
        .insert(revision);
      
      if (revisionError) throw revisionError;

      // Update cache
      this.invalidateCache(`pages_${pageData.site_id}`);
      
      return page;
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  }

  async updatePage(pageId, pageData) {
    try {
      // Get current page to determine revision number
      const { data: currentPage } = await this.supabase
        .from('pages')
        .select('*, revisions(*)')
        .eq('id', pageId)
        .single();

      if (!currentPage) throw new Error('Page not found');

      // Create new revision
      const latestRevision = currentPage.revisions.reduce((latest, rev) => 
        rev.version > latest.version ? rev : latest, { version: 0 });
      
      const revision = {
        page_id: pageId,
        content: pageData.content,
        version: latestRevision.version + 1,
        created_at: new Date().toISOString()
      };

      // Store revision
      const { error: revisionError } = await this.supabase
        .from('revisions')
        .insert(revision);
      
      if (revisionError) throw revisionError;

      // Update page metadata
      const pageWithoutContent = { ...pageData };
      delete pageWithoutContent.content;
      
      const { data: page, error } = await this.supabase
        .from('pages')
        .update({
          ...pageWithoutContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', pageId)
        .select()
        .single();
      
      if (error) throw error;

      // Invalidate cache
      this.invalidateCache(`page_${pageId}`);
      this.invalidateCache(`pages_${page.site_id}`);
      
      return page;
    } catch (error) {
      console.error('Error updating page:', error);
      throw error;
    }
  }

  async restoreRevision(pageId, revisionId) {
    try {
      // Get the revision
      const { data: revision, error: revError } = await this.supabase
        .from('revisions')
        .select('*')
        .eq('id', revisionId)
        .single();
      
      if (revError) throw revError;

      // Get current page
      const { data: page, error: pageError } = await this.supabase
        .from('pages')
        .select('site_id')
        .eq('id', pageId)
        .single();
      
      if (pageError) throw pageError;

      // Create new revision with the content from the old one
      const { data: latestRevision, error: latestError } = await this.supabase
        .from('revisions')
        .select('*')
        .eq('page_id', pageId)
        .order('version', { ascending: false })
        .limit(1)
        .single();
        
      if (latestError) throw latestError;

      const newRevision = {
        page_id: pageId,
        content: revision.content,
        version: latestRevision.version + 1,
        created_at: new Date().toISOString(),
        restored_from: revisionId
      };

      const { error: saveError } = await this.supabase
        .from('revisions')
        .insert(newRevision);
      
      if (saveError) throw saveError;

      // Update page's updated_at
      const { error: updateError } = await this.supabase
        .from('pages')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', pageId);
      
      if (updateError) throw updateError;

      // Invalidate cache
      this.invalidateCache(`page_${pageId}`);
      this.invalidateCache(`pages_${page.site_id}`);
      
      return true;
    } catch (error) {
      console.error('Error restoring revision:', error);
      throw error;
    }
  }

  // Media Management
  async getMedia(siteId) {
    try {
      const { data, error } = await this.supabase
        .from('media')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching media:', error);
      throw error;
    }
  }

  async uploadMedia(file, siteId, userId) {
    try {
      // Upload file to storage
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `sites/${siteId}/${fileName}`;
      
      const { error: uploadError } = await this.supabase
        .storage
        .from('media')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = this.supabase
        .storage
        .from('media')
        .getPublicUrl(filePath);

      // Add record to media table
      const mediaRecord = {
        site_id: siteId,
        user_id: userId,
        name: file.name,
        type: file.type,
        size: file.size,
        path: filePath,
        url: publicUrl,
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('media')
        .insert(mediaRecord)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  }

  // E-commerce functions
  async getProducts(siteId, options = {}) {
    const { category, limit = 100, offset = 0, sort = 'created_at', order = 'desc' } = options;
    
    try {
      let query = this.supabase
        .from('products')
        .select('*, categories(*), variants(*), attributes(*)')
        .eq('site_id', siteId)
        .order(sort, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1);
      
      if (category) {
        query = query.eq('category_id', category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProductById(productId) {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          categories(*),
          variants(*),
          attributes(*),
          reviews(*)
        `)
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Backup functions
  async createBackup(siteId, name) {
    try {
      // Get all site data
      const [site, pages, products, media] = await Promise.all([
        this.supabase.from('sites').select('*').eq('id', siteId).single(),
        this.supabase.from('pages').select('*, revisions(*)').eq('site_id', siteId),
        this.supabase.from('products').select('*, variants(*), attributes(*)').eq('site_id', siteId),
        this.supabase.from('media').select('*').eq('site_id', siteId)
      ]);

      // Compile backup data
      const backupData = {
        site: site.data,
        pages: pages.data,
        products: products.data,
        media: media.data,
        created_at: new Date().toISOString(),
        name
      };

      // Store backup in storage
      const backupFileName = `backup_${siteId}_${Date.now()}.json`;
      const backupFilePath = `backups/${siteId}/${backupFileName}`;
      
      const { error: uploadError } = await this.supabase
        .storage
        .from('backups')
        .upload(backupFilePath, JSON.stringify(backupData));
      
      if (uploadError) throw uploadError;

      // Add backup record
      const { data, error } = await this.supabase
        .from('backups')
        .insert({
          site_id: siteId,
          name,
          file_path: backupFilePath,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  async restoreBackup(backupId) {
    try {
      // Get backup record
      const { data: backup, error: backupError } = await this.supabase
        .from('backups')
        .select('*')
        .eq('id', backupId)
        .single();
      
      if (backupError) throw backupError;

      // Download backup file
      const { data: backupFile, error: downloadError } = await this.supabase
        .storage
        .from('backups')
        .download(backup.file_path);
      
      if (downloadError) throw downloadError;

      // Parse backup data
      const backupData = JSON.parse(await backupFile.text());
      
      // Restore data (this would be quite complex in a real implementation)
      // For simplicity, we're just showing the concept
      
      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  }

  // Helper functions
  invalidateCache(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
  }

  clearCache() {
    this.cache.clear();
  }
}
