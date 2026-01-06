import type { INodeProperties } from 'n8n-workflow';

/**
 * Helper function to create a fazer.ai custom operation notice
 * @param operationName - The name of the operation (e.g., "On WhatsApp", "Get QR Code")
 * @returns INodeProperties notice configuration
 */
export function chatwootFazerAiOnlyOperation(operationName: string): INodeProperties {
	return {
		displayName: `The ${operationName} operation is only available on <a href="https://github.com/fazer-ai/chatwoot/pkgs/container/chatwoot" target="_blank">Chatwoot fazer.ai</a>`,
		name: 'fazerAiNotice',
		type: 'notice',
		default: '',
		typeOptions: {
			theme: 'info',
		},
	};
}

const resourceSelector = (displayName: string, name: string, description: string, searchListMethod: string) : INodeProperties => (
	{
		displayName,
		name,
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: description,
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: `Select an ${displayName.toLocaleLowerCase()}...`,
				typeOptions: {
					searchListMethod,
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'e.g. 1',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[0-9]+$',
							errorMessage: 'The ID must be a number',
						},
					},
				],
			},
		],
	}
);

/**
 * Kanban Board selector using resourceLocator (From List / By ID in single field)
 */
export const kanbanBoardSelector: INodeProperties = resourceSelector(
	'Kanban Board',
	'kanbanBoardId',
	'Select the kanban board to use.',
	'searchKanbanBoards',
);

/**
 * Kanban Step selector using resourceLocator (From List / By ID in single field)
 */
export const kanbanStepSelector: INodeProperties = resourceSelector(
	'Kanban Step',
	'kanbanStepId',
	'Select the kanban step to use.',
	'searchKanbanSteps',
);

/**
 * Kanban Task selector using resourceLocator (From List / By ID in single field)
 */
export const kanbanTaskSelector: INodeProperties = resourceSelector(
	'Kanban Task',
	'kanbanTaskId',
	'Select the kanban task to use.',
	'searchKanbanTasks',
);

/**
 * Account selector using resourceLocator (From List / By ID in single field)
 */
export const accountSelector: INodeProperties = resourceSelector(
	'Account',
	'accountId',
	'Select the account to use.',
	'searchAccounts',
);

/**
 * Inbox selector using resourceLocator (From List / By ID in single field)
 */
export const inboxSelector: INodeProperties =  resourceSelector(
	'Inbox',
	'inboxId',
	'Select the inbox to use',
	'searchInboxes',
);

/**
 * WhatsApp Baileys inbox selector using resourceLocator (From List / By ID in single field)
 * Only shows inboxes with channel_type="Channel::Whatsapp" and (provider="baileys" or provider="zapi")
 */
export const whatsappSpecialInboxInboxSelector: INodeProperties = resourceSelector(
	'WhatsApp Inbox',
	'whatsappSpecialInboxId',
	'Select the WhatsApp inbox to use (Baileys or Z-API provider)',
	'searchWhatsappSpecialProvidersInboxes',
);

/**
 * Conversation selector using resourceLocator (From List / By ID in single field)
 */
export const conversationSelector: INodeProperties = resourceSelector(
	'Conversation',
	'conversationId',
	'Select the conversation to use',
	'searchConversations',
);

/**
 * Contact selector using resourceLocator (From List / By ID in single field)
 */
export const contactSelector: INodeProperties = resourceSelector(
	'Contact',
	'contactId',
	'Select the contact to use',
	'searchContacts',
);

/**
 * Label selector using resourceLocator (From List / By ID in single field)
 */
export const labelSelector: INodeProperties = resourceSelector(
	'Label',
	'labelId',
	'Select the label to use',
	'searchLabels',
);

/**
 * Agent selector using resourceLocator (From List / By ID in single field)
 */
export const agentSelector: INodeProperties = resourceSelector(
	'Agent',
	'agentId',
	'Select the agent to use',
	'searchAgents',
);

