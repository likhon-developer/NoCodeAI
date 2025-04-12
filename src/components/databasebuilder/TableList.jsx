import React, { useState } from 'react';
import './DatabaseBuilder.css';

const TableList = ({ 
  tables, 
  selectedTable, 
  onSelectTable, 
  onCreateTable, 
  onDeleteTable, 
  onRenameTable,
  loading 
}) => {
  const [newTableName, setNewTableName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingTableId, setEditingTableId] = useState(null);
  const [editingTableName, setEditingTableName] = useState('');

  const handleCreateTable = async (e) => {
    e.preventDefault();
    
    if (!newTableName.trim()) return;
    
    try {
      await onCreateTable(newTableName);
      setNewTableName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create table:', error);
    }
  };

  const handleStartRename = (table) => {
    setEditingTableId(table.id);
    setEditingTableName(table.name);
  };

  const handleRenameTable = async (e, tableId) => {
    e.preventDefault();
    
    if (!editingTableName.trim()) return;
    
    try {
      await onRenameTable(tableId, editingTableName);
      setEditingTableId(null);
      setEditingTableName('');
    } catch (error) {
      console.error('Failed to rename table:', error);
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (window.confirm('Are you sure you want to delete this table? This action cannot be undone.')) {
      try {
        await onDeleteTable(tableId);
      } catch (error) {
        console.error('Failed to delete table:', error);
      }
    }
  };

  return (
    <div className="table-list">
      <div className="table-list-header">
        <h3>Tables</h3>
        <button 
          className="btn-add" 
          onClick={() => setIsCreating(true)}
          disabled={loading}
        >
          +
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateTable} className="new-table-form">
          <input
            type="text"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            placeholder="Table name"
            autoFocus
          />
          <div className="form-actions">
            <button type="submit" disabled={!newTableName.trim() || loading}>Create</button>
            <button 
              type="button" 
              onClick={() => {
                setIsCreating(false);
                setNewTableName('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="table-list-items">
        {loading && tables.length === 0 ? (
          <li className="loading">Loading tables...</li>
        ) : tables.length === 0 ? (
          <li className="empty">No tables yet</li>
        ) : (
          tables.map(table => (
            <li 
              key={table.id}
              className={selectedTable && selectedTable.id === table.id ? 'selected' : ''}
            >
              {editingTableId === table.id ? (
                <form onSubmit={(e) => handleRenameTable(e, table.id)}>
                  <input
                    type="text"
                    value={editingTableName}
                    onChange={(e) => setEditingTableName(e.target.value)}
                    autoFocus
                  />
                  <div className="form-actions">
                    <button type="submit" disabled={!editingTableName.trim() || loading}>Save</button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingTableId(null);
                        setEditingTableName('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div 
                    className="table-name" 
                    onClick={() => onSelectTable(table)}
                  >
                    {table.name}
                  </div>
                  
                  <div className="table-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => handleStartRename(table)}
                      disabled={loading}
                    >
                      <span className="icon">✎</span>
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDeleteTable(table.id)}
                      disabled={loading}
                    >
                      <span className="icon">🗑</span>
                    </button>
                  </div>
                </>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default TableList;
