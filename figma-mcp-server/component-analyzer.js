/**
 * Component Analyzer
 * Analyzes Figma components and generates Angular component structures
 */

/**
 * Analyze layout properties of a Figma node
 */
export function analyzeLayout(node) {
  const layout = {
    type: node.type,
    name: node.name,
    width: node.absoluteBoundingBox?.width || node.size?.x,
    height: node.absoluteBoundingBox?.height || node.size?.y,
    position: {
      x: node.absoluteBoundingBox?.x || 0,
      y: node.absoluteBoundingBox?.y || 0
    }
  };

  // Flexbox/Auto Layout properties
  if (node.layoutMode) {
    layout.display = 'flex';
    layout.flexDirection = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';
    layout.gap = node.itemSpacing || 0;
    layout.padding = {
      top: node.paddingTop || 0,
      right: node.paddingRight || 0,
      bottom: node.paddingBottom || 0,
      left: node.paddingLeft || 0
    };
    
    // Alignment
    layout.justifyContent = mapFigmaAlignment(node.primaryAxisAlignItems);
    layout.alignItems = mapFigmaAlignment(node.counterAxisAlignItems);
  }

  // Background/Fill
  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID') {
      layout.backgroundColor = figmaColorToCSS(fill.color);
    }
  }

  // Border radius
  if (node.cornerRadius !== undefined) {
    layout.borderRadius = node.cornerRadius;
  }

  // Strokes/Borders
  if (node.strokes && node.strokes.length > 0) {
    const stroke = node.strokes[0];
    layout.border = {
      width: node.strokeWeight || 1,
      color: figmaColorToCSS(stroke.color),
      style: 'solid'
    };
  }

  return layout;
}

/**
 * Map Figma alignment to CSS values
 */
function mapFigmaAlignment(alignment) {
  const map = {
    'MIN': 'flex-start',
    'CENTER': 'center',
    'MAX': 'flex-end',
    'SPACE_BETWEEN': 'space-between',
    'SPACE_AROUND': 'space-around'
  };
  return map[alignment] || 'flex-start';
}

/**
 * Convert Figma color to CSS
 */
