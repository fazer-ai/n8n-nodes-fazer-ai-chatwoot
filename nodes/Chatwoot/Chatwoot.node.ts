import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { profileDescription } from './resources/profile';
import { accountDescription } from './resources/account';
import { inboxDescription } from './resources/inbox';
import { contactDescription } from './resources/contact';
import { conversationDescription } from './resources/conversation';
import { messageDescription } from './resources/message';
import { webhookDescription } from './resources/webhook';
import { customAttributeDescription } from './resources/customAttribute';
import { labelDescription } from './resources/label';

import {
	getAccounts,
	getInboxes,
	getConversations,
	getContacts,
	getAgents,
	getTeams,
	getLabels,
	getWebhooks,
	getResponseFields,
} from './listSearch';

import {
	chatwootApiRequest,
	getAccountId,
	getInboxId,
	getConversationId,
	getContactId,
	getWebhookId,
} from './shared/transport';

import { filterResponseFields } from './shared/utils';

/**
 * Node for interacting with the Chatwoot REST API.
 */
export class Chatwoot implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Chatwoot fazer.ai',
		name: 'chatwoot',
		icon: 'file:../../icons/chatwoot.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Interact with the Chatwoot API',
		defaults: {
			name: 'Chatwoot',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'chatwootApi',
				required: true,
			},
		],
		codex: {
			categories: ['Communication', 'Utility'],
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
						description: 'Manage Chatwoot accounts',
					},
					{
						name: 'Contact',
						value: 'contact',
						description: 'Manage contacts',
					},
					{
						name: 'Conversation',
						value: 'conversation',
						description: 'Manage conversations',
					},
					{
						name: 'Custom Attribute',
						value: 'customAttribute',
						description: 'Manage custom attributes on contacts and conversations',
					},
					{
						name: 'Inbox',
						value: 'inbox',
						description: 'Manage inboxes',
					},
					{
						name: 'Label',
						value: 'label',
						description: 'Manage labels',
					},
					{
						name: 'Message',
						value: 'message',
						description: 'Send and manage messages',
					},
					{
						name: 'Profile',
						value: 'profile',
						description: 'Access user profile and authentication info',
					},
					{
						name: 'Webhook',
						value: 'webhook',
						description: 'Manage webhooks for event subscriptions',
					},
				],
				default: 'conversation',
			},
			...profileDescription,
			...accountDescription,
			...inboxDescription,
			...contactDescription,
			...conversationDescription,
			...messageDescription,
			...webhookDescription,
			...customAttributeDescription,
			...labelDescription,
		],
		usableAsTool: true,
	};

	methods = {
		listSearch: {
			getAccounts,
			getInboxes,
			getConversations,
			getContacts,
			getWebhooks,
		},
		loadOptions: {
			getAgents,
			getTeams,
			getLabels,
			getResponseFields,
		},
	};

	/**
	 * Dispatches each incoming item to the selected Chatwoot resource/operation and wraps the API response for n8n.
	 */
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[] | undefined;

				switch (resource) {
				case 'profile':
					switch (operation) {
					case 'fetch': {
						responseData = (await chatwootApiRequest.call(
							this,
							'GET',
							'/api/v1/profile',
						)) as IDataObject;
						break;
					}
					}
					break;
				case 'account':
					switch (operation) {
					case 'getAll': {
						const profile = (await chatwootApiRequest.call(
							this,
							'GET',
							'/api/v1/profile',
						)) as IDataObject;
						responseData = (profile.accounts as IDataObject[]) || [];
						break;
					}
					case 'get': {
						const accountId = getAccountId.call(this, i);
						responseData = (await chatwootApiRequest.call(
							this,
							'GET',
							`/api/v1/accounts/${accountId}`,
						)) as IDataObject;
						break;
					}
					}
					break;
				case 'inbox':
					switch (operation) {
					case 'list': {
						const accountId = getAccountId.call(this, i);
						const response = (await chatwootApiRequest.call(
							this,
							'GET',
							`/api/v1/accounts/${accountId}/inboxes`,
						)) as IDataObject;
						responseData = (response.payload as IDataObject[]) || response;
						break;
					}
					case 'get': {
						const accountId = getAccountId.call(this, i);
						const inboxId = getInboxId.call(this, i);
						responseData = (await chatwootApiRequest.call(
							this,
							'GET',
							`/api/v1/accounts/${accountId}/inboxes/${inboxId}`,
						)) as IDataObject;
						break;
					}
					}
					break;
				case 'contact':
					switch (operation) {
					case 'create': {
						const accountId = getAccountId.call(this, i);
						const useRawJson = this.getNodeParameter('useRawJson', i, false) as boolean;

						let body: IDataObject;
						if (useRawJson) {
							body = JSON.parse(this.getNodeParameter('jsonBody', i, '{}') as string);
						} else {
							body = {
								name: this.getNodeParameter('name', i, '') as string,
								email: this.getNodeParameter('email', i, '') as string,
								phone_number: this.getNodeParameter('phoneNumber', i, '') as string,
							};

							const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
							Object.assign(body, additionalFields);

							if (typeof body.customAttributes === 'string') {
								body.custom_attributes = JSON.parse(body.customAttributes as string);
								delete body.customAttributes;
							}
						}

						Object.keys(body).forEach((key) => {
							if (body[key] === '' || body[key] === undefined) {
								delete body[key];
							}
						});

						responseData = (await chatwootApiRequest.call(
							this,
							'POST',
							`/api/v1/accounts/${accountId}/contacts`,
							body,
						)) as IDataObject;
						break;
					}
					case 'get': {
						const accountId = getAccountId.call(this, i);
						const contactId = getContactId.call(this, i);
						responseData = (await chatwootApiRequest.call(
							this,
							'GET',
							`/api/v1/accounts/${accountId}/contacts/${contactId}`,
						)) as IDataObject;
						break;
					}
					case 'getAll': {
						const accountId = getAccountId.call(this, i);
						const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
						const limit = this.getNodeParameter('limit', i, 50) as number;

						const query: IDataObject = {};
						if (!returnAll) {
							query.per_page = limit;
						}

						const response = (await chatwootApiRequest.call(
							this,
							'GET',
							`/api/v1/accounts/${accountId}/contacts`,
							undefined,
							query,
						)) as IDataObject;
						responseData = (response.payload as IDataObject[]) || response;
						break;
					}
					case 'update': {
						const accountId = getAccountId.call(this, i);
						const contactId = getContactId.call(this, i);
						const useRawJson = this.getNodeParameter('useRawJson', i, false) as boolean;

						let body: IDataObject;
						if (useRawJson) {
							body = JSON.parse(this.getNodeParameter('jsonBody', i, '{}') as string);
						} else {
							body = {};
							const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
							Object.assign(body, additionalFields);

							if (typeof body.customAttributes === 'string') {
								body.custom_attributes = JSON.parse(body.customAttributes as string);
								delete body.customAttributes;
							}
						}

						responseData = (await chatwootApiRequest.call(
							this,
							'PUT',
							`/api/v1/accounts/${accountId}/contacts/${contactId}`,
							body,
						)) as IDataObject;
						break;
					}
					case 'delete': {
						const accountId = getAccountId.call(this, i);
						const contactId = getContactId.call(this, i);
						await chatwootApiRequest.call(
							this,
							'DELETE',
							`/api/v1/accounts/${accountId}/contacts/${contactId}`,
						);
						responseData = { success: true };
						break;
					}
					case 'search': {
						const accountId = getAccountId.call(this, i);
						const searchQuery = this.getNodeParameter('searchQuery', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
						const limit = this.getNodeParameter('limit', i, 50) as number;

						const query: IDataObject = { q: searchQuery };
						if (!returnAll) {
							query.per_page = limit;
						}

						const response = (await chatwootApiRequest.call(
							this,
							'GET',
							`/api/v1/accounts/${accountId}/contacts/search`,
							undefined,
							query,
						)) as IDataObject;
						responseData = (response.payload as IDataObject[]) || response;
						break;
					}
					}
					break;
				case 'conversation':
					switch (operation) {
					case 'create': {
						const accountId = getAccountId.call(this, i);
						const useRawJson = this.getNodeParameter('useRawJson', i, false) as boolean;

						let body: IDataObject;
						if (useRawJson) {
							body = JSON.parse(this.getNodeParameter('jsonBody', i, '{}') as string);
						} else {
							const contactId = getContactId.call(this, i);
							body = {
								contact_id: contactId,
							};

							const inboxId = getInboxId.call(this, i);
							if (inboxId) {
								body.inbox_id = inboxId;
							}

							const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
							Object.assign(body, additionalFields);

							if (typeof body.customAttributes === 'string') {
								body.custom_attributes = JSON.parse(body.customAttributes as string);
								delete body.customAttributes;
							}
						}

						responseData = (await chatwootApiRequest.call(
							this,
							'POST',
							`/api/v1/accounts/${accountId}/conversations`,
							body,
						)) as IDataObject;
						break;
					}
					case 'get': {
						const accountId = getAccountId.call(this, i);
						const conversationId = getConversationId.call(this, i);
						responseData = (await chatwootApiRequest.call(
							this,
							'GET',
							`/api/v1/accounts/${accountId}/conversations/${conversationId}`,
						)) as IDataObject;
						break;
					}
					case 'getAll': {
						const accountId = getAccountId.call(this, i);
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

						const query: IDataObject = {};
						if (filters.status) query.status = filters.status;
						if (filters.assignee_type) query.assignee_type = filters.assignee_type;
						if (filters.page) query.page = filters.page;

						const inboxId = getInboxId.call(this, i);
						if (inboxId) {
							query.inbox_id = inboxId;
						}

						const response = (await chatwootApiRequest.call(
							this,
							'GET',
							`/api/v1/accounts/${accountId}/conversations`,
							undefined,
							query,
						)) as IDataObject;

						const dataObj = response.data as IDataObject | undefined;
						responseData = dataObj?.payload as IDataObject[] ||
									response.payload as IDataObject[] ||
									response;
						break;
					}
					case 'toggleStatus': {
						const accountId = getAccountId.call(this, i);
						const conversationId = getConversationId.call(this, i);
						const status = this.getNodeParameter('status', i) as string;

						responseData = (await chatwootApiRequest.call(
							this,
							'POST',
							`/api/v1/accounts/${accountId}/conversations/${conversationId}/toggle_status`,
							{ status },
						)) as IDataObject;
						break;
					}
					case 'assignAgent': {
						const accountId = getAccountId.call(this, i);
						const conversationId = getConversationId.call(this, i);
						const agentId = this.getNodeParameter('agentId', i) as number;

						responseData = (await chatwootApiRequest.call(
							this,
							'POST',
							`/api/v1/accounts/${accountId}/conversations/${conversationId}/assignments`,
							{ assignee_id: agentId },
						)) as IDataObject;
						break;
					}
					case 'assignTeam': {
						const accountId = getAccountId.call(this, i);
						const conversationId = getConversationId.call(this, i);
						const teamId = this.getNodeParameter('teamId', i) as number;

						responseData = (await chatwootApiRequest.call(
							this,
							'POST',
							`/api/v1/accounts/${accountId}/conversations/${conversationId}/assignments`,
							{ team_id: teamId },
						)) as IDataObject;
						break;
					}
					case 'addLabels': {
						const accountId = getAccountId.call(this, i);
						const conversationId = getConversationId.call(this, i);
						const labels = this.getNodeParameter('labels', i) as string[];

						responseData = (await chatwootApiRequest.call(
							this,
							'POST',
							`/api/v1/accounts/${accountId}/conversations/${conversationId}/labels`,
							{ labels },
						)) as IDataObject;
						break;
					}
					}
					break;
				case 'message':
					switch (operation) {
					case 'send': {
						const accountId = getAccountId.call(this, i);
						const conversationId = getConversationId.call(this, i);
						const useRawJson = this.getNodeParameter('useRawJson', i, false) as boolean;

						let body: IDataObject;
						if (useRawJson) {
							body = JSON.parse(this.getNodeParameter('jsonBody', i, '{}') as string);
						} else {
							const content = this.getNodeParameter('content', i) as string;
							const messageType = this.getNodeParameter('messageType', i) as string;
							const isPrivate = this.getNodeParameter('private', i, false) as boolean;

							body = {
								content,
								message_type: messageType,
								private: isPrivate,
							};

							const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

							if (additionalFields.content_type) {
								body.content_type = additionalFields.content_type;
							}
							if (additionalFields.content_attributes) {
								body.content_attributes = JSON.parse(additionalFields.content_attributes as string);
							}
							if (additionalFields.template_params) {
								body.template_params = JSON.parse(additionalFields.template_params as string);
							}
						}

						responseData = (await chatwootApiRequest.call(
							this,
							'POST',
							`/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`,
							body,
						)) as IDataObject;
						break;
					}
					case 'getAll': {
						const accountId = getAccountId.call(this, i);
						const conversationId = getConversationId.call(this, i);
						const options = this.getNodeParameter('options', i, {}) as IDataObject;

						const query: IDataObject = {};
						if (options.before) query.before = options.before;
						if (options.after) query.after = options.after;

						const response = (await chatwootApiRequest.call(
							this,
							'GET',
							`/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`,
							undefined,
							query,
						)) as IDataObject;
						responseData = (response.payload as IDataObject[]) || response;
						break;
					}
					case 'delete': {
						const accountId = getAccountId.call(this, i);
						const conversationId = getConversationId.call(this, i);
						const messageId = this.getNodeParameter('messageId', i) as number;

						await chatwootApiRequest.call(
							this,
							'DELETE',
							`/api/v1/accounts/${accountId}/conversations/${conversationId}/messages/${messageId}`,
						);
						responseData = { success: true };
						break;
					}
					case 'setTyping': {
						const accountId = getAccountId.call(this, i);
						const conversationId = getConversationId.call(this, i);
						const typingStatus = this.getNodeParameter('typingStatus', i) as string;

						responseData = (await chatwootApiRequest.call(
							this,
							'POST',
							`/api/v1/accounts/${accountId}/conversations/${conversationId}/toggle_typing_status`,
							{ typing_status: typingStatus },
						)) as IDataObject;
						break;
					}
					case 'updatePresence': {
						const accountId = getAccountId.call(this, i);
						const conversationId = getConversationId.call(this, i);

						responseData = (await chatwootApiRequest.call(
							this,
							'POST',
							`/api/v1/accounts/${accountId}/conversations/${conversationId}/update_last_seen`,
						)) as IDataObject;
						break;
					}
					}
					break;
				case 'webhook':
					switch (operation) {
					case 'create': {
						const accountId = getAccountId.call(this, i);
						const useRawJson = this.getNodeParameter('useRawJson', i, false) as boolean;

						let body: IDataObject;
						if (useRawJson) {
							body = JSON.parse(this.getNodeParameter('jsonBody', i, '{}') as string);
						} else {
							const webhookUrl = this.getNodeParameter('webhookUrl', i) as string;
							const events = this.getNodeParameter('events', i) as string[];

							body = {
								url: webhookUrl,
								subscriptions: events,
							};

							const filterByInbox = this.getNodeParameter('filterByInbox', i, false) as boolean;
							if (filterByInbox) {
								const inboxId = getInboxId.call(this, i);
								if (inboxId) {
									body.inbox_id = inboxId;
								}
							}
						}

						responseData = (await chatwootApiRequest.call(
							this,
							'POST',
							`/api/v1/accounts/${accountId}/webhooks`,
							body,
						)) as IDataObject;
						break;
					}
					case 'getAll': {
						const accountId = getAccountId.call(this, i);
						const response = (await chatwootApiRequest.call(
							this,
							'GET',
							`/api/v1/accounts/${accountId}/webhooks`,
						)) as IDataObject;
						responseData = (response.payload as IDataObject[]) || response;
						break;
					}
					case 'update': {
						const accountId = getAccountId.call(this, i);
						const webhookId = getWebhookId.call(this, i);
						const useRawJson = this.getNodeParameter('useRawJson', i, false) as boolean;

						let body: IDataObject;
						if (useRawJson) {
							body = JSON.parse(this.getNodeParameter('jsonBody', i, '{}') as string);
						} else {
							const webhookUrl = this.getNodeParameter('webhookUrl', i) as string;
							const events = this.getNodeParameter('events', i) as string[];

							body = {
								url: webhookUrl,
								subscriptions: events,
							};

							const filterByInbox = this.getNodeParameter('filterByInbox', i, false) as boolean;
							if (filterByInbox) {
								const inboxId = getInboxId.call(this, i);
								if (inboxId) {
									body.inbox_id = inboxId;
								}
							}
						}

						responseData = (await chatwootApiRequest.call(
							this,
							'PUT',
							`/api/v1/accounts/${accountId}/webhooks/${webhookId}`,
							body,
						)) as IDataObject;
						break;
					}
					case 'delete': {
						const accountId = getAccountId.call(this, i);
						const webhookId = getWebhookId.call(this, i);

						await chatwootApiRequest.call(
							this,
							'DELETE',
							`/api/v1/accounts/${accountId}/webhooks/${webhookId}`,
						);
						responseData = { success: true };
						break;
					}
					}
					break;
				case 'customAttribute':
					switch (operation) {
					case 'createDefinition': {
						const accountId = getAccountId.call(this, i);
						const useRawJson = this.getNodeParameter('useRawJson', i, false) as boolean;

						let body: IDataObject;
						if (useRawJson) {
							body = JSON.parse(this.getNodeParameter('jsonBody', i, '{}') as string);
						} else {
							const attributeModel = this.getNodeParameter('attributeModel', i) as string;
							const attributeDisplayName = this.getNodeParameter('attributeDisplayName', i) as string;
							const attributeKey = this.getNodeParameter('attributeKey', i) as string;
							const attributeType = this.getNodeParameter('attributeType', i) as string;
							const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

							body = {
								attribute_display_name: attributeDisplayName,
								attribute_key: attributeKey,
								attribute_display_type: attributeType,
								attribute_model: attributeModel === 'contact_attribute' ? 0 : 1,
							};

							if (attributeType === 'list') {
								const attributeValuesInput = this.getNodeParameter('attributeValues', i) as
											| string
											| string[];
								const attributeValues = (
									Array.isArray(attributeValuesInput)
										? attributeValuesInput
										: [attributeValuesInput]
								).filter((value) => value !== '');

								if (attributeValues.length) {
									body.attribute_values = attributeValues;
								}
							}

							const attributeDescription = additionalFields.attributeDescription as string | undefined;
							if (attributeDescription) {
								body.attribute_description = attributeDescription;
							}
						}

						responseData = (await chatwootApiRequest.call(
							this,
							'POST',
							`/api/v1/accounts/${accountId}/custom_attribute_definitions`,
							body,
						)) as IDataObject;
						break;
					}
					case 'getDefinitions': {
						const accountId = getAccountId.call(this, i);
						const attributeModel = this.getNodeParameter('attributeModel', i) as string;

						const query: IDataObject = {
							attribute_model: attributeModel,
						};

						const response = (await chatwootApiRequest.call(
							this,
							'GET',
							`/api/v1/accounts/${accountId}/custom_attribute_definitions`,
							undefined,
							query,
						)) as IDataObject[];
						responseData = response;
						break;
					}
					case 'setOnContact': {
						const accountId = getAccountId.call(this, i);
						const contactId = getContactId.call(this, i);
						const customAttributes = JSON.parse(
									this.getNodeParameter('customAttributes', i) as string,
						);

						responseData = (await chatwootApiRequest.call(
							this,
							'PUT',
							`/api/v1/accounts/${accountId}/contacts/${contactId}`,
							{ custom_attributes: customAttributes },
						)) as IDataObject;
						break;
					}
					case 'setOnConversation': {
						const accountId = getAccountId.call(this, i);
						const conversationId = getConversationId.call(this, i);
						const customAttributes = JSON.parse(
									this.getNodeParameter('customAttributes', i) as string,
						);

						responseData = (await chatwootApiRequest.call(
							this,
							'POST',
							`/api/v1/accounts/${accountId}/conversations/${conversationId}/custom_attributes`,
							{ custom_attributes: customAttributes },
						)) as IDataObject;
						break;
					}
					case 'deleteDefinition': {
						const accountId = getAccountId.call(this, i);
						const attributeKey = this.getNodeParameter('attributeKey', i) as string;

						await chatwootApiRequest.call(
							this,
							'DELETE',
							`/api/v1/accounts/${accountId}/custom_attribute_definitions/${attributeKey}`,
						);
						responseData = { success: true };
						break;
					}
					}
					break;
				case 'label':
					switch (operation) {
					case 'create': {
						const accountId = getAccountId.call(this, i);
						const useRawJson = this.getNodeParameter('useRawJson', i, false) as boolean;

						let body: IDataObject;
						if (useRawJson) {
							body = JSON.parse(this.getNodeParameter('jsonBody', i, '{}') as string);
						} else {
							const title = this.getNodeParameter('title', i) as string;
							const additionalFields = this.getNodeParameter(
								'additionalFields',
								i,
							) as IDataObject;

							body = {
								title,
								...additionalFields,
							};
						}

						responseData = (await chatwootApiRequest.call(
							this,
							'POST',
							`/api/v1/accounts/${accountId}/labels`,
							body,
						)) as IDataObject;
						break;
					}
					case 'getAll': {
						const accountId = getAccountId.call(this, i);

						const response = (await chatwootApiRequest.call(
							this,
							'GET',
							`/api/v1/accounts/${accountId}/labels`,
						)) as IDataObject;
						responseData = (response.payload as IDataObject[]) || [];
						break;
					}
					case 'update': {
						const accountId = getAccountId.call(this, i);
						const labelId = this.getNodeParameter('labelId', i) as string;
						const useRawJson = this.getNodeParameter('useRawJson', i, false) as boolean;

						let body: IDataObject;
						if (useRawJson) {
							body = JSON.parse(this.getNodeParameter('jsonBody', i, '{}') as string);
						} else {
							body = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
						}

						responseData = (await chatwootApiRequest.call(
							this,
							'PATCH',
							`/api/v1/accounts/${accountId}/labels/${labelId}`,
							body,
						)) as IDataObject;
						break;
					}
					case 'delete': {
						const accountId = getAccountId.call(this, i);
						const labelId = this.getNodeParameter('labelId', i) as string;

						await chatwootApiRequest.call(
							this,
							'DELETE',
							`/api/v1/accounts/${accountId}/labels/${labelId}`,
						);
						responseData = { success: true };
						break;
					}
					}
					break;
				}

				if (responseData !== undefined) {
					const responseFilters = this.getNodeParameter(
						'responseFilters.fieldFiltering',
						i,
						{},
					) as IDataObject;

					const fieldFilterMode = responseFilters.fieldFilterMode as string;

					if (fieldFilterMode === 'select') {
						const selectFields = responseFilters.selectFields as string[];
						responseData = filterResponseFields(
							responseData,
							selectFields,
							undefined,
						) as IDataObject | IDataObject[];
					} else if (fieldFilterMode === 'except') {
						const exceptFields = responseFilters.exceptFields as string[];
						responseData = filterResponseFields(
							responseData,
							undefined,
							exceptFields,
						) as IDataObject | IDataObject[];
					}

					if (Array.isArray(responseData)) {
						returnData.push(...responseData.map((item) => ({ json: item })));
					} else {
						returnData.push({ json: responseData });
					}
				}

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
