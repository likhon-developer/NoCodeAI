import React from 'react';
import './SecondaryPanel.css';

export default function SecondaryPanel() {
  return (
    <div className="secondary-panel">
      <div className="panel-header">
        <h3>AI Model Debugger</h3>
      </div>
      <div className="panel-content">
        <div className="debug-info">
          <h4>Model Performance</h4>
          <p>Accuracy: 92%</p>
          <p>Latency: 120ms</p>
        </div>
        <div className="code-tree">
          <h4>Visual Workflow</h4>
          <div className="tree-node">Input Layer</div>
          <div className="tree-node">Hidden Layer (128 nodes)</div>
          <div className="tree-node">Output Layer</div>
        </div>
      </div>
    </div>
  );
}
