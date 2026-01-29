import { INodeExecutionData, type IDataObject, type IExecuteFunctions } from 'n8n-workflow';
import { chatwootApiRequest, getAccountId, getAgentId } from '../../shared/transport';
import { AgentOperation } from './types';

export async function executeAgentOperation(
	context: IExecuteFunctions,
	operation: AgentOperation,
	itemIndex: number,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	switch (operation) {
		case 'create':
			return createAgent(context, itemIndex);
		case 'delete':
			return deleteAgent(context, itemIndex);
		case 'list':
			return listAgents(context, itemIndex);
		case 'update':
			return updateAgent(context, itemIndex);
	}
}

async function createAgent(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const name = context.getNodeParameter('name', itemIndex) as string;
	const email = context.getNodeParameter('email', itemIndex) as string;
	const role = context.getNodeParameter('role', itemIndex) as string;
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as IDataObject;

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/agents`,
		{
			name,
			email,
			role,
			...additionalFields,
		},
	) as IDataObject;

	return { json: result };
}

async function deleteAgent(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const agentId = getAgentId.call(context, itemIndex);

	await chatwootApiRequest.call(
		context,
		'DELETE',
		`/api/v1/accounts/${accountId}/agents/${agentId}`,
	);

	return { json: {} };
}

async function listAgents(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const accountId = getAccountId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/agents`,
	) as IDataObject[];

	return result.map((agent) => ({ json: agent }));
}

async function updateAgent(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const agentId = getAgentId.call(context, itemIndex);
	const role = context.getNodeParameter('role', itemIndex) as string;
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as IDataObject;

	const result = await chatwootApiRequest.call(
		context,
		'PATCH',
		`/api/v1/accounts/${accountId}/agents/${agentId}`,
		{
			role,
			...additionalFields,
		},
	) as IDataObject;

	return { json: result };
}
