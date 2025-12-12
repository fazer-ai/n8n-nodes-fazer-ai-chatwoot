import type { INodeProperties } from 'n8n-workflow';
import { accountSelector, inboxSelector, responseFilterFields } from '../../shared/descriptions';

const showOnlyForInbox = {
	resource: ['inbox'],
};

const inboxOperations: INodeProperties[] = [
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
				value: 'getAll',
				description: 'List many inboxes in an account',
				action: 'List inboxes',
			},
		],
		default: 'getAll',
	},
];

const inboxFields: INodeProperties[] = [
	{
		...accountSelector,
		displayOptions: {
			show: showOnlyForInbox,
		},
	},
	{
		...inboxSelector,
		displayOptions: {
			show: {
				...showOnlyForInbox,
				operation: ['get'],
			},
		},
	},
	{
		...responseFilterFields,
		displayOptions: {
			show: {
				...showOnlyForInbox,
				operation: ['get', 'getAll'],
			},
		},
	},
];

export const inboxDescription: INodeProperties[] = [
	...inboxOperations,
	...inboxFields,
];
