import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import type {
	ChatwootResources,
	AccountOperation,
	ContactOperation,
	ConversationOperation,
	CustomAttributeOperation,
	InboxOperation,
	LabelOperation,
	MessageOperation,
	ProfileOperation,
	WebhookOperation,
} from './resources/types';

import { profileDescription, executeProfileOperation } from './resources/profile';
import { accountDescription, executeAccountOperation } from './resources/account';
import { inboxDescription, executeInboxOperation } from './resources/inbox';
import { contactDescription, executeContactOperation } from './resources/contact';
import { conversationDescription, executeConversationOperation } from './resources/conversation';
import { messageDescription, executeMessageOperation } from './resources/message';
import { /*webhookDescription,*/ executeWebhookOperation } from './resources/webhook';
import { customAttributeDescription, executeCustomAttributeOperation } from './resources/customAttribute';
import { labelDescription, executeLabelOperation } from './resources/label';

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
					// {
					// 	name: 'Webhook',
					// 	value: 'webhook',
					// 	description: 'Manage webhooks for event subscriptions',
					// },
				],
				default: 'conversation',
			},
			...profileDescription,
			...accountDescription,
			...inboxDescription,
			...contactDescription,
			...conversationDescription,
			...messageDescription,
			// ...webhookDescription,
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
		const resource = this.getNodeParameter('resource', 0) as ChatwootResources;
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];
				switch (resource) {
					case 'profile':
						responseData = await executeProfileOperation(this, operation as ProfileOperation);
						break;
					case 'account':
						responseData = await executeAccountOperation(this, operation as AccountOperation, i);
						break;
					case 'inbox':
						responseData = await executeInboxOperation(this, operation as InboxOperation, i);
						break;
					case 'contact':
						responseData = await executeContactOperation(this, operation as ContactOperation, i);
						break;
					case 'conversation':
						responseData = await executeConversationOperation(this, operation as ConversationOperation, i);
						break;
					case 'message':
						responseData = await executeMessageOperation(this, operation as MessageOperation, i);
						break;
					case 'webhook':
						responseData = await executeWebhookOperation(this, operation as WebhookOperation, i);
						break;
					case 'customAttribute':
						responseData = await executeCustomAttributeOperation(this, operation as CustomAttributeOperation, i);
						break;
					case 'label':
						responseData = await executeLabelOperation(this, operation as LabelOperation, i);
						break;
					case 'kanban':
						responseData = await executeKanbanOperation(this, operation as KanbanOperation, i);
						break;
				}
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
