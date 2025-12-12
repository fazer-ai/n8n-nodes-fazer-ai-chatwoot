import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import {
	chatwootApiRequest,
	getAccountId,
} from '../../shared/transport';
import { CustomAttributeOperation } from './types';

export async function executeCustomAttributeOperation(
	context: IExecuteFunctions,
	operation: CustomAttributeOperation,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
  switch (operation) {
    case 'createCustomAttribute':
      return createCustomAttribute(context, itemIndex);
    case 'getCustomAttribute':
      return getCustomAttribute(context, itemIndex);
    case 'removeCustomAttribute':
      return removeCustomAttribute(context, itemIndex);
  }
}

async function createCustomAttribute(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);

	const attributeModel = context.getNodeParameter('attributeModel', itemIndex) as string;
	const attributeDisplayName = context.getNodeParameter('attributeDisplayName', itemIndex) as string;
	const attributeKey = context.getNodeParameter('attributeKey', itemIndex) as string;
	const attributeType = context.getNodeParameter('attributeType', itemIndex) as string;
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	const body: IDataObject = {
		attribute_display_name: attributeDisplayName,
		attribute_key: attributeKey,
		attribute_display_type: attributeType,
		attribute_model: attributeModel === 'contact_attribute' ? 0 : 1,
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

	const attributeDescription = additionalFields.attributeDescription as string | undefined;
	if (attributeDescription) {
		body.attribute_description = attributeDescription;
	}

	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/custom_attribute_definitions`,
		body,
	)) as IDataObject;
}

async function getCustomAttribute(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject[]> {
	const accountId = getAccountId.call(context, itemIndex);
	const attributeModel = context.getNodeParameter('attributeModel', itemIndex) as string;

	const query: IDataObject = {
		attribute_model: attributeModel,
	};

	return (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/custom_attribute_definitions`,
		undefined,
		query,
	)) as IDataObject[];
}

async function removeCustomAttribute(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const attributeKey = context.getNodeParameter('attributeKey', itemIndex) as string;

	await chatwootApiRequest.call(
		context,
		'DELETE',
		`/api/v1/accounts/${accountId}/custom_attribute_definitions/${attributeKey}`,
	);

	return { success: true };
}
