import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
	chatwootApiRequest,
	getAccountId,
} from '../../shared/transport';
import { CustomAttributeOperation } from './types';

export async function executeCustomAttributeOperation(
	context: IExecuteFunctions,
	operation: CustomAttributeOperation,
	itemIndex: number,
): Promise<INodeExecutionData | INodeExecutionData[]> {
  switch (operation) {
    case 'create':
      return createCustomAttribute(context, itemIndex);
    case 'list':
      return listCustomAttributes(context, itemIndex);
    case 'remove':
      return removeCustomAttribute(context, itemIndex);
  }
}

async function createCustomAttribute(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);

	const attributeModel = context.getNodeParameter('attributeModel', itemIndex);
	const attributeDisplayName = context.getNodeParameter('attributeDisplayName', itemIndex);
	const attributeType = context.getNodeParameter('attributeType', itemIndex) ;
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {});

	const attributeKey = String(attributeDisplayName)
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '_')
			.replace(/^_+|_+$/g, '');

	const body: IDataObject = {
		attribute_display_name: attributeDisplayName,
		attribute_key: attributeKey,
		attribute_display_type: attributeType,
		attribute_model: attributeModel === 'conversation_attribute' ? 0 : 1,
	};

	if (attributeType === 'list') {
		const attributeValuesInput = context.getNodeParameter('attributeValues', itemIndex) as
			| string
			| string[];
		const attributeValues = (
			Array.isArray(attributeValuesInput)
				? attributeValuesInput
				: [attributeValuesInput]
		).filter((value) => value !== '');

		if (attributeValues.length) {
			body.attribute_values = attributeValues;
		}
	}

	const attributeDescription = additionalFields.attributeDescription;
	if (attributeDescription) {
		body.attribute_description = attributeDescription;
	}

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/custom_attribute_definitions`,
		body,
	) as IDataObject;

	return { json: result };
}

async function listCustomAttributes(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const accountId = getAccountId.call(context, itemIndex);
	const attributeModel = context.getNodeParameter('attributeModel', itemIndex);

	const query: IDataObject = {
		attribute_model: attributeModel,
	};

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/custom_attribute_definitions`,
		undefined,
		query,
	) as IDataObject[];

	return result.map((attr) => ({ json: attr }));
}

async function removeCustomAttribute(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const attributeKey = context.getNodeParameter('attributeKeyToDelete', itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'DELETE',
		`/api/v1/accounts/${accountId}/custom_attribute_definitions/${attributeKey}`,
	) as IDataObject;

	return { json: result };
}
