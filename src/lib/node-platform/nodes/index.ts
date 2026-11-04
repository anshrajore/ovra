/**
 * Foundation Node Registration
 * Registers all 15 core and integration nodes into the central NodeRegistry
 */

import { nodeRegistry } from "../registry";
import {
  webhookConnector,
  webhookNode,
  manualTriggerConnector,
  manualTriggerNode,
  scheduleConnector,
  scheduleNode,
} from "./core-triggers";
import {
  logicConnector,
  ifNode,
  switchNode,
  mergeNode,
  loopNode,
} from "./core-logic";
import {
  dataConnector,
  setFieldsNode,
  jsonParserNode,
} from "./core-data";
import {
  httpConnector,
  httpRequestNode,
} from "./core-http";
import {
  aiConnector,
  aiModelNode,
  aiAgentNode,
} from "./core-ai";
import {
  slackConnector,
  slackNode,
  emailConnector,
  emailNode,
} from "./core-comm";
import {
  googleSheetsConnector,
  googleSheetsAppendRowNode,
  postgresConnector,
  postgresQueryNode,
} from "./core-apps";

let isRegistered = false;

export function registerFoundationNodes(): void {
  if (isRegistered) return;
  isRegistered = true;

  // 1. Connectors
  nodeRegistry.registerConnector(webhookConnector);
  nodeRegistry.registerConnector(manualTriggerConnector);
  nodeRegistry.registerConnector(scheduleConnector);
  nodeRegistry.registerConnector(logicConnector);
  nodeRegistry.registerConnector(dataConnector);
  nodeRegistry.registerConnector(httpConnector);
  nodeRegistry.registerConnector(aiConnector);
  nodeRegistry.registerConnector(slackConnector);
  nodeRegistry.registerConnector(emailConnector);
  nodeRegistry.registerConnector(googleSheetsConnector);
  nodeRegistry.registerConnector(postgresConnector);

  // 2. Nodes (15 Foundation Nodes)
  nodeRegistry.registerNode(manualTriggerNode);
  nodeRegistry.registerNode(webhookNode);
  nodeRegistry.registerNode(scheduleNode);
  nodeRegistry.registerNode(httpRequestNode);
  nodeRegistry.registerNode(ifNode);
  nodeRegistry.registerNode(switchNode);
  nodeRegistry.registerNode(mergeNode);
  nodeRegistry.registerNode(loopNode);
  nodeRegistry.registerNode(setFieldsNode);
  nodeRegistry.registerNode(jsonParserNode);
  nodeRegistry.registerNode(aiModelNode);
  nodeRegistry.registerNode(aiAgentNode);
  nodeRegistry.registerNode(emailNode);
  nodeRegistry.registerNode(slackNode);
  nodeRegistry.registerNode(googleSheetsAppendRowNode);
  nodeRegistry.registerNode(postgresQueryNode);
}

// Auto-register on import
registerFoundationNodes();

export {
  nodeRegistry,
  webhookNode,
  manualTriggerNode,
  scheduleNode,
  httpRequestNode,
  ifNode,
  switchNode,
  mergeNode,
  loopNode,
  setFieldsNode,
  jsonParserNode,
  aiModelNode,
  emailNode,
  slackNode,
  googleSheetsAppendRowNode,
  postgresQueryNode,
};
