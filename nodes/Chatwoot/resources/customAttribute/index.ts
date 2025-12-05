import type { INodeProperties } from 'n8n-workflow';
import {
	accountSelector,
	contactSelector,
	conversationSelector,
	rawJsonBody,
} from '../../shared/descriptions';

const showOnlyForCustomAttribute = {
	resource: ['customAttribute'],
};

export const customAttributeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForCustomAttribute,
		},
		options: [
			{
				name: 'Create Definition',
				value: 'createDefinition',
				description: 'Create a custom attribute definition',
				action: 'Create custom attribute definition',
			},
			{
				name: 'Delete Definition',
				value: 'deleteDefinition',
				description: 'Delete a custom attribute definition',
				action: 'Delete custom attribute definition',
			},
			{
				name: 'Get Definitions',
				value: 'getDefinitions',
				description: 'Get all custom attribute definitions',
				action: 'Get custom attribute definitions',
			},
			{
				name: 'Set on Contact',
				value: 'setOnContact',
				description: 'Set custom attributes on a contact',
				action: 'Set custom attributes on contact',
			},
			{
				name: 'Set on Conversation',
				value: 'setOnConversation',
				description: 'Set custom attributes on a conversation',
				action: 'Set custom attributes on conversation',
			},
		],
		default: 'getDefinitions',
	},
];

export const customAttributeFields: INodeProperties[] = [
	// ============================================
	// Account Selection (all operations)
	// ============================================
	{
		...accountSelector,
		displayOptions: {
			show: showOnlyForCustomAttribute,
		},
	},

	// ============================================
	// Attribute Model (for definitions)
	// ============================================
	{
		displayName: 'Attribute Model',
		name: 'attributeModel',
		type: 'options',
		default: 'contact_attribute',
		required: true,
		options: [
			{ name: 'Contact Attribute', value: 'contact_attribute' },
			{ name: 'Conversation Attribute', value: 'conversation_attribute' },
		],
		displayOptions: {
			show: {
				...showOnlyForCustomAttribute,
				operation: ['createDefinition', 'getDefinitions', 'deleteDefinition'],
			},
		},
	},

	// ============================================
	// Create Definition Fields
	// ============================================
	{
		displayName: 'Attribute Display Name',
		name: 'attributeDisplayName',
		type: 'string',
		default: '',
		required: true,
		description: 'Display name of the custom attribute',
		displayOptions: {
			show: {
				...showOnlyForCustomAttribute,
				operation: ['createDefinition'],
				useRawJson: [false],
			},
		},
	},
	{
		displayName: 'Attribute Key',
		name: 'attributeKey',
		type: 'string',
		default: '',
		required: true,
		description: 'Key/identifier for the custom attribute (snake_case recommended)',
		displayOptions: {
			show: {
				...showOnlyForCustomAttribute,
				operation: ['createDefinition', 'deleteDefinition'],
				useRawJson: [false],
			},
		},
	},
	{
		displayName: 'Attribute Type',
		name: 'attributeType',
		type: 'options',
		default: 'text',
		options: [
			{ name: 'Checkbox', value: 'checkbox' },
			{ name: 'Date', value: 'date' },
			{ name: 'Link', value: 'link' },
			{ name: 'List', value: 'list' },
			{ name: 'Number', value: 'number' },
			{ name: 'Text', value: 'text' },
		],
		displayOptions: {
			show: {
				...showOnlyForCustomAttribute,
				operation: ['createDefinition'],
				useRawJson: [false],
			},
		},
	},
	{
		displayName: 'Attribute Description',
		name: 'attributeDescription',
		type: 'string',
		default: '',
		description: 'Description of the custom attribute',
		displayOptions: {
			show: {
				...showOnlyForCustomAttribute,
				operation: ['createDefinition'],
				useRawJson: [false],
			},
		},
	},

	// ============================================
	// Contact Selection (setOnContact)
	// ============================================
	{
		...contactSelector,
		displayOptions: {
			show: {
				...showOnlyForCustomAttribute,
				operation: ['setOnContact'],
			},
		},
	},

	// ============================================
	// Conversation Selection (setOnConversation)
	// ============================================
	{
		...conversationSelector,
		displayOptions: {
			show: {
				...showOnlyForCustomAttribute,
				operation: ['setOnConversation'],
			},
		},
	},

	// ============================================
	// Custom Attributes JSON (for set operations)
	// ============================================
	{
		displayName: 'Custom Attributes',
		name: 'customAttributes',
		type: 'json',
		default: '{}',
		required: true,
		description: 'Custom attributes as JSON object (key-value pairs)',
		displayOptions: {
			show: {
				...showOnlyForCustomAttribute,
				operation: ['setOnContact', 'setOnConversation'],
			},
		},
	},

	// ============================================
	// Raw JSON body option (for createDefinition)
	// ============================================
	{
		displayName: 'Use Raw JSON',
		name: 'useRawJson',
		type: 'boolean',
		default: false,
		description: 'Whether to use raw JSON body instead of fields',
		displayOptions: {
			show: {
				...showOnlyForCustomAttribute,
				operation: ['createDefinition'],
			},
		},
	},
	{
		...rawJsonBody,
		displayOptions: {
			show: {
				...showOnlyForCustomAttribute,
				operation: ['createDefinition'],
				useRawJson: [true],
			},
		},
	},
];

export const customAttributeDescription: INodeProperties[] = [
	...customAttributeOperations,
	...customAttributeFields,
];
