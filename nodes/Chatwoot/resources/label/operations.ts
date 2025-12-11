import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { chatwootApiRequest, getAccountId } from '../../shared/transport';
import { LabelOperation } from './types';

export async function executeLabelOperation(
	context: IExecuteFunctions,
	operation: LabelOperation,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
  switch (operation) {
    case 'create':
      return createLabel(context, itemIndex);
    case 'getAll':
      return getAllLabels(context, itemIndex);
    case 'update':
      return updateLabel(context, itemIndex);
    case 'delete':
      return deleteLabel(context, itemIndex);
  }
}

async function createLabel(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);

	const title = context.getNodeParameter('title', itemIndex) as string;
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as IDataObject;

	const body: IDataObject = {
		title,
		...additionalFields,
	};

	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/labels`,
		body,
	)) as IDataObject;
}

async function getAllLabels(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject[]> {
	const accountId = getAccountId.call(context, itemIndex);

	const response = (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/labels`,
	)) as IDataObject;

	return (response.payload as IDataObject[]) || [];
}

async function updateLabel(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const labelId = context.getNodeParameter('labelId', itemIndex) as string;

	const body: IDataObject = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	return (await chatwootApiRequest.call(
		context,
		'PATCH',
		`/api/v1/accounts/${accountId}/labels/${labelId}`,
		body,
	)) as IDataObject;
}

async function deleteLabel(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const labelId = context.getNodeParameter('labelId', itemIndex) as string;

	await chatwootApiRequest.call(
		context,
		'DELETE',
		`/api/v1/accounts/${accountId}/labels/${labelId}`,
	);

	return { success: true };
}
