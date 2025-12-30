/**
 * Design Token Extractor
 * Extracts design tokens (colors, typography, spacing, etc.) from Figma
 */

/**
 * Convert Figma color to CSS format
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
 * Convert Figma color to hex format
 */
function figmaColorToHex(color) {
  if (!color) return null;
  
  const r = Math.round(color.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(color.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(color.b * 255).toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`;
}

/**
 * Extract color tokens from paint styles
 */
export function extractColors(styles, styleNodes) {
  const colors = {};
  
  for (const [styleId, style] of Object.entries(styles)) {
    if (style.styleType === 'FILL') {
      const node = styleNodes?.nodes?.[styleId];
      if (node?.document?.fills?.[0]) {
        const fill = node.document.fills[0];
        if (fill.type === 'SOLID') {
          const name = style.name.replace(/\//g, '-').toLowerCase();
          colors[name] = {
            hex: figmaColorToHex(fill.color),
            rgb: figmaColorToCSS(fill.color),
            opacity: fill.opacity || 1
          };
        }
      }
    }
  }
  
  return colors;
}

/**
 * Extract typography tokens from text styles
 */
export function extractTypography(styles, styleNodes) {
  const typography = {};
  
  for (const [styleId, style] of Object.entries(styles)) {
    if (style.styleType === 'TEXT') {
      const node = styleNodes?.nodes?.[styleId];
      if (node?.document?.style) {
        const textStyle = node.document.style;
        const name = style.name.replace(/\//g, '-').toLowerCase();
        
        typography[name] = {
          fontFamily: textStyle.fontFamily || 'inherit',
          fontSize: `${textStyle.fontSize || 16}px`,
          fontWeight: textStyle.fontWeight || 400,
          lineHeight: textStyle.lineHeightPx 
            ? `${textStyle.lineHeightPx}px` 
            : textStyle.lineHeightPercentFontSize 
            ? `${textStyle.lineHeightPercentFontSize}%` 
            : 'normal',
          letterSpacing: textStyle.letterSpacing 
            ? `${textStyle.letterSpacing}px` 
            : 'normal',
          textTransform: textStyle.textCase || 'none'
        };
      }
    }
  }
  
  return typography;
}

/**
 * Extract spacing tokens from layout properties
 */
export function extractSpacing(nodes) {
  const spacing = new Set();
  
  function traverse(node) {
    // Extract padding
    if (node.paddingLeft !== undefined) spacing.add(node.paddingLeft);
    if (node.paddingRight !== undefined) spacing.add(node.paddingRight);
    if (node.paddingTop !== undefined) spacing.add(node.paddingTop);
    if (node.paddingBottom !== undefined) spacing.add(node.paddingBottom);
    
    // Extract gap
    if (node.itemSpacing !== undefined) spacing.add(node.itemSpacing);
    
    // Traverse children
    if (node.children) {
      node.children.forEach(child => traverse(child));
    }
  }
  
  if (Array.isArray(nodes)) {
    nodes.forEach(node => traverse(node));
  } else {
    traverse(nodes);
  }
  
  // Convert to sorted array and create scale
  const sortedSpacing = Array.from(spacing).sort((a, b) => a - b);
  const spacingScale = {};
  
  sortedSpacing.forEach((value, index) => {
    spacingScale[`spacing-${index}`] = `${value}px`;
  });
  
  return spacingScale;
}

/**
 * Extract shadow/effect tokens
 */
export function extractEffects(styles, styleNodes) {
  const effects = {};
  
  for (const [styleId, style] of Object.entries(styles)) {
    if (style.styleType === 'EFFECT') {
      const node = styleNodes?.nodes?.[styleId];
      if (node?.document?.effects) {
        const name = style.name.replace(/\//g, '-').toLowerCase();
        const shadows = node.document.effects
          .filter(effect => effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW')
          .map(effect => {
            const color = figmaColorToCSS(effect.color);
            return `${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${color}`;
          });
        
        if (shadows.length > 0) {
          effects[name] = shadows.join(', ');
        }
      }
    }
  }
  
  return effects;
}

/**
 * Generate SCSS variables from design tokens
 */
export function generateSCSSVariables(tokens) {
  let scss = '// Design Tokens extracted from Figma\n\n';
  
  // Colors
  if (tokens.colors && Object.keys(tokens.colors).length > 0) {
    scss += '// Colors\n';
    for (const [name, value] of Object.entries(tokens.colors)) {
      scss += `$color-${name}: ${value.hex};\n`;
    }
    scss += '\n';
  }
  
  // Typography
  if (tokens.typography && Object.keys(tokens.typography).length > 0) {
    scss += '// Typography\n';
    for (const [name, styles] of Object.entries(tokens.typography)) {
      scss += `$font-${name}-family: ${styles.fontFamily};\n`;
      scss += `$font-${name}-size: ${styles.fontSize};\n`;
      scss += `$font-${name}-weight: ${styles.fontWeight};\n`;
      scss += `$font-${name}-line-height: ${styles.lineHeight};\n`;
    }
    scss += '\n';
  }
  
  // Spacing
  if (tokens.spacing && Object.keys(tokens.spacing).length > 0) {
    scss += '// Spacing\n';
    for (const [name, value] of Object.entries(tokens.spacing)) {
      scss += `$${name}: ${value};\n`;
    }
    scss += '\n';
  }
  
  // Effects/Shadows
  if (tokens.effects && Object.keys(tokens.effects).length > 0) {
    scss += '// Shadows\n';
    for (const [name, value] of Object.entries(tokens.effects)) {
      scss += `$shadow-${name}: ${value};\n`;
    }
    scss += '\n';
  }
  
  return scss;
}

/**
 * Generate CSS custom properties from design tokens
 */
export function generateCSSVariables(tokens) {
  let css = ':root {\n';
  css += '  /* Design Tokens extracted from Figma */\n\n';
  
  // Colors
  if (tokens.colors && Object.keys(tokens.colors).length > 0) {
    css += '  /* Colors */\n';
    for (const [name, value] of Object.entries(tokens.colors)) {
      css += `  --color-${name}: ${value.hex};\n`;
    }
    css += '\n';
  }
  
  // Typography
  if (tokens.typography && Object.keys(tokens.typography).length > 0) {
    css += '  /* Typography */\n';
    for (const [name, styles] of Object.entries(tokens.typography)) {
      css += `  --font-${name}-family: ${styles.fontFamily};\n`;
      css += `  --font-${name}-size: ${styles.fontSize};\n`;
      css += `  --font-${name}-weight: ${styles.fontWeight};\n`;
      css += `  --font-${name}-line-height: ${styles.lineHeight};\n`;
    }
    css += '\n';
  }
  
  // Spacing
  if (tokens.spacing && Object.keys(tokens.spacing).length > 0) {
    css += '  /* Spacing */\n';
    for (const [name, value] of Object.entries(tokens.spacing)) {
      css += `  --${name}: ${value};\n`;
    }
    css += '\n';
  }
  
  // Effects/Shadows
  if (tokens.effects && Object.keys(tokens.effects).length > 0) {
    css += '  /* Shadows */\n';
    for (const [name, value] of Object.entries(tokens.effects)) {
      css += `  --shadow-${name}: ${value};\n`;
    }
    css += '\n';
  }
  
  css += '}\n';
  return css;
}

