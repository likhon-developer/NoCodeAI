import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/DatabaseService';
import TableList from './TableList';
import TableView from './TableView';
import ViewSelector from './ViewSelector';
import FieldDialog from './FieldDialog';
import './DatabaseBuilder.css';

const DatabaseBuilder = ({ baseId, userId }) => {
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedView, setSelectedView] = useState(null);
  const [views, setViews] = useState([]);
  const [records, setRecords] = useState([]);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [error, setError] = useState(null);
  
  const databaseService = new DatabaseService();
  
  // Load tables when component mounts
  useEffect(() => {
    if (baseId) {
      loadTables();
    }
  }, [baseId]);
  
  // Load views when selected table changes
  useEffect(() => {
    if (selectedTable) {
      loadViews();
      setSelectedView(null);
      setRecords([]);
    }
  }, [selectedTable]);
  
  // Load records when selected view changes
  useEffect(() => {
    if (selectedTable && selectedView) {
      loadRecords();
    }
  }, [selectedView]);
  
  const loadTables = async () => {
    try {
      setLoading(true);
      const tablesData = await databaseService.getTables(baseId);
      setTables(tablesData);
      
      // Select the first table by default if available
      if (tablesData.length > 0 && !selectedTable) {
        setSelectedTable(tablesData[0]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading tables:', err);
      setError('Failed to load tables. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const loadViews = async () => {
    try {
      setLoading(true);
      const viewsData = await databaseService.getViews(selectedTable.id);
      setViews(viewsData);
      
      // Select the first view by default if available
      if (viewsData.length > 0) {
        setSelectedView(viewsData[0]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading views:', err);
      setError('Failed to load views. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const loadRecords = async () => {
    try {
      setLoading(true);
      const recordsData = await databaseService.getRecords(
        selectedTable.id,
        selectedView.id,
        { page: 1, pageSize: 100 }
      );
      setRecords(recordsData);
      setError(null);
    } catch (err) {
      console.error('Error loading records:', err);
      setError('Failed to load records. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateTable = async (tableName) => {
    try {
      const newTable = await databaseService.createTable({
        base_id: baseId,
        name: tableName,
        description: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: userId
      });
      
      // Create default ID field
      await databaseService.createField({
        table_id: newTable.id,
        name: 'ID',
        type: 'id',
        options: { isPrimaryKey: true, isSystem: true },
        is_required: true,
        is_unique: true,
        is_hidden: false,
        position: 0
      });
      
      // Refresh tables
      await loadTables();
      
      // Select the newly created table
      setSelectedTable(newTable);
      
      return newTable;
    } catch (err) {
      console.error('Error creating table:', err);
      setError('Failed to create table. Please try again.');
      throw err;
    }
  };
  
  const handleDeleteTable = async (tableId) => {
    try {
      await databaseService.deleteTable(tableId);
      
      // Refresh tables
      await loadTables();
      
      // If the deleted table was selected, clear selection
      if (selectedTable && selectedTable.id === tableId) {
        setSelectedTable(null);
        setSelectedView(null);
        setViews([]);
        setRecords([]);
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting table:', err);
      setError('Failed to delete table. Please try again.');
      throw err;
    }
  };
  
  const handleRenameTable = async (tableId, newName) => {
    try {
      const updatedTable = await databaseService.updateTable(tableId, {
        name: newName
      });
      
      // Refresh tables
      await loadTables();
      
      // Update selected table if it was renamed
      if (selectedTable && selectedTable.id === tableId) {
        setSelectedTable(updatedTable);
      }
      
      return updatedTable;
    } catch (err) {
      console.error('Error renaming table:', err);
      setError('Failed to rename table. Please try again.');
      throw err;
    }
  };
  
  const handleCreateView = async (viewData) => {
    try {
      const newView = await databaseService.createView({
        table_id: selectedTable.id,
        ...viewData
      });
      
      // Refresh views
      await loadViews();
      
      // Select the newly created view
      setSelectedView(newView);
      
      return newView;
    } catch (err) {
      console.error('Error creating view:', err);
      setError('Failed to create view. Please try again.');
      throw err;
    }
  };
  
  const handleDeleteView = async (viewId) => {
    try {
      // Check if this is the only view
      if (views.length <= 1) {
        setError("Cannot delete the only view. Tables must have at least one view.");
        return false;
      }
      
      await databaseService.deleteView(viewId);
      
      // Refresh views
      await loadViews();
      
      // If the deleted view was selected, clear selection
      if (selectedView && selectedView.id === viewId) {
        setSelectedView(null);
        setRecords([]);
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting view:', err);
      setError('Failed to delete view. Please try again.');
      throw err;
    }
  };
  
  const handleUpdateView = async (viewId, viewData) => {
    try {
      const updatedView = await databaseService.updateView(viewId, viewData);
      
      // Refresh views
      await loadViews();
      
      // Update selected view if it was updated
      if (selectedView && selectedView.id === viewId) {
        setSelectedView(updatedView);
        
        // Reload records if we updated filters or sorts
        if (viewData.filters || viewData.sorts) {
          await loadRecords();
        }
      }
      
      return updatedView;
    } catch (err) {
      console.error('Error updating view:', err);
      setError('Failed to update view. Please try again.');
      throw err;
    }
  };
  
  const handleCreateField = (field = null) => {
    setEditingField(field);
    setIsFieldDialogOpen(true);
  };
  
  const handleSaveField = async (fieldData) => {
    try {
      if (editingField && editingField.id) {
        // Update existing field
        await databaseService.updateField(editingField.id, fieldData);
      } else {
        // Create new field
        await databaseService.createField({
          table_id: selectedTable.id,
          ...fieldData
        });
      }
      
      // Close dialog
      setIsFieldDialogOpen(false);
      setEditingField(null);
      
      // Reload records to reflect the new/updated field
      await loadRecords();
      
      return true;
    } catch (err) {
      console.error('Error saving field:', err);
      setError('Failed to save field. Please try again.');
      return false;
    }
  };
  
  const handleDeleteField = async (fieldId) => {
    try {
      await databaseService.deleteField(fieldId);
      
      // Reload records to reflect the deleted field
      await loadRecords();
      
      return true;
    } catch (err) {
      console.error('Error deleting field:', err);
      setError('Failed to delete field. Please try again.');
      return false;
    }
  };
  
  const handleCreateRecord = async (recordData) => {
    try {
      await databaseService.createRecord({
        table_id: selectedTable.id,
        ...recordData
      });
      
      // Reload records
      await loadRecords();
      
      return true;
    } catch (err) {
      console.error('Error creating record:', err);
      setError('Failed to create record. Please try again.');
      return false;
    }
  };
  
  const handleUpdateRecord = async (recordId, recordData) => {
    try {
      await databaseService.updateRecord(recordId, recordData);
      
      // Reload records
      await loadRecords();
      
      return true;
    } catch (err) {
      console.error('Error updating record:', err);
      setError('Failed to update record. Please try again.');
      return false;
    }
  };
  
  const handleDeleteRecord = async (recordId) => {
    try {
      await databaseService.deleteRecord(recordId);
      
      // Reload records
      await loadRecords();
      
      return true;
    } catch (err) {
      console.error('Error deleting record:', err);
      setError('Failed to delete record. Please try again.');
      return false;
    }
  };
  
  return (
    <div className="database-builder">
      <div className="database-sidebar">
        <TableList 
          tables={tables} 
          selectedTable={selectedTable}
          onSelectTable={setSelectedTable}
          onCreateTable={handleCreateTable}
          onDeleteTable={handleDeleteTable}
          onRenameTable={handleRenameTable}
          loading={loading}
        />
      </div>
      
      <div className="database-content">
        {selectedTable ? (
          <>
            <div className="database-header">
              <h2>{selectedTable.name}</h2>
              
              <ViewSelector 
                views={views}
                selectedView={selectedView}
                onSelectView={setSelectedView}
                onCreateView={handleCreateView}
                onUpdateView={handleUpdateView}
                onDeleteView={handleDeleteView}
              />
              
              <button 
                className="btn-add-field" 
                onClick={() => handleCreateField()}
              >
                Add Field
              </button>
            </div>
            
            {selectedView && (
              <TableView 
                table={selectedTable}
                view={selectedView}
                records={records}
                onCreateRecord={handleCreateRecord}
                onUpdateRecord={handleUpdateRecord}
                onDeleteRecord={handleDeleteRecord}
                onEditField={handleCreateField}
                onDeleteField={handleDeleteField}
                loading={loading}
              />
            )}
          </>
        ) : (
          <div className="empty-state">
            <h3>No table selected</h3>
            <p>Select a table from the sidebar or create a new one to get started.</p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      {isFieldDialogOpen && (
        <FieldDialog 
          field={editingField}
          onSave={handleSaveField}
          onCancel={() => {
            setIsFieldDialogOpen(false);
            setEditingField(null);
          }}
        />
      )}
    </div>
  );
};

export default DatabaseBuilder;
