import {
	NodeConnectionTypes,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

import type {
	ChatwootResources,
	AccountOperation,
	AgentOperation,
	ContactOperation,
	ConversationOperation,
	CustomAttributeOperation,
	InboxOperation,
	KanbanBoardOperation,
	KanbanStepOperation,
	KanbanTaskOperation,
	LabelOperation,
	ProfileOperation,
	TeamOperation,
} from './actions/node.type';

import { profileDescription, executeProfileOperation } from './actions/profile';
import { accountDescription, executeAccountOperation } from './actions/account';
import { agentDescription, executeAgentOperation } from './actions/agent';
import { inboxDescription, executeInboxOperation } from './actions/inbox';
import { contactDescription, executeContactOperation } from './actions/contact';
import { conversationDescription, executeConversationOperation } from './actions/conversation';
import { customAttributeDescription, executeCustomAttributeOperation } from './actions/customAttribute';
import { labelDescription, executeLabelOperation } from './actions/label';
import { kanbanBoardDescription, executeKanbanBoardOperation } from './actions/kanbanBoard';
import { kanbanStepDescription, executeKanbanStepOperation } from './actions/kanbanStep';
import { kanbanTaskDescription, executeKanbanTaskOperation } from './actions/kanbanTask';
import { teamDescription, executeTeamOperation } from './actions/team';
import { listSearch, loadOptions } from './methods';

/**
 * Node for interacting with the Chatwoot REST API.
 */
export class Chatwoot implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Chatwoot fazer.ai',
		name: 'chatwoot',
		icon: { light: 'file:../../icons/fazer-ai.svg', dark: 'file:../../icons/fazer-ai-dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Interact with the Chatwoot API',
		defaults: {
			name: 'Chatwoot',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'fazerAiChatwootApi',
				required: true,
			},
		],
		codex: {
			categories: ['Communication', 'Utility'],
		},
		usableAsTool: true,
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
						name: 'Agent',
						value: 'agent',
						description: 'Manage agents in account',
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
						name: 'Kanban Board',
						value: 'kanbanBoard',
						description: 'Manage Kanban boards',
					},
					{
						name: 'Kanban Step',
						value: 'kanbanStep',
						description: 'Manage Kanban steps',
					},
					{
						name: 'Kanban Task',
						value: 'kanbanTask',
						description: 'Manage Kanban tasks',
					},
					{
						name: 'Label',
						value: 'label',
						description: 'Manage labels',
					},
					{
						name: 'Profile',
						value: 'profile',
						description: 'Access user profile and authentication info',
					},
					{
						name: 'Team',
						value: 'team',
						description: 'Manage teams and team members',
					},
				],
				default: 'conversation',
			},
			...profileDescription,
			...accountDescription,
			...agentDescription,
			...inboxDescription,
			...contactDescription,
			...conversationDescription,
			...customAttributeDescription,
			...labelDescription,
			...kanbanBoardDescription,
			...kanbanStepDescription,
			...kanbanTaskDescription,
			...teamDescription,
		],
	};

	methods = {
		listSearch,
		loadOptions,
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
				let responseData: INodeExecutionData | INodeExecutionData[];
				switch (resource) {
					case 'profile':
						responseData = await executeProfileOperation(this, operation as ProfileOperation);
						break;
					case 'account':
						responseData = await executeAccountOperation(this, operation as AccountOperation, i);
						break;
					case 'agent':
						responseData = await executeAgentOperation(this, operation as AgentOperation, i);
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
					case 'customAttribute':
						responseData = await executeCustomAttributeOperation(this, operation as CustomAttributeOperation, i);
						break;
					case 'label':
						responseData = await executeLabelOperation(this, operation as LabelOperation, i);
						break;
					case 'kanbanBoard':
						responseData = await executeKanbanBoardOperation(this, operation as KanbanBoardOperation, i);
						break;
					case 'kanbanStep':
						responseData = await executeKanbanStepOperation(this, operation as KanbanStepOperation, i);
						break;
					case 'kanbanTask':
						responseData = await executeKanbanTaskOperation(this, operation as KanbanTaskOperation, i);
						break;
					case 'team':
						responseData = await executeTeamOperation(this, operation as TeamOperation, i);
						break;
				}

				if (Array.isArray(responseData)) {
					returnData.push(...responseData);
				} else {
					returnData.push(responseData);
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
