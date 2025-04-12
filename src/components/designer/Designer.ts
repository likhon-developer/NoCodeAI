/**
 * SVGDesigner - A pure TypeScript SVG-based designer with zero external dependencies
 * Supports workflow, diagram, and visual programming applications
 */

export type NodeData = {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  data?: Record<string, any>;
  inputs?: PortData[];
  outputs?: PortData[];
};

export type PortData = {
  id: string;
  type: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  label?: string;
};

export type EdgeData = {
  id: string;
  source: string;
  sourcePort?: string;
  target: string;
  targetPort?: string;
  points?: Array<{ x: number; y: number }>;
  label?: string;
};

export type DesignerData = {
  nodes: NodeData[];
  edges: EdgeData[];
  viewport: {
    x: number;
    y: number;
    scale: number;
  };
};

export type ThemeConfig = {
  background: string;
  grid: string;
  node: {
    fill: string;
    stroke: string;
    selectedStroke: string;
    text: string;
  };
  port: {
    fill: string;
    stroke: string;
    hoverFill: string;
  };
  edge: {
    stroke: string;
    selectedStroke: string;
    text: string;
  };
};

export const LightTheme: ThemeConfig = {
  background: '#ffffff',
  grid: '#e0e0e0',
  node: {
    fill: '#f5f5f5',
    stroke: '#cccccc',
    selectedStroke: '#0078d7',
    text: '#333333',
  },
  port: {
    fill: '#ffffff',
    stroke: '#999999',
    hoverFill: '#0078d7',
  },
  edge: {
    stroke: '#999999',
    selectedStroke: '#0078d7',
    text: '#666666',
  },
};

export const DarkTheme: ThemeConfig = {
  background: '#1e1e1e',
  grid: '#333333',
  node: {
    fill: '#252526',
    stroke: '#444444',
    selectedStroke: '#0078d7',
    text: '#e0e0e0',
  },
  port: {
    fill: '#333333',
    stroke: '#666666',
    hoverFill: '#0078d7',
  },
  edge: {
    stroke: '#666666',
    selectedStroke: '#0078d7',
    text: '#cccccc',
  },
};

export class SVGDesigner {
  private svgElement: SVGSVGElement;
  private data: DesignerData;
  private theme: ThemeConfig;
  private selectedElements: Set<string> = new Set();
  private dragState: {
    isDragging: boolean;
    element: Element | null;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
  } = {
    isDragging: false,
    element: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
  };

  private edgeCreationState: {
    isCreating: boolean;
    sourceNode?: string;
    sourcePort?: string;
    points: Array<{ x: number; y: number }>;
  } = {
    isCreating: false,
    points: [],
  };

  private callbacks: {
    onNodeSelected?: (nodeId: string) => void;
    onEdgeSelected?: (edgeId: string) => void;
    onCanvasClick?: (x: number, y: number) => void;
    onChange?: (data: DesignerData) => void;
  } = {};

  constructor(container: HTMLElement, initialData?: DesignerData, options?: { theme?: ThemeConfig }) {
    this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svgElement.setAttribute('width', '100%');
    this.svgElement.setAttribute('height', '100%');
    this.svgElement.style.cursor = 'default';
    container.appendChild(this.svgElement);

    this.data = initialData || {
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, scale: 1 },
    };

    this.theme = options?.theme || DarkTheme;

