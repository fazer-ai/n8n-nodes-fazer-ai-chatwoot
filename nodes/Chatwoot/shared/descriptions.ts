import type { INodeProperties } from 'n8n-workflow';

/**
 * Helper function to create a fazer.ai custom operation notice
 * @param operationName - The name of the operation (e.g., "On WhatsApp", "Get QR Code")
 * @returns INodeProperties notice configuration
 */
export function chatwootFazerAiOnlyOperation(operationName: string): INodeProperties {
	return {
		displayName: `The ${operationName} operation requires <a href="https://github.com/fazer-ai/chatwoot/pkgs/container/chatwoot" target="_blank">Chatwoot fazer.ai</a>. If your instance already runs it, this works normally.`,
		name: 'fazerAiNotice',
		type: 'notice',
		default: '',
		typeOptions: {
			theme: 'info',
		},
	};
}

const resourceSelector = (displayName: string, name: string, description: string, searchListMethod: string, required = true) : INodeProperties => (
	{
		displayName,
		name,
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required,
		description: description,
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: `Select a${['a','e','i','o','u'].includes(displayName[0].toLowerCase()) ? 'n' : ''} ${displayName.toLocaleLowerCase()}...`,
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
							regex: '^[0-9]*$',
							errorMessage: 'The ID must be a number',
						},
					},
				],
			},
		],
	}
);

export const optionalResourceSelector = (displayName: string, name: string, description: string, searchListMethod: string): INodeProperties => (
	resourceSelector(displayName, name, description, searchListMethod, false)
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
 * Kanban Product selector using resourceLocator (From List / By ID in single field)
 */
export const kanbanProductSelector: INodeProperties = resourceSelector(
	'Kanban Product',
	'kanbanProductId',
	'Select the kanban product to use.',
	'searchKanbanProducts',
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
 * Kanban Task Product selector using resourceLocator (From List / By ID in single field)
 */
export const kanbanTaskProductSelector: INodeProperties = resourceSelector(
	'Kanban Task Product',
	'kanbanTaskProductId',
	'Select the task product to use.',
	'searchKanbanTaskProducts',
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
 * Scheduled Message selector using resourceLocator (From List / By ID in single field)
 */
export const scheduledMessageSelector: INodeProperties = resourceSelector(
	'Scheduled Message',
	'scheduledMessageId',
	'Select the scheduled message to use',
	'searchScheduledMessages',
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
 * Message Template selector using resourceLocator (From List / By Name)
 */
export const messageTemplateSelector: INodeProperties = {
	displayName: 'Template',
	name: 'templateName',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	description: 'Select the WhatsApp template to use',
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a template...',
			typeOptions: {
				searchListMethod: 'searchMessageTemplates',
				searchable: true,
			},
		},
		{
			displayName: 'By Name',
			name: 'name',
			type: 'string',
			placeholder: 'e.g. hello_world',
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '^[a-z0-9_]+$',
						errorMessage: 'Template name must contain only lowercase letters, numbers, and underscores',
					},
				},
			],
		},
	],
};

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
		{ name: 'Internal Chat Channel Updated', value: 'internal_chat_channel_updated' },
		{ name: 'Internal Chat Message Created', value: 'internal_chat_message_created' },
		{ name: 'Internal Chat Message Deleted', value: 'internal_chat_message_deleted' },
		{ name: 'Internal Chat Message Updated', value: 'internal_chat_message_updated' },
		{ name: 'Kanban Task Created', value: 'kanban_task_created' },
		{ name: 'Kanban Task Deleted', value: 'kanban_task_deleted' },
		{ name: 'Kanban Task Overdue', value: 'kanban_task_overdue' },
		{ name: 'Kanban Task Updated', value: 'kanban_task_updated' },
		{ name: 'Live Chat Widget Opened by the User', value: 'webwidget_triggered' },
		{	name: 'Message Created', value: 'message_created' },
		{ name: 'Message Incoming', value: 'message_incoming' },
		{ name: 'Message Outgoing', value: 'message_outgoing' },
		{ name: 'Message Updated', value: 'message_updated' },
		{ name: 'Provider Event Received', value: 'provider_event_received' },
	]
};

/**
 * Shared notice for all internal chat resources, signaling that the feature
 * requires the Chatwoot fazer.ai fork.
 */
export const internalChatNotice: INodeProperties = {
	displayName: 'Internal chat requires <a href="https://github.com/fazer-ai/chatwoot/pkgs/container/chatwoot" target="_blank">Chatwoot fazer.ai</a>. These resources work normally on instances that run it.',
	name: 'fazerAiNotice',
	type: 'notice',
	default: '',
	typeOptions: {
		theme: 'info',
	},
};

/**
 * Internal Chat Category selector using resourceLocator (From List / By ID in single field)
 */
export const internalChatCategorySelector: INodeProperties = resourceSelector(
	'Internal Chat Category',
	'internalChatCategoryId',
	'Select the internal chat category to use',
	'searchInternalChatCategories',
);

/**
 * Internal Chat Channel selector using resourceLocator (From List / By ID in single field)
 */
export const internalChatChannelSelector: INodeProperties = resourceSelector(
	'Internal Chat Channel',
	'internalChatChannelId',
	'Select the internal chat channel to use',
	'searchInternalChatChannels',
);

/**
 * Internal Chat Member selector using resourceLocator (From List / By ID in single field)
 */
export const internalChatMemberSelector: INodeProperties = resourceSelector(
	'Internal Chat Member',
	'internalChatMemberId',
	'Select the channel member to use',
	'searchInternalChatMembers',
);

/**
 * Internal Chat Message selector using resourceLocator (From List / By ID in single field)
 */
export const internalChatMessageSelector: INodeProperties = resourceSelector(
	'Internal Chat Message',
	'internalChatMessageId',
	'Select the internal chat message to use',
	'searchInternalChatMessages',
);

/**
 * Optional category selector for use inside collections (additionalFields/updateFields/filters).
 * Returns a fresh INodeProperties so call sites can override displayName/name/description
 * without leaving stale placeholders inside `modes`.
 */
export const internalChatCategoryOptionalSelector = (
	overrides: Partial<{ displayName: string; name: string; description: string }> = {},
): INodeProperties => optionalResourceSelector(
	overrides.displayName ?? 'Category',
	overrides.name ?? 'category_id',
	overrides.description ?? 'Category to assign the channel to',
	'searchInternalChatCategories',
);

/**
 * Optional message selector for use inside collections or as a non-required reference.
 * Returns a fresh INodeProperties so call sites can override displayName/name/description
 * without leaving stale placeholders inside `modes`.
 */
export const internalChatMessageOptionalSelector = (
	overrides: Partial<{ displayName: string; name: string; description: string }> = {},
): INodeProperties => optionalResourceSelector(
	overrides.displayName ?? 'Message',
	overrides.name ?? 'message_id',
	overrides.description ?? 'Internal chat message to reference',
	'searchInternalChatMessages',
);
