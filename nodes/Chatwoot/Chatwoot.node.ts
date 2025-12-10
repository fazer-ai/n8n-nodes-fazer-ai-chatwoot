import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { profileDescription } from './resources/profile';
import { executeProfileOperation } from './resources/profile/operations';
import { accountDescription } from './resources/account';
import { executeAccountOperation } from './resources/account/operations';
import { inboxDescription } from './resources/inbox';
import { executeInboxOperation } from './resources/inbox/operations';
import { contactDescription } from './resources/contact';
import { executeContactOperation } from './resources/contact/operations';
import { conversationDescription } from './resources/conversation';
import { executeConversationOperation } from './resources/conversation/operations';
import { messageDescription } from './resources/message';
import { executeMessageOperation } from './resources/message/operations';
import { webhookDescription } from './resources/webhook';
import { executeWebhookOperation } from './resources/webhook/operations';
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
					responseData = await executeProfileOperation(this, operation);
					break;
				case 'account':
					responseData = await executeAccountOperation(this, operation, i);
					break;
				case 'inbox':
					responseData = await executeInboxOperation(this, operation, i);
					break;
				case 'contact':
					responseData = await executeContactOperation(this, operation, i);
					break;
				case 'conversation':
					responseData = await executeConversationOperation(this, operation, i);
					break;
				case 'message':
					responseData = await executeMessageOperation(this, operation, i);
					break;
				case 'webhook':
					responseData = await executeWebhookOperation(this, operation, i);
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
