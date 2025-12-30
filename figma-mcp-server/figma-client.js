import axios from 'axios';

/**
 * Figma API Client
 * Handles all interactions with the Figma REST API
 */
export class FigmaClient {
  constructor(accessToken, fileKey) {
    this.accessToken = accessToken;
    this.fileKey = fileKey;
    this.baseURL = 'https://api.figma.com/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-Figma-Token': this.accessToken
      }
    });
  }

  /**
   * Get the full Figma file structure
   */
  async getFile() {
    try {
      const response = await this.client.get(`/files/${this.fileKey}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch Figma file: ${error.message}`);
    }
  }

  /**
   * Get specific nodes by their IDs
   */
  async getNodes(nodeIds) {
    try {
      const ids = Array.isArray(nodeIds) ? nodeIds.join(',') : nodeIds;
      const response = await this.client.get(`/files/${this.fileKey}/nodes`, {
        params: { ids }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch nodes: ${error.message}`);
    }
  }

  /**
   * Get images/assets from specific nodes
   */
  async getImages(nodeIds, options = {}) {
    try {
      const ids = Array.isArray(nodeIds) ? nodeIds.join(',') : nodeIds;
      const { format = 'svg', scale = 1 } = options;
      
      const response = await this.client.get(`/images/${this.fileKey}`, {
        params: { 
          ids,
          format,
          scale
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch images: ${error.message}`);
    }
  }

  /**
   * Get all styles defined in the file
   */
  async getFileStyles() {
    try {
      const file = await this.getFile();
      return file.styles || {};
    } catch (error) {
      throw new Error(`Failed to fetch styles: ${error.message}`);
    }
  }

  /**
   * Get components defined in the file
   */
  async getFileComponents() {
    try {
      const file = await this.getFile();
      return file.components || {};
    } catch (error) {
      throw new Error(`Failed to fetch components: ${error.message}`);
    }
  }

  /**
   * Search for nodes matching a specific type or name
   */
  findNodes(node, predicate, results = []) {
    if (predicate(node)) {
      results.push(node);
    }
    
    if (node.children) {
      for (const child of node.children) {
        this.findNodes(child, predicate, results);
      }
    }
    
    return results;
  }

  /**
   * Get all pages in the file
   */
  async getPages() {
    try {
      const file = await this.getFile();
      return file.document.children || [];
    } catch (error) {
      throw new Error(`Failed to fetch pages: ${error.message}`);
    }
  }

  /**
   * Get frames from a specific page
   */
  async getFramesFromPage(pageName) {
    try {
      const pages = await this.getPages();
      const page = pages.find(p => p.name === pageName);
      
      if (!page) {
        throw new Error(`Page "${pageName}" not found`);
      }
      
      return page.children.filter(child => child.type === 'FRAME');
    } catch (error) {
      throw new Error(`Failed to fetch frames: ${error.message}`);
    }
  }
}

