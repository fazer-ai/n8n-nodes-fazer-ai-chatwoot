import { ILoadOptionsFunctions, INodePropertyOptions } from "n8n-workflow";
import {
  extractResourceLocatorValue,
  ChatwootPayloadResponse,
  ChatwootAgent,
  ChatwootInbox,
  ChatwootCustomAttributeDefinition,
  ChatwootLabel,
  ChatwootTeam  } from "./resourceMapping";
import { chatwootApiRequest } from "../shared/transport";

/**
 * Get all agents for the selected account (for loadOptions)
 */
export async function loadAgentsOptions(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const accountId = extractResourceLocatorValue(this, 'accountId');
  if (!accountId) {
    return [];
  }

  const response = (await chatwootApiRequest.call(
    this,
    'GET',
    `/api/v1/accounts/${accountId}/agents`,
  )) as ChatwootAgent[];
  const agents = response || [];

  return agents.map((agent: ChatwootAgent) => ({
    name: agent.name || agent.email || `Agent ${agent.id}`,
    value: agent.id,
  }));
}

/**
 * Get all inboxes for the selected account (for loadOptions)
 */
export async function loadInboxesOptions(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const accountId = extractResourceLocatorValue(this, 'accountId');
  if (!accountId) {
    return [];
  }

  const response = (await chatwootApiRequest.call(
    this,
    'GET',
    `/api/v1/accounts/${accountId}/inboxes`,
  )) as ChatwootPayloadResponse<ChatwootInbox>;
  const inboxes = response.payload ||[];

  return (inboxes as ChatwootInbox[]).map((inbox: ChatwootInbox) => ({
    name: inbox.name,
    value: inbox.id,
  }));
}

/**
 * Get all teams for the selected account (for loadOptions)
 */
export async function loadTeamsOptions(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const accountId = extractResourceLocatorValue(this, 'accountId');
  if (!accountId) {
    return [];
  }

  const response = (await chatwootApiRequest.call(
    this,
    'GET',
    `/api/v1/accounts/${accountId}/teams`,
  )) as ChatwootTeam[];
  const teams = response || [];

  return teams.map((team: ChatwootTeam) => ({
    name: team.name,
    value: team.id,
  }));
}


/**
 * Get all labels for the selected account (for loadOptions)
 */
export async function loadLabelsOptions(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const accountId = extractResourceLocatorValue(this, 'accountId');
  if (!accountId) {
    return [];
  }

  const response = (await chatwootApiRequest.call(
    this,
    'GET',
    `/api/v1/accounts/${accountId}/labels`,
  )) as ChatwootPayloadResponse<ChatwootLabel> | ChatwootLabel[];
  const labels =
    (response as ChatwootPayloadResponse<ChatwootLabel>).payload ||
    (response as ChatwootLabel[]) ||
    [];

  return (labels as ChatwootLabel[]).map((label: ChatwootLabel) => ({
    name: label.title,
    value: label.title,
  }));
}

/**
 * Get contact custom attribute definitions for the selected account (for loadOptions)
 */
export async function loadContactCustomAttributeDefinitionsOptions(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const accountId = extractResourceLocatorValue(this, 'accountId');
  if (!accountId) {
    return [];
  }

  const response = (await chatwootApiRequest.call(
    this,
    'GET',
    `/api/v1/accounts/${accountId}/custom_attribute_definitions`,
    undefined,
    { attribute_model: 'contact_attribute' },
  )) as ChatwootCustomAttributeDefinition[];

  return (response || []).map((attr: ChatwootCustomAttributeDefinition) => ({
    name: attr.attribute_display_name,
    value: attr.attribute_key,
  }));
}

/**
 * Get custom attribute definitions based on selected model
 */
export async function loadCustomAttributeDefinitionsOptions(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const accountId = extractResourceLocatorValue(this, 'accountId');
  if (!accountId) {
    return [];
  }

  const attributeModel = this.getNodeParameter('attributeModel', 0) as string;

  const response = (await chatwootApiRequest.call(
    this,
    'GET',
    `/api/v1/accounts/${accountId}/custom_attribute_definitions`,
    undefined,
    { attribute_model: attributeModel },
  )) as ChatwootCustomAttributeDefinition[];

  return (response || []).map((attr: ChatwootCustomAttributeDefinition) => ({
    name: attr.attribute_display_name,
    value: attr.id,
  }));
}
