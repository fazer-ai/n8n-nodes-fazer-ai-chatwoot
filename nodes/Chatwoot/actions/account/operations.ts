import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { chatwootApiRequest, getAccountId } from '../../shared/transport';
import { AccountOperation } from '../node.type';

export async function executeAccountOperation(
  context: IExecuteFunctions,
  operation: AccountOperation,
  itemIndex: number,
): Promise<INodeExecutionData> {
  switch (operation) {
  case 'get':
    return getAccount(context, itemIndex);
  }
}

async function getAccount(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}`,
	) as IDataObject;

	return { json: result };
}
