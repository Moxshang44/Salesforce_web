#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { FigmaClient } from './figma-client.js';
import {
  extractColors,
  extractTypography,
  extractSpacing,
  extractEffects,
  generateSCSSVariables,
  generateCSSVariables
} from './design-tokens.js';
import {
  analyzeLayout,
  extractTextContent,
  generateAngularComponent,
  analyzeVariants,
  extractInteractiveElements
} from './component-analyzer.js';

// Configuration
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY || 'CEsDhoAMxFi2vDpDmtyCTJ';

if (!FIGMA_ACCESS_TOKEN) {
  console.error('Error: FIGMA_ACCESS_TOKEN environment variable is required');
  console.error('Please set it in your environment or .env file');
  process.exit(1);
}

// Initialize Figma client
const figmaClient = new FigmaClient(FIGMA_ACCESS_TOKEN, FIGMA_FILE_KEY);

// Create MCP server
const server = new Server(
  {
    name: 'figma-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_design_tokens',
        description: 'Extract design tokens (colors, typography, spacing, effects) from Figma file',
        inputSchema: {
          type: 'object',
          properties: {
            format: {
              type: 'string',
              description: 'Output format: scss, css, or json',
              enum: ['scss', 'css', 'json'],
              default: 'scss'
            }
          }
        }
      },
      {
        name: 'list_pages_and_frames',
        description: 'List all pages and frames in the Figma file',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_component_details',
        description: 'Get detailed information about a specific component or frame',
        inputSchema: {
          type: 'object',
          properties: {
            nodeName: {
              type: 'string',
              description: 'Name of the component or frame to analyze'
            }
          },
          required: ['nodeName']
        }
      },
      {
        name: 'analyze_layout',
        description: 'Analyze layout properties (flexbox, spacing, etc.) of a specific node',
        inputSchema: {
          type: 'object',
          properties: {
            nodeName: {
              type: 'string',
              description: 'Name of the node to analyze'
            }
          },
          required: ['nodeName']
        }
      },
      {
        name: 'get_component_code',
        description: 'Generate Angular component code (TypeScript, HTML, SCSS) from a Figma component',
        inputSchema: {
          type: 'object',
          properties: {
            componentName: {
              type: 'string',
              description: 'Name of the Figma component to convert'
            }
          },
          required: ['componentName']
        }
      },
      {
        name: 'export_assets',
        description: 'Export images and icons from Figma as SVG or PNG',
        inputSchema: {
          type: 'object',
          properties: {
            nodeName: {
              type: 'string',
              description: 'Name of the node to export'
            },
            format: {
              type: 'string',
              description: 'Export format',
              enum: ['svg', 'png'],
              default: 'svg'
            },
            scale: {
              type: 'number',
              description: 'Export scale (1, 2, 3, 4)',
              default: 1
            }
          },
          required: ['nodeName']
        }
      },
      {
        name: 'find_interactive_elements',
        description: 'Find all interactive elements (buttons, inputs, links) in a page or frame',
        inputSchema: {
          type: 'object',
          properties: {
            pageName: {
              type: 'string',
              description: 'Name of the page to search (optional, searches all if not provided)'
            }
          }
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_design_tokens': {
        const file = await figmaClient.getFile();
        const styles = file.styles || {};
        
        // Get style nodes for detailed information
        const styleIds = Object.keys(styles);
        const styleNodes = styleIds.length > 0 
          ? await figmaClient.getNodes(styleIds) 
          : { nodes: {} };
        
        const tokens = {
          colors: extractColors(styles, styleNodes),
          typography: extractTypography(styles, styleNodes),
          spacing: extractSpacing(file.document),
          effects: extractEffects(styles, styleNodes)
        };
        
        const format = args.format || 'scss';
        let output;
        
        if (format === 'scss') {
          output = generateSCSSVariables(tokens);
        } else if (format === 'css') {
          output = generateCSSVariables(tokens);
        } else {
          output = JSON.stringify(tokens, null, 2);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Design tokens extracted from Figma (${format} format):\n\n${output}`
            }
          ]
        };
      }

      case 'list_pages_and_frames': {
        const pages = await figmaClient.getPages();
        let output = 'Figma File Structure:\n\n';
        
        for (const page of pages) {
          output += `📄 Page: ${page.name}\n`;
          const frames = page.children.filter(c => c.type === 'FRAME' || c.type === 'COMPONENT_SET' || c.type === 'COMPONENT');
          
          for (const frame of frames) {
            output += `  └─ ${frame.type === 'COMPONENT' ? '🧩' : '📐'} ${frame.name}\n`;
          }
          output += '\n';
        }
        
        return {
          content: [
            {
              type: 'text',
              text: output
            }
          ]
        };
      }

      case 'get_component_details': {
        const file = await figmaClient.getFile();
        const nodeName = args.nodeName;
        
        // Search for the node
        const foundNodes = figmaClient.findNodes(
          file.document,
          node => node.name === nodeName
        );
        
        if (foundNodes.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `Component "${nodeName}" not found in Figma file.`
              }
            ]
          };
        }
        
        const node = foundNodes[0];
        const layout = analyzeLayout(node);
        const variants = analyzeVariants(node);
        
        let output = `Component: ${node.name}\n`;
        output += `Type: ${node.type}\n\n`;
        output += `Layout Properties:\n`;
        output += JSON.stringify(layout, null, 2);
        
        if (variants.length > 0) {
          output += `\n\nVariants: ${variants.length}\n`;
          output += JSON.stringify(variants, null, 2);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: output
            }
          ]
        };
      }

      case 'analyze_layout': {
        const file = await figmaClient.getFile();
        const nodeName = args.nodeName;
        
        const foundNodes = figmaClient.findNodes(
          file.document,
          node => node.name === nodeName
        );
        
        if (foundNodes.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `Node "${nodeName}" not found.`
              }
            ]
          };
        }
        
        const node = foundNodes[0];
        const layout = analyzeLayout(node);
        
        // Generate CSS from layout
        let css = `.${node.name.toLowerCase().replace(/\s+/g, '-')} {\n`;
        if (layout.display) css += `  display: ${layout.display};\n`;
        if (layout.flexDirection) css += `  flex-direction: ${layout.flexDirection};\n`;
        if (layout.gap) css += `  gap: ${layout.gap}px;\n`;
        if (layout.justifyContent) css += `  justify-content: ${layout.justifyContent};\n`;
        if (layout.alignItems) css += `  align-items: ${layout.alignItems};\n`;
        if (layout.width) css += `  width: ${layout.width}px;\n`;
        if (layout.height) css += `  height: ${layout.height}px;\n`;
        if (layout.backgroundColor) css += `  background-color: ${layout.backgroundColor};\n`;
        if (layout.borderRadius) css += `  border-radius: ${layout.borderRadius}px;\n`;
        css += `}\n`;
        
        return {
          content: [
            {
              type: 'text',
              text: `Layout analysis for "${nodeName}":\n\n${JSON.stringify(layout, null, 2)}\n\nCSS:\n${css}`
            }
          ]
        };
      }

      case 'get_component_code': {
        const file = await figmaClient.getFile();
        const componentName = args.componentName;
        
        const foundNodes = figmaClient.findNodes(
          file.document,
          node => node.name === componentName && (node.type === 'COMPONENT' || node.type === 'FRAME')
        );
        
        if (foundNodes.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `Component "${componentName}" not found.`
              }
            ]
          };
        }
        
        const node = foundNodes[0];
        const component = generateAngularComponent(node);
        
        let output = `Angular Component Generated: ${component.name}\n\n`;
        output += `📁 ${component.fileName}.ts:\n\`\`\`typescript\n${component.typescript}\n\`\`\`\n\n`;
        output += `📁 ${component.fileName}.html:\n\`\`\`html\n${component.html}\n\`\`\`\n\n`;
        output += `📁 ${component.fileName}.scss:\n\`\`\`scss\n${component.scss}\n\`\`\`\n`;
        
        return {
          content: [
            {
              type: 'text',
              text: output
            }
          ]
        };
      }

      case 'export_assets': {
        const file = await figmaClient.getFile();
        const nodeName = args.nodeName;
        
        const foundNodes = figmaClient.findNodes(
          file.document,
          node => node.name === nodeName
        );
        
        if (foundNodes.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `Node "${nodeName}" not found.`
              }
            ]
          };
        }
        
        const node = foundNodes[0];
        const format = args.format || 'svg';
        const scale = args.scale || 1;
        
        const images = await figmaClient.getImages([node.id], { format, scale });
        
        let output = `Asset export for "${nodeName}":\n\n`;
        output += `Format: ${format.toUpperCase()}\n`;
        output += `Scale: ${scale}x\n\n`;
        
        if (images.images && images.images[node.id]) {
          output += `Download URL: ${images.images[node.id]}\n`;
          output += `\nNote: This URL is temporary and expires after 14 days.`;
        } else {
          output += `Error: Could not generate export URL`;
        }
        
        return {
          content: [
            {
              type: 'text',
              text: output
            }
          ]
        };
      }

      case 'find_interactive_elements': {
        const file = await figmaClient.getFile();
        let searchNode = file.document;
        
        if (args.pageName) {
          const pages = await figmaClient.getPages();
          const page = pages.find(p => p.name === args.pageName);
          if (page) {
            searchNode = page;
          }
        }
        
        const elements = extractInteractiveElements(searchNode);
        
        let output = `Found ${elements.length} interactive elements:\n\n`;
        
        for (const element of elements) {
          output += `${element.type.toUpperCase()}: ${element.name}\n`;
          output += `  ID: ${element.id}\n`;
          output += `  Size: ${element.layout.width}x${element.layout.height}px\n\n`;
        }
        
        return {
          content: [
            {
              type: 'text',
              text: output
            }
          ]
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`
            }
          ],
          isError: true
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}\n\nStack: ${error.stack}`
        }
      ],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Figma MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});

