import type { INodeProperties } from 'n8n-workflow';
import { accountSelector, inboxSelector } from '../../shared/descriptions';

const showOnlyForInbox = {
	resource: ['inbox'],
};

export const inboxOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForInbox,
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get information about a specific inbox',
				action: 'Get inbox info',
			},
			{
				name: 'Get Many',
				value: 'list',
				description: 'List all inboxes in an account',
				action: 'List inboxes',
			},
		],
		default: 'list',
	},
];

export const inboxFields: INodeProperties[] = [
	// Account selector (resourceLocator with From List / By ID) - for all operations
	{
		...accountSelector,
		displayOptions: {
			show: showOnlyForInbox,
		},
	},
	// Inbox selector (resourceLocator with From List / By ID) - for get operation
	{
		...inboxSelector,
		displayOptions: {
			show: {
				...showOnlyForInbox,
				operation: ['get'],
			},
		},
	},
];

export const inboxDescription: INodeProperties[] = [
	...inboxOperations,
	...inboxFields,
];