    this.initEvents();
    this.render();
  }

  // Public methods
  public setTheme(theme: ThemeConfig): void {
    this.theme = theme;
    this.render();
  }

  public setData(data: DesignerData): void {
    this.data = data;
    this.render();
  }

  public getData(): DesignerData {
    return JSON.parse(JSON.stringify(this.data)); // Return a copy
  }

  public addNode(node: NodeData): void {
    this.data.nodes.push(node);
    this.render();
    this.triggerOnChange();
  }

  public removeNode(nodeId: string): void {
    this.data.nodes = this.data.nodes.filter(node => node.id !== nodeId);
    this.data.edges = this.data.edges.filter(
      edge => edge.source !== nodeId && edge.target !== nodeId
    );
    this.render();
    this.triggerOnChange();
  }

  public addEdge(edge: EdgeData): void {
    this.data.edges.push(edge);
    this.render();
    this.triggerOnChange();
  }

  public removeEdge(edgeId: string): void {
    this.data.edges = this.data.edges.filter(edge => edge.id !== edgeId);
    this.render();
    this.triggerOnChange();
  }

  public setCallbacks(callbacks: {
    onNodeSelected?: (nodeId: string) => void;
    onEdgeSelected?: (edgeId: string) => void;
    onCanvasClick?: (x: number, y: number) => void;
    onChange?: (data: DesignerData) => void;
  }): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public zoomIn(): void {
    this.data.viewport.scale *= 1.2;
    this.render();
    this.triggerOnChange();
  }

  public zoomOut(): void {
    this.data.viewport.scale *= 0.8;
    this.render();
    this.triggerOnChange();
  }

  public resetZoom(): void {
    this.data.viewport.scale = 1;
    this.render();
    this.triggerOnChange();
  }

  public centerView(): void {
    this.data.viewport.x = 0;
    this.data.viewport.y = 0;
    this.render();
    this.triggerOnChange();
  }

  // Private methods
  private initEvents(): void {
    this.svgElement.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.svgElement.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.svgElement.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.svgElement.addEventListener('wheel', this.handleWheel.bind(this));
  }

  private handleMouseDown(event: MouseEvent): void {
    const target = event.target as Element;
    const rect = this.svgElement.getBoundingClientRect();
    const x = (event.clientX - rect.left - this.data.viewport.x) / this.data.viewport.scale;
    const y = (event.clientY - rect.top - this.data.viewport.y) / this.data.viewport.scale;

    if (target.classList.contains('node')) {
      const nodeId = target.getAttribute('data-id') || '';
      this.selectNode(nodeId);
      this.dragState = {
        isDragging: true,
        element: target,
        startX: x,
        startY: y,
        lastX: x,
        lastY: y,
      };
    } else if (target.classList.contains('port')) {
      const portId = target.getAttribute('data-port-id') || '';
      const nodeId = target.getAttribute('data-node-id') || '';
      this.startEdgeCreation(nodeId, portId, x, y);
    } else if (target.classList.contains('edge')) {
      const edgeId = target.getAttribute('data-id') || '';
      this.selectEdge(edgeId);
    } else {
      // Canvas click
      this.selectedElements.clear();
      this.dragState = {
        isDragging: true,
        element: null, // Panning the canvas
        startX: x,
        startY: y,
        lastX: x,
        lastY: y,
      };
      if (this.callbacks.onCanvasClick) {
        this.callbacks.onCanvasClick(x, y);
      }
    }

    this.render();
  }

  private handleMouseMove(event: MouseEvent): void {
    const rect = this.svgElement.getBoundingClientRect();
    const x = (event.clientX - rect.left - this.data.viewport.x) / this.data.viewport.scale;
    const y = (event.clientY - rect.top - this.data.viewport.y) / this.data.viewport.scale;

    if (this.dragState.isDragging) {
      const dx = x - this.dragState.lastX;
      const dy = y - this.dragState.lastY;

      if (this.dragState.element && this.dragState.element.classList.contains('node')) {
        // Moving a node
        const nodeId = this.dragState.element.getAttribute('data-id') || '';
        const node = this.data.nodes.find(n => n.id === nodeId);
        if (node) {
          node.x += dx;
          node.y += dy;
          this.triggerOnChange();
        }
      } else if (!this.dragState.element) {
        // Panning the canvas
        this.data.viewport.x += (x - this.dragState.lastX) * this.data.viewport.scale;
        this.data.viewport.y += (y - this.dragState.lastY) * this.data.viewport.scale;
        this.triggerOnChange();
      }

      this.dragState.lastX = x;
      this.dragState.lastY = y;
      this.render();
    }

    if (this.edgeCreationState.isCreating) {
      this.edgeCreationState.points = [
        ...this.edgeCreationState.points.slice(0, -1),
        { x, y },
      ];
      this.render();
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    const rect = this.svgElement.getBoundingClientRect();
    const x = (event.clientX - rect.left - this.data.viewport.x) / this.data.viewport.scale;
    const y = (event.clientY - rect.top - this.data.viewport.y) / this.data.viewport.scale;

    if (this.edgeCreationState.isCreating) {
      const target = event.target as Element;
      if (target.classList.contains('port')) {
        const targetNodeId = target.getAttribute('data-node-id') || '';
        const targetPortId = target.getAttribute('data-port-id') || '';
        this.completeEdgeCreation(targetNodeId, targetPortId);
      } else {
        this.cancelEdgeCreation();
      }
    }

    this.dragState.isDragging = false;
    this.render();
  }

  private handleWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    
    // Get mouse position relative to SVG
    const rect = this.svgElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculate world coordinates before zoom
    const worldX = (mouseX - this.data.viewport.x) / this.data.viewport.scale;
    const worldY = (mouseY - this.data.viewport.y) / this.data.viewport.scale;

    // Apply zoom
    this.data.viewport.scale *= delta;

    // Calculate world coordinates after zoom
    const newWorldX = (mouseX - this.data.viewport.x) / this.data.viewport.scale;
    const newWorldY = (mouseY - this.data.viewport.y) / this.data.viewport.scale;

    // Adjust viewport to keep the mouse position fixed
    this.data.viewport.x += (newWorldX - worldX) * this.data.viewport.scale;
    this.data.viewport.y += (newWorldY - worldY) * this.data.viewport.scale;

    this.render();
    this.triggerOnChange();
  }

  private selectNode(nodeId: string): void {
    if (!event?.ctrlKey && !event?.metaKey) {
      this.selectedElements.clear();
    }
    this.selectedElements.add(nodeId);
    if (this.callbacks.onNodeSelected) {
      this.callbacks.onNodeSelected(nodeId);
    }
  }

  private selectEdge(edgeId: string): void {
    if (!event?.ctrlKey && !event?.metaKey) {
      this.selectedElements.clear();
    }
    this.selectedElements.add(edgeId);
    if (this.callbacks.onEdgeSelected) {
      this.callbacks.onEdgeSelected(edgeId);
    }
  }

  private startEdgeCreation(nodeId: string, portId: string, x: number, y: number): void {
    this.edgeCreationState = {
      isCreating: true,
      sourceNode: nodeId,
      sourcePort: portId,
      points: [{ x, y }, { x, y }],
    };
  }

  private completeEdgeCreation(targetNodeId: string, targetPortId: string): void {
    if (
      this.edgeCreationState.isCreating &&
      this.edgeCreationState.sourceNode &&
      targetNodeId &&
      this.edgeCreationState.sourceNode !== targetNodeId
    ) {
      const newEdge: EdgeData = {
        id: `edge-${Date.now()}`,
        source: this.edgeCreationState.sourceNode,
        sourcePort: this.edgeCreationState.sourcePort,
        target: targetNodeId,
        targetPort: targetPortId,
      };
      this.addEdge(newEdge);
    }
    this.edgeCreationState.isCreating = false;
  }

  private cancelEdgeCreation(): void {
    this.edgeCreationState.isCreating = false;
    this.render();
  }

  private render(): void {
    // Clear SVG
    while (this.svgElement.firstChild) {
      this.svgElement.removeChild(this.svgElement.firstChild);
    }

    // Render background
    this.renderBackground();

    // Create a group for transformation
    const transformGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    transformGroup.setAttribute(
      'transform',
      `translate(${this.data.viewport.x},${this.data.viewport.y}) scale(${this.data.viewport.scale})`
    );
    this.svgElement.appendChild(transformGroup);

    // Render grid
    this.renderGrid(transformGroup);

    // Render edges
    this.data.edges.forEach(edge => {
      this.renderEdge(transformGroup, edge);
    });

    // Render in-progress edge
    if (this.edgeCreationState.isCreating) {
      this.renderInProgressEdge(transformGroup);
    }

    // Render nodes
    this.data.nodes.forEach(node => {
      this.renderNode(transformGroup, node);
    });
  }

  private renderBackground(): void {
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute('fill', this.theme.background);
    this.svgElement.appendChild(background);
  }

  private renderGrid(parent: SVGElement): void {
    const gridSize = 20;
    const gridPattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    gridPattern.setAttribute('id', 'grid-pattern');
    gridPattern.setAttribute('width', gridSize.toString());
    gridPattern.setAttribute('height', gridSize.toString());
    gridPattern.setAttribute('patternUnits', 'userSpaceOnUse');

    const gridLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    gridLine1.setAttribute('d', `M ${gridSize} 0 L 0 0 0 ${gridSize}`);
    gridLine1.setAttribute('fill', 'none');
    gridLine1.setAttribute('stroke', this.theme.grid);
    gridLine1.setAttribute('stroke-width', '0.5');
    gridPattern.appendChild(gridLine1);

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.appendChild(gridPattern);
    parent.appendChild(defs);

    const grid = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    grid.setAttribute('width', '10000');
    grid.setAttribute('height', '10000');
    grid.setAttribute('x', '-5000');
    grid.setAttribute('y', '-5000');
    grid.setAttribute('fill', 'url(#grid-pattern)');
    parent.appendChild(grid);
  }

  private renderNode(parent: SVGElement, node: NodeData): void {
    const isSelected = this.selectedElements.has(node.id);
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(${node.x},${node.y})`);

    // Node rectangle
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', node.width.toString());
    rect.setAttribute('height', node.height.toString());
    rect.setAttribute('rx', '5');
    rect.setAttribute('fill', this.theme.node.fill);
    rect.setAttribute('stroke', isSelected ? this.theme.node.selectedStroke : this.theme.node.stroke);
    rect.setAttribute('stroke-width', isSelected ? '2' : '1');
    rect.classList.add('node');
    rect.setAttribute('data-id', node.id);
    group.appendChild(rect);

    // Node label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', (node.width / 2).toString());
    text.setAttribute('y', '20');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', this.theme.node.text);
    text.textContent = node.label;
    group.appendChild(text);

    // Render ports
    if (node.inputs) {
      node.inputs.forEach((port, index) => {
        this.renderPort(group, port, node, 'input', index);
      });
    }

    if (node.outputs) {
      node.outputs.forEach((port, index) => {
        this.renderPort(group, port, node, 'output', index);
      });
    }

    parent.appendChild(group);
  }

  private renderPort(
    parent: SVGElement,
    port: PortData,
    node: NodeData,
    type: 'input' | 'output',
    index: number
  ): void {
    let x = 0, y = 0;
    
    // Position the port based on its specified position or default to inputs on left, outputs on right
    if (port.position === 'left' || (type === 'input' && !port.position)) {
      x = 0;
      y = 30 + index * 20;
    } else if (port.position === 'right' || (type === 'output' && !port.position)) {
      x = node.width;
      y = 30 + index * 20;
    } else if (port.position === 'top') {
      x = (type === 'input' ? node.width / 3 : (2 * node.width) / 3);
      y = 0;
    } else if (port.position === 'bottom') {
      x = (type === 'input' ? node.width / 3 : (2 * node.width) / 3);
      y = node.height;
    }

    const portCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    portCircle.setAttribute('cx', x.toString());
    portCircle.setAttribute('cy', y.toString());
    portCircle.setAttribute('r', '5');
    portCircle.setAttribute('fill', this.theme.port.fill);
    portCircle.setAttribute('stroke', this.theme.port.stroke);
    portCircle.classList.add('port');
    portCircle.setAttribute('data-node-id', node.id);
    portCircle.setAttribute('data-port-id', port.id);
    portCircle.setAttribute('data-port-type', type);
    parent.appendChild(portCircle);

    if (port.label) {
      const portLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      let labelX = x, labelY = y;
      
      if (port.position === 'left' || (type === 'input' && !port.position)) {
        labelX += 10;
        labelY += 4;
        portLabel.setAttribute('text-anchor', 'start');
      } else if (port.position === 'right' || (type === 'output' && !port.position)) {
        labelX -= 10;
        labelY += 4;
        portLabel.setAttribute('text-anchor', 'end');
      } else if (port.position === 'top') {
        labelY -= 8;
        portLabel.setAttribute('text-anchor', 'middle');
      } else if (port.position === 'bottom') {
        labelY += 16;
        portLabel.setAttribute('text-anchor', 'middle');
      }

      portLabel.setAttribute('x', labelX.toString());
      portLabel.setAttribute('y', labelY.toString());
      portLabel.setAttribute('fill', this.theme.node.text);
      portLabel.setAttribute('font-size', '12');
      portLabel.textContent = port.label;
      parent.appendChild(portLabel);
    }
  }

  private renderEdge(parent: SVGElement, edge: EdgeData): void {
    const isSelected = this.selectedElements.has(edge.id);
    const sourceNode = this.data.nodes.find(n => n.id === edge.source);
    const targetNode = this.data.nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) return;

    let sourcePort = null;
    let targetPort = null;

    if (edge.sourcePort && sourceNode.outputs) {
      sourcePort = sourceNode.outputs.find(p => p.id === edge.sourcePort);
    }

    if (edge.targetPort && targetNode.inputs) {
      targetPort = targetNode.inputs.find(p => p.id === edge.targetPort);
    }

    // Calculate port positions or use defaults
    let sourceX = sourceNode.x + sourceNode.width;
    let sourceY = sourceNode.y + sourceNode.height / 2;
    let targetX = targetNode.x;
    let targetY = targetNode.y + targetNode.height / 2;

    if (sourcePort) {
      const portPos = this.getPortPosition(sourceNode, sourcePort, 'output');
      sourceX = portPos.x;
      sourceY = portPos.y;
    }

    if (targetPort) {
      const portPos = this.getPortPosition(targetNode, targetPort, 'input');
      targetX = portPos.x;
      targetY = portPos.y;
    }

    // Create edge path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const controlPointX1 = sourceX + Math.min(100, Math.abs(targetX - sourceX) * 0.5);
    const controlPointX2 = targetX - Math.min(100, Math.abs(targetX - sourceX) * 0.5);

    const pathData = `M ${sourceX} ${sourceY} C ${controlPointX1} ${sourceY}, ${controlPointX2} ${targetY}, ${targetX} ${targetY}`;

    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', isSelected ? this.theme.edge.selectedStroke : this.theme.edge.stroke);
    path.setAttribute('stroke-width', isSelected ? '2' : '1');
    path.classList.add('edge');
    path.setAttribute('data-id', edge.id);
    parent.appendChild(path);

    // Edge label if provided
    if (edge.label) {
      const midX = (sourceX + targetX) / 2;
      const midY = (sourceY + targetY) / 2 - 10;
      
      const textBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      textBg.setAttribute('x', (midX - 40).toString());
      textBg.setAttribute('y', (midY - 15).toString());
      textBg.setAttribute('width', '80');
      textBg.setAttribute('height', '20');
      textBg.setAttribute('rx', '3');
      textBg.setAttribute('fill', this.theme.background);
      parent.appendChild(textBg);
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', midX.toString());
      text.setAttribute('y', midY.toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', this.theme.edge.text);
      text.textContent = edge.label;
      parent.appendChild(text);
    }
  }

  private renderInProgressEdge(parent: SVGElement): void {
    if (!this.edgeCreationState.isCreating || this.edgeCreationState.points.length < 2) return;

    const points = this.edgeCreationState.points;
    const start = points[0];
    const end = points[points.length - 1];

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const controlPointX1 = start.x + Math.min(100, Math.abs(end.x - start.x) * 0.5);
    const controlPointX2 = end.x - Math.min(100, Math.abs(end.x - start.x) * 0.5);

    const pathData = `M ${start.x} ${start.y} C ${controlPointX1} ${start.y}, ${controlPointX2} ${end.y}, ${end.x} ${end.y}`;

    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', this.theme.edge.stroke);
    path.setAttribute('stroke-width', '1');
    path.setAttribute('stroke-dasharray', '5,5');
    parent.appendChild(path);
  }

  private getPortPosition(
    node: NodeData,
    port: PortData,
    type: 'input' | 'output'
  ): { x: number; y: number } {
    let x = node.x, y = node.y;
    
    if (port.position === 'left' || (type === 'input' && !port.position)) {
      const index = node.inputs?.findIndex(p => p.id === port.id) || 0;
      x += 0;
      y += 30 + index * 20;
    } else if (port.position === 'right' || (type === 'output' && !port.position)) {
      const index = node.outputs?.findIndex(p => p.id === port.id) || 0;
      x += node.width;
      y += 30 + index * 20;
    } else if (port.position === 'top') {
      x += (type === 'input' ? node.width / 3 : (2 * node.width) / 3);
      y += 0;
    } else if (port.position === 'bottom') {
      x += (type === 'input' ? node.width / 3 : (2 * node.width) / 3);
      y += node.height;
    }

    return { x, y };
  }

  private triggerOnChange(): void {
    if (this.callbacks.onChange) {
      this.callbacks.onChange(this.getData());
    }
  }
}
