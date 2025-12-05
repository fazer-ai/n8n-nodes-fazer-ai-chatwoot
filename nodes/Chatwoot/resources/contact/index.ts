import type { INodeProperties } from 'n8n-workflow';
import {
	accountSelector,
	contactSelector,
	customAttributesField,
	rawJsonBody,
} from '../../shared/descriptions';

const showOnlyForContact = {
	resource: ['contact'],
};

export const contactOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForContact,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new contact',
				action: 'Create contact',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a contact',
				action: 'Delete contact',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific contact',
				action: 'Get contact',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many contacts',
				action: 'Get many contacts',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search for contacts',
				action: 'Search contacts',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a contact',
				action: 'Update contact',
			},
		],
		default: 'getAll',
	},
];

export const contactFields: INodeProperties[] = [
	// ============================================
	// Account Selection (all operations)
	// ============================================
	{
		...accountSelector,
		displayOptions: {
			show: showOnlyForContact,
		},
	},

	// ============================================
	// Contact Selection (get, update, delete)
	// ============================================
	{
		...contactSelector,
		displayOptions: {
			show: {
				...showOnlyForContact,
				operation: ['get', 'update', 'delete'],
			},
		},
	},

	// ============================================
	// Create Fields
	// ============================================
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		description: 'Name of the contact',
		displayOptions: {
			show: {
				...showOnlyForContact,
				operation: ['create'],
				useRawJson: [false],
			},
		},
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
		description: 'Email of the contact',
		displayOptions: {
			show: {
				...showOnlyForContact,
				operation: ['create'],
				useRawJson: [false],
			},
		},
	},
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		default: '',
		description: 'Phone number of the contact (with country code)',
		displayOptions: {
			show: {
				...showOnlyForContact,
				operation: ['create'],
				useRawJson: [false],
			},
		},
	},

	// ============================================
	// Search Fields
	// ============================================
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		default: '',
		required: true,
		description: 'Search query to find contacts (searches in name, email, phone)',
		displayOptions: {
			show: {
				...showOnlyForContact,
				operation: ['search'],
			},
		},
	},

	// ============================================
	// Pagination for getAll
	// ============================================
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				...showOnlyForContact,
				operation: ['getAll', 'search'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				...showOnlyForContact,
				operation: ['getAll', 'search'],
				returnAll: [false],
			},
		},
	},

	// ============================================
	// Additional Fields for create/update
	// ============================================
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				...showOnlyForContact,
				operation: ['create', 'update'],
				useRawJson: [false],
			},
		},
		options: [
			{
				displayName: 'Avatar URL',
				name: 'avatar_url',
				type: 'string',
				default: '',
				description: 'URL of the contact avatar',
			},
			{
				...customAttributesField,
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Email of the contact (for update)',
			},
			{
				displayName: 'Identifier',
				name: 'identifier',
				type: 'string',
				default: '',
				description: 'External identifier for the contact (unique per inbox)',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the contact (for update)',
			},
			{
				displayName: 'Phone Number',
				name: 'phone_number',
				type: 'string',
				default: '',
				description: 'Phone number of the contact (for update)',
			},
		],
	},

	// ============================================
	// Raw JSON Body Option
	// ============================================
	{
		displayName: 'Use Raw JSON',
		name: 'useRawJson',
		type: 'boolean',
		default: false,
		description: 'Whether to use raw JSON body instead of fields',
		displayOptions: {
			show: {
				...showOnlyForContact,
				operation: ['create', 'update'],
			},
		},
	},
	{
		...rawJsonBody,
		displayOptions: {
			show: {
				...showOnlyForContact,
				operation: ['create', 'update'],
				useRawJson: [true],
			},
		},
	},
];

export const contactDescription: INodeProperties[] = [
	...contactOperations,
	...contactFields,
];
