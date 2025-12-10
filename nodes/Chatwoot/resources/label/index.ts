import type { INodeProperties } from 'n8n-workflow';
import { accountSelector, rawJsonBody, responseFilterFields } from '../../shared/descriptions';

const showOnlyForLabel = {
	resource: ['label'],
};

export const labelOperations: INodeProperties[] = [
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
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many labels',
				action: 'Get labels',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a label',
				action: 'Update label',
			},
		],
		default: 'getAll',
	},
];

export const labelFields: INodeProperties[] = [
	{
		...accountSelector,
		displayOptions: {
			show: showOnlyForLabel,
		},
	},
	{
		displayName: 'Label Name or ID',
		name: 'labelId',
		type: 'options',
		default: '',
		required: true,
		description:
			'Select the label. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsMethod: 'getLabels',
		},
		displayOptions: {
			show: {
				...showOnlyForLabel,
				operation: ['update', 'delete'],
			},
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
				...showOnlyForLabel,
				operation: ['create', 'update'],
			},
		},
	},
	{
		...rawJsonBody,
		displayOptions: {
			show: {
				...showOnlyForLabel,
				operation: ['create', 'update'],
				useRawJson: [true],
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
				useRawJson: [false],
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
				useRawJson: [false],
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
						'/useRawJson': [false],
					},
				},
			},
		],
	},
	{
		...responseFilterFields,
		displayOptions: {
			show: {
				...showOnlyForLabel,
				operation: ['getAll'],
			},
		},
	},
];

export const labelDescription: INodeProperties[] = [
	...labelOperations,
	...labelFields,
];

export { executeLabelOperation } from './operations';
