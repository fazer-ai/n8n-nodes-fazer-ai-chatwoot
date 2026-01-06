import type { INodeProperties } from 'n8n-workflow';
import { accountSelector, labelSelector } from '../../shared/descriptions';

const showOnlyForLabel = {
	resource: ['label'],
};

const labelOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForLabel,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new label',
				action: 'Create label',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a label',
				action: 'Delete label',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List the labels',
				action: 'List labels',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a label',
				action: 'Update label',
			},
		],
		default: 'create',
	},
];

const labelFields: INodeProperties[] = [
	{
		...accountSelector,
		displayOptions: {
			show: showOnlyForLabel,
		},
	},
	{
		...labelSelector,
		displayOptions: {
			show: {
				...showOnlyForLabel,
				operation: ['update', 'delete'],
			},
		},
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		required: true,
		description: 'Title of the label (used as identifier, will be converted to lowercase with hyphens)',
		displayOptions: {
			show: {
				...showOnlyForLabel,
				operation: ['create'],
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
				...showOnlyForLabel,
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				displayName: 'Color',
				name: 'color',
				type: 'color',
				default: '#1F93FF',
				description: 'Color of the label in hex format (e.g., #FF0000)',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the label',
			},
			{
				displayName: 'Show on Sidebar',
				name: 'show_on_sidebar',
				type: 'boolean',
				default: true,
				description: 'Whether to show this label on the sidebar',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Title of the label (for update)',
				displayOptions: {
					show: {
						'/operation': ['update'],
					},
				},
			},
		],
	}
];

export const labelDescription: INodeProperties[] = [
	...labelOperations,
	...labelFields,
];
