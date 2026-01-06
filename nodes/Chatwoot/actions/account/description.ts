import type { INodeProperties } from 'n8n-workflow';
import { accountSelector } from '../../shared/descriptions';

const showOnlyForAccount = {
	resource: ['account'],
};

const accountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForAccount,
		},
		options: [
			{
				name: 'Get Account',
				value: 'get',
				description: 'Retrieve detailed information about a specific Chatwoot account',
				action: 'Get account information',
			}
		],
		default: 'get',
	},
];

const accountFields: INodeProperties[] = [
	{
		...accountSelector,
		displayOptions: {
			show: {
				...showOnlyForAccount,
				operation: ['get'],
			},
		},
	}
];

export const accountDescription: INodeProperties[] = [
	...accountOperations,
	...accountFields,
];
