import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { chatwootApiRequest, getAccountId } from '../../shared/transport';

export async function executeAccountOperation(
	context: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[] | undefined> {
  if (operation === 'getAll') {
    return getAllAccounts(context);
  } else if (operation === 'get') {
    return getAccount(context, itemIndex);
  } else {
    return undefined;
  }
}


async function getAllAccounts(
	context: IExecuteFunctions,
): Promise<IDataObject[]> {
	const profile = (await chatwootApiRequest.call(
		context,
		'GET',
		'/api/v1/profile',
	)) as IDataObject;

	return (profile.accounts as IDataObject[]) || [];
}

async function getAccount(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);

	return (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}`,
	)) as IDataObject;
}
