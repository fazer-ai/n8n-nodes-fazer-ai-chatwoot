import { INodeExecutionData, type IDataObject, type IExecuteFunctions } from 'n8n-workflow';
import { chatwootApiRequest, getAccountId, getLabelId } from '../../shared/transport';
import { LabelOperation } from './types';

export async function executeLabelOperation(
	context: IExecuteFunctions,
	operation: LabelOperation,
	itemIndex: number,
): Promise<INodeExecutionData | INodeExecutionData[]> {
  switch (operation) {
    case 'create':
      return createLabel(context, itemIndex);
    case 'list':
      return listLabels(context, itemIndex);
    case 'update':
      return updateLabel(context, itemIndex);
    case 'delete':
      return deleteLabel(context, itemIndex);
  }
}

async function createLabel(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);

	const rawTitle = context.getNodeParameter('title', itemIndex) as string;
	const title = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex) as IDataObject;

	const body: IDataObject = {
		title,
		description: additionalFields.description ?? '',
		show_on_sidebar: additionalFields.show_on_sidebar ?? true,
		color: additionalFields.color || `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
	};

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/labels`,
		body,
	) as IDataObject;

	return { json: result };
}

async function listLabels(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const accountId = getAccountId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/labels`,
	) as IDataObject[];

	return result.map((label) => ({ json: label }));
}

async function updateLabel(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const labelId = getLabelId.call(context, itemIndex);

	const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	const body = Object.fromEntries(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		Object.entries(additionalFields).filter(([_, v]) => v !== undefined && v !== null && v !== ''),
	) as IDataObject;

	const result = await chatwootApiRequest.call(
		context,
		'PATCH',
		`/api/v1/accounts/${accountId}/labels/${labelId}`,
		body,
	) as IDataObject;

	return { json: result };
}

async function deleteLabel(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const labelId = getLabelId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'DELETE',
		`/api/v1/accounts/${accountId}/labels/${labelId}`,
	) as IDataObject;

	return { json: result };
}