function figmaColorToCSS(color) {
  if (!color) return null;
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a !== undefined ? color.a : 1;
  
  if (a === 1) {
    return `rgb(${r}, ${g}, ${b})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Extract text content from a node
 */
export function extractTextContent(node) {
  if (node.type === 'TEXT') {
    return {
      content: node.characters || '',
      style: {
        fontFamily: node.style?.fontFamily,
        fontSize: node.style?.fontSize,
        fontWeight: node.style?.fontWeight,
        textAlign: node.style?.textAlignHorizontal?.toLowerCase(),
        color: node.fills?.[0]?.color ? figmaColorToCSS(node.fills[0].color) : null
      }
    };
  }
  return null;
}

/**
 * Generate Angular component structure from Figma component
 */
export function generateAngularComponent(figmaNode) {
  const componentName = toPascalCase(figmaNode.name);
  const selector = toKebabCase(figmaNode.name);
  
  const component = {
    name: componentName,
    selector: `app-${selector}`,
    fileName: `${selector}.component`,
    typescript: generateTypeScript(componentName, selector),
    html: generateHTML(figmaNode),
    scss: generateSCSS(figmaNode)
  };
  
  return component;
}

/**
 * Generate TypeScript component code
 */
function generateTypeScript(componentName, selector) {
  return `import { Component } from '@angular/core';

@Component({
  selector: 'app-${selector}',
  standalone: true,
  imports: [],
  templateUrl: './${selector}.component.html',
  styleUrl: './${selector}.component.scss'
})
export class ${componentName}Component {
  // Component logic here
}
`;
}

/**
 * Generate HTML template from Figma node structure
 */
function generateHTML(node, indent = 0) {
  const indentStr = '  '.repeat(indent);
  let html = '';
  
  if (node.type === 'TEXT') {
    const text = extractTextContent(node);
    html += `${indentStr}<p class="${toKebabCase(node.name)}">${text.content}</p>\n`;
  } else if (node.type === 'RECTANGLE' || node.type === 'FRAME' || node.type === 'COMPONENT') {
    const tag = node.type === 'FRAME' || node.type === 'COMPONENT' ? 'div' : 'div';
    html += `${indentStr}<${tag} class="${toKebabCase(node.name)}">\n`;
    
    if (node.children) {
      for (const child of node.children) {
        html += generateHTML(child, indent + 1);
      }
    }
    
    html += `${indentStr}</${tag}>\n`;
  } else if (node.children) {
    // For other container types
    for (const child of node.children) {
      html += generateHTML(child, indent);
    }
  }
  
  return html;
}

/**
 * Generate SCSS styles from Figma node
 */
function generateSCSS(node, indent = 0) {
  const indentStr = '  '.repeat(indent);
  let scss = '';
  
  const className = toKebabCase(node.name);
  const layout = analyzeLayout(node);
  
  scss += `${indentStr}.${className} {\n`;
  
  // Layout properties
  if (layout.display) {
    scss += `${indentStr}  display: ${layout.display};\n`;
    scss += `${indentStr}  flex-direction: ${layout.flexDirection};\n`;
    if (layout.gap) scss += `${indentStr}  gap: ${layout.gap}px;\n`;
    if (layout.justifyContent) scss += `${indentStr}  justify-content: ${layout.justifyContent};\n`;
    if (layout.alignItems) scss += `${indentStr}  align-items: ${layout.alignItems};\n`;
  }
  
  // Dimensions
  if (layout.width) scss += `${indentStr}  width: ${layout.width}px;\n`;
  if (layout.height) scss += `${indentStr}  height: ${layout.height}px;\n`;
  
  // Padding
  if (layout.padding) {
    const p = layout.padding;
    if (p.top === p.right && p.right === p.bottom && p.bottom === p.left) {
      if (p.top > 0) scss += `${indentStr}  padding: ${p.top}px;\n`;
    } else {
      scss += `${indentStr}  padding: ${p.top}px ${p.right}px ${p.bottom}px ${p.left}px;\n`;
    }
  }
  
  // Background
  if (layout.backgroundColor) {
    scss += `${indentStr}  background-color: ${layout.backgroundColor};\n`;
  }
  
  // Border radius
  if (layout.borderRadius) {
    scss += `${indentStr}  border-radius: ${layout.borderRadius}px;\n`;
  }
  
  // Border
  if (layout.border) {
    scss += `${indentStr}  border: ${layout.border.width}px ${layout.border.style} ${layout.border.color};\n`;
  }
  
  scss += `${indentStr}}\n`;
  
  // Generate styles for children
  if (node.children) {
    for (const child of node.children) {
      scss += '\n' + generateSCSS(child, indent);
    }
  }
  
  return scss;
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^(.)/, (char) => char.toUpperCase());
}

/**
 * Convert string to kebab-case
 */
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Analyze component variants
 */
export function analyzeVariants(component) {
  const variants = [];
  
  if (component.children) {
    for (const child of component.children) {
      if (child.type === 'COMPONENT') {
        variants.push({
          name: child.name,
          properties: child.componentPropertyDefinitions || {}
        });
      }
    }
  }
  
  return variants;
}

/**
 * Extract interactive elements (buttons, inputs, etc.)
 */
export function extractInteractiveElements(node) {
  const elements = [];
  
  function traverse(n) {
    // Check if node is interactive
    if (n.name && (
      n.name.toLowerCase().includes('button') ||
      n.name.toLowerCase().includes('input') ||
      n.name.toLowerCase().includes('form') ||
      n.name.toLowerCase().includes('link')
    )) {
      elements.push({
        type: inferElementType(n.name),
        name: n.name,
        id: n.id,
        layout: analyzeLayout(n)
      });
    }
    
    if (n.children) {
      n.children.forEach(traverse);
    }
  }
  
  traverse(node);
  return elements;
}

/**
 * Infer HTML element type from Figma node name
 */
function inferElementType(name) {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('button')) return 'button';
  if (lowerName.includes('input')) return 'input';
  if (lowerName.includes('form')) return 'form';
  if (lowerName.includes('link')) return 'a';
  if (lowerName.includes('image') || lowerName.includes('img')) return 'img';
  
  return 'div';
}