/**
 * Team Member selector using resourceLocator (From List / By ID in single field)
 */
export const teamMemberSelector: INodeProperties = resourceSelector(
	'Team Member',
	'teamMemberId',
	'Select the team member to use',
	'searchTeamMembers',
);

/**
 * Team selector using resourceLocator (From List / By ID in single field)
 */
export const teamSelector: INodeProperties = resourceSelector(
	'Team',
	'teamId',
	'Select the team to use',
	'searchTeams',
);

/**
 * Webhook selector using resourceLocator (From List / By ID in single field)
 */
export const webhookSelector: INodeProperties = resourceSelector(
	'Webhook',
	'webhookId',
	'Select the webhook to use',
	'searchWebhooks',
);

/**
 * Webhook events multi-select
 */
export const webhookEventsSelector: INodeProperties = {
	displayName: 'Events',
	name: 'events',
	type: 'multiOptions',
	default: [],
	required: true,
	description: 'Select the events to listen for',
	options: [
		{ name: 'Contact Created', value: 'contact_created' },
		{ name: 'Contact Updated', value: 'contact_updated' },
		{ name: 'Conversation Created', value: 'conversation_created' },
		{ name: 'Conversation Status Changed', value: 'conversation_status_changed' },
		{ name: 'Conversation Typing Off', value: 'conversation_typing_off' },
		{ name: 'Conversation Typing On', value: 'conversation_typing_on' },
		{ name: 'Conversation Updated', value: 'conversation_updated' },
		{ name: 'Incoming Message', value: 'message_incoming' },
		{ name: 'Kanban Task Created', value: 'kanban_task_created' },
		{ name: 'Kanban Task Deleted', value: 'kanban_task_deleted' },
		{	name: 'Kanban Task Updated', value: 'kanban_task_updated' },
		{ name: 'Live Chat Widget Opened by the User', value: 'webwidget_triggered' },
		{	name: 'Message Created', value: 'message_created' },
		{ name: 'Message Updated', value: 'message_updated' },
		{ name: 'Outgoing Message', value: 'message_outgoing' },
		{ name: 'Provider Event Received', value: 'provider_event_received' },
	]
};

/**
 * Custom attributes - campo JSON para atributos personalizados
 */
export const customAttributesField: INodeProperties = {
	displayName: 'Custom Attributes',
	name: 'customAttributes',
	type: 'json',
	default: '{}',
	description: 'Custom attributes as JSON object',
};

/**
 * Conversation status options
 */
export const conversationStatusOptions: INodeProperties = {
	displayName: 'Status',
	name: 'status',
	type: 'options',
	default: 'resolved',
	options: [
		{ name: 'Open', value: 'open' },
		{ name: 'Resolved', value: 'resolved' },
		{ name: 'Pending', value: 'pending' },
		{ name: 'Snoozed', value: 'snoozed' },
	],
};

/**
 * Message type options
 */
export const messageTypeOptions: INodeProperties = {
	displayName: 'Message Type',
	name: 'messageType',
	type: 'options',
	default: 'outgoing',
	options: [
		{ name: 'Outgoing', value: 'outgoing' },
		{ name: 'Incoming', value: 'incoming' },
		{ name: 'Activity', value: 'activity' },
	],
};

/**
 * Typing status options
 */
export const typingStatusOptions: INodeProperties = {
	displayName: 'Typing Status',
	name: 'typingStatus',
	type: 'options',
	default: 'on',
	options: [
		{ name: 'Typing On', value: 'on' },
		{ name: 'Typing Off', value: 'off' },
	],
};

/**
 * Presence status options
 */
export const presenceStatusOptions: INodeProperties = {
	displayName: 'Presence Status',
	name: 'presenceStatus',
	type: 'options',
	default: 'online',
	options: [
		{ name: 'Online', value: 'online' },
		{ name: 'Offline', value: 'offline' },
		{ name: 'Busy', value: 'busy' },
	],
};
