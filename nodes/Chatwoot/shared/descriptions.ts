import type { INodeProperties } from 'n8n-workflow';

/**
 * Account selector using resourceLocator (From List / By ID in single field)
 */
export const accountSelector: INodeProperties = {
	displayName: 'Account',
	name: 'accountId',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	description: 'Select the account to use',
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select an account...',
			typeOptions: {
				searchListMethod: 'getAccounts',
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
};

/**
 * Inbox selector using resourceLocator (From List / By ID in single field)
 */
export const inboxSelector: INodeProperties = {
	displayName: 'Inbox',
	name: 'inboxId',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	description: 'Select the inbox to use',
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select an inbox...',
			typeOptions: {
				searchListMethod: 'getInboxes',
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
};

/**
 * Conversation selector using resourceLocator (From List / By ID in single field)
 */
export const conversationSelector: INodeProperties = {
	displayName: 'Conversation',
	name: 'conversationId',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	description: 'Select the conversation to use',
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a conversation...',
			typeOptions: {
				searchListMethod: 'getConversations',
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
};

/**
 * Contact selector using resourceLocator (From List / By ID in single field)
 */
export const contactSelector: INodeProperties = {
	displayName: 'Contact',
	name: 'contactId',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	description: 'Select the contact to use',
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a contact...',
			typeOptions: {
				searchListMethod: 'getContacts',
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
};

/**
 * Webhook selector using resourceLocator (From List / By ID in single field)
 */
export const webhookSelector: INodeProperties = {
	displayName: 'Webhook',
	name: 'webhookId',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	description: 'Select the webhook to use',
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a webhook...',
			typeOptions: {
				searchListMethod: 'getWebhooks',
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
};

/**
 * Webhook events multi-select
 */
export const webhookEventsSelect: INodeProperties = {
	displayName: 'Events',
	name: 'events',
	type: 'multiOptions',
	default: [],
	required: true,
	description: 'Select the events to subscribe to',
	options: [
		{ name: 'Contact Created', value: 'contact_created' },
		{ name: 'Contact Updated', value: 'contact_updated' },
		{ name: 'Conversation Created', value: 'conversation_created' },
		{ name: 'Conversation Status Changed', value: 'conversation_status_changed' },
		{ name: 'Conversation Updated', value: 'conversation_updated' },
		{ name: 'Message Created', value: 'message_created' },
		{ name: 'Message Updated', value: 'message_updated' },
		{ name: 'Webwidget Triggered', value: 'webwidget_triggered' },
	],
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
 * Additional fields collection - para campos extras opcionais
 */
export const additionalFieldsCollection: INodeProperties = {
	displayName: 'Additional Fields',
	name: 'additionalFields',
	type: 'collection',
	placeholder: 'Add Field',
	default: {},
	options: [],
};

/**
 * Conversation status options
 */
export const conversationStatusOptions: INodeProperties = {
	displayName: 'Status',
	name: 'status',
	type: 'options',
	default: 'open',
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

/**
 * Field filter mode - Select or Except
 */
export const fieldFilterMode: INodeProperties = {
	displayName: 'Field Filter Mode',
	name: 'fieldFilterMode',
	type: 'options',
	default: 'none',
	description: 'Choose how to filter the response fields',
	options: [
		{ name: 'None', value: 'none', description: 'Return all fields' },
		{ name: 'Select Fields', value: 'select', description: 'Only include selected fields' },
		{ name: 'Except Fields', value: 'except', description: 'Exclude selected fields' },
	],
};

/**
 * Select fields - multiOptions to select fields to include in response
 */
export const selectFieldsOption: INodeProperties = {
	displayName: 'Select Field Names or IDs',
	name: 'selectFields',
	type: 'multiOptions',
	default: [],
	description: 'Select the fields to include in the response. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	typeOptions: {
		loadOptionsMethod: 'getResponseFields',
	},
};

/**
 * Except fields - multiOptions to select fields to exclude from response
 */
export const exceptFieldsOption: INodeProperties = {
	displayName: 'Except Field Names or IDs',
	name: 'exceptFields',
	type: 'multiOptions',
	default: [],
	description: 'Select the fields to exclude from the response. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	typeOptions: {
		loadOptionsMethod: 'getResponseFields',
	},
};

/**
 * Response filter fields
 */
export const responseFilterFields: INodeProperties = {
	displayName: 'Response Filters',
	name: 'responseFilters',
	type: 'fixedCollection',
	placeholder: 'Add Response Filter',
	default: {},
	options: [
		{
			displayName: 'Field Filtering',
			name: 'fieldFiltering',
			values: [
				{
					displayName: 'Field Filter Mode',
					name: 'fieldFilterMode',
					type: 'options',
					default: 'none',
					description: 'Choose how to filter the response fields',
					options: [
						{ name: 'None', value: 'none', description: 'Return all fields' },
						{
							name: 'Select Fields',
							value: 'select',
							description: 'Only include selected fields',
						},
						{
							name: 'Except Fields',
							value: 'except',
							description: 'Exclude selected fields',
						},
					],
				},
				{
					displayName: 'Select Field Names or IDs',
					name: 'selectFields',
					type: 'multiOptions',
					default: [],
					description:
						'Select the fields to include in the response. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					typeOptions: {
						loadOptionsMethod: 'getResponseFields',
					},
					displayOptions: {
						show: {
							fieldFilterMode: ['select'],
						},
					},
				},
				{
					displayName: 'Except Field Names or IDs',
					name: 'exceptFields',
					type: 'multiOptions',
					default: [],
					description:
						'Select the fields to exclude from the response. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					typeOptions: {
						loadOptionsMethod: 'getResponseFields',
					},
					displayOptions: {
						show: {
							fieldFilterMode: ['except'],
						},
					},
				},
			],
		},
	],
};
