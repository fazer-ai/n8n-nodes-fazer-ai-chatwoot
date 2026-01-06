import { INodeExecutionData, type IDataObject, type IExecuteFunctions } from 'n8n-workflow';
import { chatwootApiRequest, getAccountId, getAgentId, getTeamId, getTeamMemberId } from '../../shared/transport';
import { TeamOperation } from './types';

export async function executeTeamOperation(
	context: IExecuteFunctions,
	operation: TeamOperation,
	itemIndex: number,
): Promise<INodeExecutionData> {
	switch (operation) {
		case 'create':
			return createTeam(context, itemIndex);
		case 'delete':
			return deleteTeam(context, itemIndex);
		case 'list':
			return listTeams(context, itemIndex);
		case 'getTeamMembers':
			return getTeamMembers(context, itemIndex);
		case 'assignAgent':
			return assignAgentToTeam(context, itemIndex);
		case 'unassignAgent':
			return unassignAgentFromTeam(context, itemIndex);
	}
}

async function createTeam(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const name = context.getNodeParameter('name', itemIndex);
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as IDataObject;

	return {
		json: (await chatwootApiRequest.call(
			context,
			'POST',
			`/api/v1/accounts/${accountId}/teams`,
			{
 	 	    name,
  	    ...additionalFields,
  	  },
		)) as IDataObject
	};
}

async function deleteTeam(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const teamId = getTeamId.call(context, itemIndex);

	return {
		json: (await chatwootApiRequest.call(
			context,
			'DELETE',
			`/api/v1/accounts/${accountId}/teams/${teamId}`,
		)) as IDataObject
	};
}

async function listTeams(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);

	return {
		json: (await chatwootApiRequest.call(
			context,
			'GET',
			`/api/v1/accounts/${accountId}/teams`,
		)) as IDataObject
	};
}

async function getTeamMembers(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const teamId = getTeamId.call(context, itemIndex);

	return {
		json: (await chatwootApiRequest.call(
			context,
			'GET',
			`/api/v1/accounts/${accountId}/teams/${teamId}/team_members`,
		)) as IDataObject
	};
}

async function assignAgentToTeam(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const teamId = getTeamId.call(context, itemIndex);
	const agentId = getAgentId.call(context, itemIndex);

	return {
		json: (await chatwootApiRequest.call(
			context,
			'POST',
			`/api/v1/accounts/${accountId}/teams/${teamId}/team_members`,
			{ user_ids: [agentId] },
		)) as IDataObject
	};
}

async function unassignAgentFromTeam(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const teamId = getTeamId.call(context, itemIndex);
	const teamMemberId = getTeamMemberId.call(context, itemIndex);

  const currentMembers = (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/teams/${teamId}/team_members`,
	)) as Array<{ id: number }>;

	const remainingMemberIds = currentMembers
		.map((member) => member.id)
		.filter((id) => String(id) !== teamMemberId);

	return {
		json: (await chatwootApiRequest.call(
			context,
			'PATCH',
			`/api/v1/accounts/${accountId}/teams/${teamId}/team_members`,
			{ user_ids: remainingMemberIds },
		)) as IDataObject
	};
}
