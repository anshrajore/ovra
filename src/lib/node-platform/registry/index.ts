/**
 * Central Versioned NodeRegistry for OVRA Node Platform
 */

import {
  OVRANodeDefinition,
  ConnectorManifest,
  NodeManifest,
} from "../contracts";

class NodeRegistrySingleton {
  private nodes: Map<string, OVRANodeDefinition> = new Map();
  private connectors: Map<string, ConnectorManifest> = new Map();

  /**
   * Register an official or validated declarative node
   */
  public registerNode(node: OVRANodeDefinition): void {
    const key = `${node.manifest.id}@${node.manifest.version}`;
    this.nodes.set(key, node);
    // Also save latest alias
    this.nodes.set(node.manifest.id, node);
  }

  /**
   * Register a connector (the parent application/service)
   */
  public registerConnector(connector: ConnectorManifest): void {
    this.connectors.set(connector.id, connector);
  }

  /**
   * Retrieve a node by unique ID and optional semantic version
   */
  public getNode(id: string, version?: string): OVRANodeDefinition | undefined {
    if (version) {
      return this.nodes.get(`${id}@${version}`) || this.nodes.get(id);
    }
    return this.nodes.get(id);
  }

  /**
   * Retrieve a connector by ID
   */
  public getConnector(id: string): ConnectorManifest | undefined {
    return this.connectors.get(id);
  }

  /**
   * List all registered connectors
   */
  public listConnectors(category?: string): ConnectorManifest[] {
    const all = Array.from(this.connectors.values());
    if (!category || category === "all") return all;
    return all.filter((c) => c.category === category);
  }

  /**
   * List all registered node manifests
   */
  public listNodes(options?: {
    category?: string;
    kind?: string;
    connectorId?: string;
  }): NodeManifest[] {
    // Collect unique node manifests by ID (latest version)
    const manifests = new Map<string, NodeManifest>();
    for (const [key, node] of this.nodes.entries()) {
      if (!key.includes("@")) {
        manifests.set(node.manifest.id, node.manifest);
      }
    }

    let list = Array.from(manifests.values());

    if (options?.category && options.category !== "all") {
      list = list.filter((m) => m.category === options.category);
    }
    if (options?.kind && options.kind !== "all") {
      list = list.filter((m) => m.kind === options.kind);
    }
    if (options?.connectorId) {
      list = list.filter((m) => m.connector === options.connectorId);
    }

    return list;
  }

  /**
   * Search across applications and individual node operations
   */
  public searchNodes(query: string): Array<{
    node: NodeManifest;
    connector?: ConnectorManifest;
  }> {
    if (!query.trim()) {
      return this.listNodes().map((node) => ({
        node,
        connector: this.getConnector(node.connector),
      }));
    }

    const q = query.toLowerCase().trim();
    const results: Array<{ node: NodeManifest; connector?: ConnectorManifest }> = [];

    for (const node of this.listNodes()) {
      const conn = this.getConnector(node.connector);
      const connName = conn?.name?.toLowerCase() || "";
      const matches =
        node.name.toLowerCase().includes(q) ||
        node.description.toLowerCase().includes(q) ||
        node.operationId.toLowerCase().includes(q) ||
        node.connector.toLowerCase().includes(q) ||
        connName.includes(q);

      if (matches) {
        results.push({ node, connector: conn });
      }
    }

    return results;
  }
}

export const nodeRegistry = new NodeRegistrySingleton();
