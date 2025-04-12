import React, { useRef, useEffect, useState } from 'react';
import { SVGDesigner, DarkTheme, LightTheme } from './Designer';
import { LocalizationService } from '../../services/LocalizationService';
import './DesignerComponent.css';

const localization = new LocalizationService();

const defaultWorkflow = {
  nodes: [
    {
      id: 'node-1',
      type: 'input',
      x: 100,
      y: 100,
      width: 150,
      height: 80,
      label: 'Input',
      outputs: [
        {
          id: 'out-1',
          type: 'default',
          position: 'right',
          label: 'Output'
        }
      ]
    },
    {
      id: 'node-2',
      type: 'process',
      x: 350,
      y: 100,
      width: 150,
      height: 80,
      label: 'Process',
      inputs: [
        {
          id: 'in-1',
          type: 'default',
          position: 'left',
          label: 'Input'
        }
      ],
      outputs: [
        {
          id: 'out-1',
          type: 'default',
          position: 'right',
          label: 'Output'
        }
      ]
    },
    {
      id: 'node-3',
      type: 'output',
      x: 600,
      y: 100,
      width: 150,
      height: 80,
      label: 'Output',
      inputs: [
        {
          id: 'in-1',
          type: 'default',
          position: 'left',
          label: 'Input'
        }
      ]
    }
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'node-1',
      sourcePort: 'out-1',
      target: 'node-2',
      targetPort: 'in-1',
      label: 'Data'
    },
    {
      id: 'edge-2',
      source: 'node-2',
      sourcePort: 'out-1',
      target: 'node-3',
      targetPort: 'in-1',
      label: 'Result'
    }
  ],
  viewport: {
    x: 0,
    y: 0,
    scale: 1
  }
};

export default function DesignerComponent({ 
  initialData = defaultWorkflow,
  onChange,
  readOnly = false,
  isLightTheme = false
}) {
  const containerRef = useRef(null);
  const designerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [designerData, setDesignerData] = useState(initialData);

  useEffect(() => {
    if (containerRef.current && !designerRef.current) {
      designerRef.current = new SVGDesigner(
        containerRef.current,
        initialData,
        { theme: isLightTheme ? LightTheme : DarkTheme }
      );

      designerRef.current.setCallbacks({
        onNodeSelected: (nodeId) => {
          const node = initialData.nodes.find(n => n.id === nodeId);
          setSelectedNode(node);
          setSelectedEdge(null);
        },
        onEdgeSelected: (edgeId) => {
          const edge = initialData.edges.find(e => e.id === edgeId);
          setSelectedEdge(edge);
          setSelectedNode(null);
        },
        onCanvasClick: () => {
          setSelectedNode(null);
          setSelectedEdge(null);
        },
        onChange: (data) => {
          setDesignerData(data);
          if (onChange) {
            onChange(data);
          }
        }
      });
    }

    return () => {
      // Clean up if needed
    };
  }, []);

  useEffect(() => {
    if (designerRef.current) {
      designerRef.current.setTheme(isLightTheme ? LightTheme : DarkTheme);
    }
  }, [isLightTheme]);

  const handleAddNode = () => {
    if (designerRef.current) {
      const newNode = {
        id: `node-${Date.now()}`,
        type: 'process',
        x: 250,
        y: 250,
        width: 150,
        height: 80,
        label: localization.t('newNode') || 'New Node',
        inputs: [
          {
            id: `in-${Date.now()}`,
            type: 'default',
            position: 'left',
            label: localization.t('input') || 'Input'
          }
        ],
        outputs: [
          {
            id: `out-${Date.now()}`,
            type: 'default',
            position: 'right',
            label: localization.t('output') || 'Output'
          }
        ]
      };
      designerRef.current.addNode(newNode);
    }
  };

  const handleRemoveSelected = () => {
    if (designerRef.current) {
      if (selectedNode) {
        designerRef.current.removeNode(selectedNode.id);
        setSelectedNode(null);
      } else if (selectedEdge) {
        designerRef.current.removeEdge(selectedEdge.id);
        setSelectedEdge(null);
      }
    }
  };

  const handleZoomIn = () => {
    if (designerRef.current) {
      designerRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (designerRef.current) {
      designerRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (designerRef.current) {
      designerRef.current.resetZoom();
      designerRef.current.centerView();
    }
  };

  const handleExportJSON = () => {
    if (designerRef.current) {
      const data = designerRef.current.getData();
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'workflow.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="designer-component">
      {!readOnly && (
        <div className="designer-toolbar">
          <button onClick={handleAddNode} title={localization.t('addNode') || "Add Node"}>
            ➕ {localization.t('node') || "Node"}
          </button>
          <button 
            onClick={handleRemoveSelected} 
            disabled={!selectedNode && !selectedEdge}
            title={localization.t('delete') || "Delete"}
          >
            🗑️
          </button>
          <div className="toolbar-separator"></div>
          <button onClick={handleZoomIn} title={localization.t('zoomIn') || "Zoom In"}>🔍+</button>
          <button onClick={handleZoomOut} title={localization.t('zoomOut') || "Zoom Out"}>🔍-</button>
          <button onClick={handleResetView} title={localization.t('resetView') || "Reset View"}>🏠</button>
          <div className="toolbar-separator"></div>
          <button onClick={handleExportJSON} title={localization.t('exportJSON') || "Export JSON"}>
            💾 JSON
          </button>
        </div>
      )}
      
      <div className="designer-container" ref={containerRef}></div>
      
      {(selectedNode || selectedEdge) && !readOnly && (
        <div className="designer-properties">
          <h3>{localization.t('properties') || "Properties"}</h3>
          {selectedNode && (
            <div className="node-properties">
              <div className="property-group">
                <label>{localization.t('nodeId') || "ID"}</label>
                <div className="property-value">{selectedNode.id}</div>
              </div>
              <div className="property-group">
                <label>{localization.t('nodeType') || "Type"}</label>
                <div className="property-value">{selectedNode.type}</div>
              </div>
              <div className="property-group">
                <label>{localization.t('nodeLabel') || "Label"}</label>
                <input 
                  type="text" 
                  value={selectedNode.label} 
                  onChange={(e) => {
                    const updatedData = JSON.parse(JSON.stringify(designerData));
                    const node = updatedData.nodes.find(n => n.id === selectedNode.id);
                    if (node) {
                      node.label = e.target.value;
                      designerRef.current.setData(updatedData);
                    }
                  }}
                />
              </div>
            </div>
          )}
          
          {selectedEdge && (
            <div className="edge-properties">
              <div className="property-group">
                <label>{localization.t('edgeId') || "ID"}</label>
                <div className="property-value">{selectedEdge.id}</div>
              </div>
              <div className="property-group">
                <label>{localization.t('edgeLabel') || "Label"}</label>
                <input 
                  type="text" 
                  value={selectedEdge.label || ''} 
                  onChange={(e) => {
                    const updatedData = JSON.parse(JSON.stringify(designerData));
                    const edge = updatedData.edges.find(n => n.id === selectedEdge.id);
                    if (edge) {
                      edge.label = e.target.value;
                      designerRef.current.setData(updatedData);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
