import type { INodeProperties } from 'n8n-workflow';
import {
	accountSelector,
	contactSelector,
	conversationSelector,
	responseFilterFields,
} from '../../shared/descriptions';

const showOnlyForCustomAttribute = {
	resource: ['customAttribute'],
};

const customAttributeOperations: INodeProperties[] = [
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
				name: 'Create Custom Attribute',
				value: 'createCustomAttribute',
				description: 'Create a custom attribute definition',
				action: 'Create custom attribute definition',
			},
			{
				name: 'Delete Custom Attribute',
				value: 'removeCustomAttribute',
				description: 'Delete a custom attribute definition',
				action: 'Delete custom attribute definition',
			},
			{
				name: 'Get Custom Attribute',
				value: 'getCustomAttribute',
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
		default: 'createCustomAttribute',
	},
];

const customAttributeFields: INodeProperties[] = [
	{
		...accountSelector,
		displayOptions: {
			show: showOnlyForCustomAttribute,
		},
	},
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
				operation: ['createCustomAttribute', 'getCustomAttribute', 'removeCustomAttribute'],
			},
		},
	},
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
				operation: ['createCustomAttribute'],
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
				operation: ['createCustomAttribute', 'removeCustomAttribute'],
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
				operation: ['createCustomAttribute'],
			},
		},
	},
	{
		displayName: 'List Values',
		name: 'attributeValues',
		type: 'string',
		default: '',
		required: true,
		description: 'Possible values when using the List attribute type',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				...showOnlyForCustomAttribute,
				operation: ['createCustomAttribute'],
				attributeType: ['list'],
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
				...showOnlyForCustomAttribute,
				operation: ['createCustomAttribute'],
			},
		},
		options: [
			{
				displayName: 'Attribute Description',
				name: 'attributeDescription',
				type: 'string',
				default: '',
				description: 'Description of the custom attribute',
			},
		],
	},
	{
		...contactSelector,
		displayOptions: {
			show: {
				...showOnlyForCustomAttribute,
				operation: ['setOnContact'],
			},
		},
	},
	{
		...conversationSelector,
		displayOptions: {
			show: {
				...showOnlyForCustomAttribute,
				operation: ['setOnConversation'],
			},
		},
	},
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
	{
		...responseFilterFields,
		displayOptions: {
			show: {
				...showOnlyForCustomAttribute,
				operation: ['getCustomAttribute'],
			},
		},
	},
];

export const customAttributeDescription: INodeProperties[] = [
	...customAttributeOperations,
	...customAttributeFields,
];
