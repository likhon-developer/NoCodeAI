import { createClient } from '@supabase/supabase-js';

export class DatabaseService {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    this.cache = new Map();
    this.cacheTime = 300000; // 5 minute cache
  }

  // Base operations
  async getBases(userId) {
    try {
      const { data, error } = await this.supabase
        .from('bases')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching bases:', error);
      throw error;
    }
  }

  async createBase(baseData) {
    try {
      const { data, error } = await this.supabase
        .from('bases')
        .insert(baseData)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating base:', error);
      throw error;
    }
  }

  async getBaseById(baseId) {
    try {
      const { data, error } = await this.supabase
        .from('bases')
        .select('*')
        .eq('id', baseId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching base:', error);
      throw error;
    }
  }

  // Table operations
  async getTables(baseId) {
    const cacheKey = `tables_${baseId}`;
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < this.cacheTime) {
        return data;
      }
    }

    try {
      const { data, error } = await this.supabase
        .from('tables')
        .select('*')
        .eq('base_id', baseId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
  }

  async createTable(tableData) {
    try {
      // Create the table record
      const { data, error } = await this.supabase
        .from('tables')
        .insert(tableData)
        .select();
      
      if (error) throw error;
      
      // Create the default grid view for this table
      const viewData = {
        table_id: data[0].id,
        name: 'Grid View',
        type: 'grid',
        filters: [],
        sorts: [],
        is_locked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: viewError } = await this.supabase
        .from('views')
        .insert(viewData);
      
      if (viewError) throw viewError;
      
      // Invalidate cache
      this.invalidateCache(`tables_${tableData.base_id}`);
      
      return data[0];
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    }
  }

  async updateTable(tableId, tableData) {
    try {
      const { data, error } = await this.supabase
        .from('tables')
        .update({
          ...tableData,
          updated_at: new Date().toISOString()
        })
        .eq('id', tableId)
        .select();
      
      if (error) throw error;
      
      // Invalidate cache
      this.invalidateCache(`tables_${data[0].base_id}`);
      
      return data[0];
    } catch (error) {
      console.error('Error updating table:', error);
      throw error;
    }
  }

  async deleteTable(tableId) {
    try {
      // Get the table to know which base it belongs to
      const { data: table, error: tableError } = await this.supabase
        .from('tables')
        .select('base_id')
        .eq('id', tableId)
        .single();
      
      if (tableError) throw tableError;
      
      // Delete all views first (foreign key constraint)
      const { error: viewsError } = await this.supabase
        .from('views')
        .delete()
        .eq('table_id', tableId);
      
      if (viewsError) throw viewsError;
      
      // Delete all fields (foreign key constraint)
      const { error: fieldsError } = await this.supabase
        .from('fields')
        .delete()
        .eq('table_id', tableId);
      
      if (fieldsError) throw fieldsError;
      
      // Delete all records (foreign key constraint)
      const { error: recordsError } = await this.supabase
        .from('records')
        .delete()
        .eq('table_id', tableId);
      
      if (recordsError) throw recordsError;
      
      // Finally delete the table
      const { error } = await this.supabase
        .from('tables')
        .delete()
        .eq('id', tableId);
      
      if (error) throw error;
      
      // Invalidate cache
      this.invalidateCache(`tables_${table.base_id}`);
      
      return true;
    } catch (error) {
      console.error('Error deleting table:', error);
      throw error;
    }
  }

  // Field operations
  async getFields(tableId) {
    const cacheKey = `fields_${tableId}`;
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < this.cacheTime) {
        return data;
      }
    }

    try {
      const { data, error } = await this.supabase
        .from('fields')
        .select('*')
        .eq('table_id', tableId)
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching fields:', error);
      throw error;
    }
  }

  async createField(fieldData) {
    try {
      // Get the current max position for proper ordering
      const { data: fields, error: fieldsError } = await this.supabase
        .from('fields')
        .select('position')
        .eq('table_id', fieldData.table_id)
        .order('position', { ascending: false })
        .limit(1);
      
      if (fieldsError) throw fieldsError;
      
      const position = fields.length > 0 ? fields[0].position + 1 : 0;
      
      // Create the field
      const { data, error } = await this.supabase
        .from('fields')
        .insert({
          ...fieldData,
          position,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      
      // Invalidate cache
      this.invalidateCache(`fields_${fieldData.table_id}`);
      
      return data[0];
    } catch (error) {
      console.error('Error creating field:', error);
      throw error;
    }
  }

  async updateField(fieldId, fieldData) {
    try {
      const { data, error } = await this.supabase
        .from('fields')
        .update({
          ...fieldData,
          updated_at: new Date().toISOString()
        })
        .eq('id', fieldId)
        .select();
      
      if (error) throw error;
      
      // Invalidate cache
      this.invalidateCache(`fields_${data[0].table_id}`);
      
      return data[0];
    } catch (error) {
      console.error('Error updating field:', error);
      throw error;
    }
  }

  async deleteField(fieldId) {
    try {
      // Get the field to know which table it belongs to
      const { data: field, error: fieldError } = await this.supabase
        .from('fields')
        .select('table_id')
        .eq('id', fieldId)
        .single();
      
      if (fieldError) throw fieldError;
      
      // Delete the field
      const { error } = await this.supabase
        .from('fields')
        .delete()
        .eq('id', fieldId);
      
      if (error) throw error;
      
      // Invalidate cache
      this.invalidateCache(`fields_${field.table_id}`);
      
      return true;
    } catch (error) {
      console.error('Error deleting field:', error);
      throw error;
    }
  }

  // Record operations
  async getRecords(tableId, viewId = null, options = {}) {
    try {
      let query = this.supabase
        .from('records')
        .select('*')
        .eq('table_id', tableId);
      
      // Apply view filters if a view is specified
      if (viewId) {
        // Get the view first to get its filters and sorts
        const { data: view, error: viewError } = await this.supabase
          .from('views')
          .select('*')
          .eq('id', viewId)
          .single();
        
        if (viewError) throw viewError;
        
        // Apply filters
        if (view.filters && view.filters.length > 0) {
          view.filters.forEach(filter => {
            const { field, operator, value } = filter;
            
            switch (operator) {
              case 'eq':
                query = query.eq(field, value);
                break;
              case 'neq':
                query = query.neq(field, value);
                break;
              case 'gt':
                query = query.gt(field, value);
                break;
              case 'lt':
                query = query.lt(field, value);
                break;
              case 'gte':
                query = query.gte(field, value);
                break;
              case 'lte':
                query = query.lte(field, value);
                break;
              case 'like':
                query = query.like(field, `%${value}%`);
                break;
              case 'ilike':
                query = query.ilike(field, `%${value}%`);
                break;
              default:
                break;
            }
          });
        }
        
        // Apply sorts
        if (view.sorts && view.sorts.length > 0) {
          view.sorts.forEach(sort => {
            query = query.order(sort.field, { ascending: sort.direction === 'asc' });
          });
        }
      }
      
      // Apply pagination
      if (options.page && options.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching records:', error);
      throw error;
    }
  }

  async createRecord(recordData) {
    try {
      const { data, error } = await this.supabase
        .from('records')
        .insert({
          ...recordData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating record:', error);
      throw error;
    }
  }

  async updateRecord(recordId, recordData) {
    try {
      const { data, error } = await this.supabase
        .from('records')
        .update({
          ...recordData,
          updated_at: new Date().toISOString()
        })
        .eq('id', recordId)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating record:', error);
      throw error;
    }
  }

  async deleteRecord(recordId) {
    try {
      const { error } = await this.supabase
        .from('records')
        .delete()
        .eq('id', recordId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting record:', error);
      throw error;
    }
  }

  // View operations
  async getViews(tableId) {
    try {
      const { data, error } = await this.supabase
        .from('views')
        .select('*')
        .eq('table_id', tableId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching views:', error);
      throw error;
    }
  }

  async createView(viewData) {
    try {
      const { data, error } = await this.supabase
        .from('views')
        .insert({
          ...viewData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating view:', error);
      throw error;
    }
  }

  async updateView(viewId, viewData) {
    try {
      const { data, error } = await this.supabase
        .from('views')
        .update({
          ...viewData,
          updated_at: new Date().toISOString()
        })
        .eq('id', viewId)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating view:', error);
      throw error;
    }
  }

  async deleteView(viewId) {
    try {
      const { error } = await this.supabase
        .from('views')
        .delete()
        .eq('id', viewId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting view:', error);
      throw error;
    }
  }

  // Share operations
  async createShare(shareData) {
    try {
      const { data, error } = await this.supabase
        .from('shares')
        .insert({
          ...shareData,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating share:', error);
      throw error;
    }
  }

  async getShareByToken(token) {
    try {
      const { data, error } = await this.supabase
        .from('shares')
        .select('*')
        .eq('token', token)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching share:', error);
      throw error;
    }
  }

  async deleteShare(shareId) {
    try {
      const { error } = await this.supabase
        .from('shares')
        .delete()
        .eq('id', shareId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting share:', error);
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
