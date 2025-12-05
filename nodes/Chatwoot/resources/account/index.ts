import type { INodeProperties } from 'n8n-workflow';
import { accountSelector } from '../../shared/descriptions';

const showOnlyForAccount = {
	resource: ['account'],
};

export const accountOperations: INodeProperties[] = [
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
				name: 'Get Specific Account',
				value: 'get',
				description: 'Get information about a specific account',
				action: 'Get account info',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many accounts available',
				action: 'Get many accounts',
			},
		],
		default: 'getAll',
	},
];

export const accountFields: INodeProperties[] = [
	// Account selector (resourceLocator with From List / By ID)
	{
		...accountSelector,
		displayOptions: {
			show: {
				...showOnlyForAccount,
				operation: ['get'],
			},
		},
	},
];

export const accountDescription: INodeProperties[] = [
	...accountOperations,
	...accountFields,
];
