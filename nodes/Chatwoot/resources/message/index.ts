import type { INodeProperties } from 'n8n-workflow';
import {
	accountSelector,
	conversationSelector,
	messageTypeOptions,
	typingStatusOptions,
	rawJsonBody,
	responseFilterFields,
} from '../../shared/descriptions';

const showOnlyForMessage = {
	resource: ['message'],
};

export const messageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForMessage,
		},
		options: [
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a message',
				action: 'Delete message',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many messages from a conversation',
				action: 'Get messages',
			},
			{
				name: 'Send',
				value: 'send',
				description: 'Send a new message in a conversation',
				action: 'Send message',
			},
			{
				name: 'Set Typing Status',
				value: 'setTyping',
				description: 'Set typing indicator on/off',
				action: 'Set typing status',
			},
			{
				name: 'Update Presence',
				value: 'updatePresence',
				description: 'Update last seen (mark as read)',
				action: 'Update presence',
			},
		],
		default: 'send',
	},
];

export const messageFields: INodeProperties[] = [
	{
		...accountSelector,
		displayOptions: {
			show: showOnlyForMessage,
		},
	},
	{
		...conversationSelector,
		displayOptions: {
			show: showOnlyForMessage,
		},
	},
	{
		displayName: 'Use Raw JSON',
		name: 'useRawJson',
		type: 'boolean',
		default: false,
		description: 'Whether to use raw JSON body instead of fields',
		displayOptions: {
			show: {
				...showOnlyForMessage,
				operation: ['send'],
			},
		},
	},
	{
		...rawJsonBody,
		displayOptions: {
			show: {
				...showOnlyForMessage,
				operation: ['send'],
				useRawJson: [true],
			},
		},
	},
	{
		displayName: 'Message Content',
		name: 'content',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		required: true,
		description: 'The content of the message to send',
		displayOptions: {
			show: {
				...showOnlyForMessage,
				operation: ['send'],
				useRawJson: [false],
			},
		},
	},
	{
		...messageTypeOptions,
		displayOptions: {
			show: {
				...showOnlyForMessage,
				operation: ['send'],
				useRawJson: [false],
			},
		},
	},
	{
		displayName: 'Private Note',
		name: 'private',
		type: 'boolean',
		default: false,
		description: 'Whether this is a private note (not visible to customer)',
		displayOptions: {
			show: {
				...showOnlyForMessage,
				operation: ['send'],
				useRawJson: [false],
			},
		},
	},
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'number',
		default: 0,
		required: true,
		description: 'ID of the message to delete',
		displayOptions: {
			show: {
				...showOnlyForMessage,
				operation: ['delete'],
			},
		},
	},
	{
		...typingStatusOptions,
		displayOptions: {
			show: {
				...showOnlyForMessage,
				operation: ['setTyping'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				...showOnlyForMessage,
				operation: ['send'],
				useRawJson: [false],
			},
		},
		options: [
			{
				displayName: 'Content Attributes (JSON)',
				name: 'content_attributes',
				type: 'json',
				default: '{}',
				description: 'Additional content attributes as JSON',
			},
			{
				displayName: 'Content Type',
				name: 'content_type',
				type: 'options',
				default: 'text',
				options: [
					{ name: 'Article', value: 'article' },
					{ name: 'Cards', value: 'cards' },
					{ name: 'Form', value: 'form' },
					{ name: 'Input Select', value: 'input_select' },
					{ name: 'Text', value: 'text' },
				],
			},
			{
				displayName: 'Template Params (JSON)',
				name: 'template_params',
				type: 'json',
				default: '{}',
				description: 'Template parameters for template messages',
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				...showOnlyForMessage,
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'After',
				name: 'after',
				type: 'number',
				default: 0,
				description: 'Get messages after this message ID',
			},
			{
				displayName: 'Before',
				name: 'before',
				type: 'number',
				default: 0,
				description: 'Get messages before this message ID',
			},
		],
	},
	{
		...responseFilterFields,
		displayOptions: {
			show: {
				...showOnlyForMessage,
				operation: ['getAll'],
			},
		},
	},
];

export const messageDescription: INodeProperties[] = [
	...messageOperations,
	...messageFields,
];

export { executeMessageOperation } from './operations';
