import type { INodeProperties } from 'n8n-workflow';
import {
  accountSelector,
  contactSelector,
} from '../../shared/descriptions';

const showOnlyForContact = {
  resource: ['contact'],
};

const contactOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: showOnlyForContact,
    },
    // eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
    options: [
      {
        name: 'Create Contact',
        value: 'create',
        description: 'Create a new contact',
        action: 'Create a contact',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a contact information',
        action: 'Get contact',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a contact information',
        action: 'Update contact',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a contact',
        action: 'Delete contact',
      },
      {
        name: 'List',
        value: 'list',
        description: 'List contacts',
        action: 'List contacts',
      },
      {
        name: 'Search',
        value: 'search',
        description: 'Search for contacts',
        action: 'Search contacts',
      },
      {
        name: 'List Conversations',
        value: 'listConversations',
        description: 'Get conversations associated with a contact',
        action: 'List contact conversations',
      },
      {
        name: 'Merge Contacts',
        value: 'merge',
        description: 'Merge two contacts into a single contact',
        action: 'Merge contacts',
      },
      {
        name: 'List Labels',
        value: 'listLabels',
        description: 'List all labels of a contact',
        action: 'List contact labels',
      },
      {
        name: 'Add Labels',
        value: 'addLabels',
        description: 'Append labels to contact keeping existing labels intact',
        action: 'Add labels to contact',
      },
      {
        name: 'Remove Labels',
        value: 'removeLabels',
        description: 'Remove specific labels from contact',
        action: 'Remove labels from contact',
      },
      {
        name: 'Update Labels',
        value: 'updateLabels',
        description: 'Replace all labels on contact with new labels',
        action: 'Update contact labels',
      },
      {
        name: 'Set Custom Attribute',
        value: 'setCustomAttributes',
        description: 'Set custom attributes on a contact',
        action: 'Set custom attribute on contact',
      },
      {
        name: 'Destroy Custom Attributes',
        value: 'destroyCustomAttributes',
        description: 'Destroy custom attributes of a contact',
        action: 'Destroy custom attributes of contact',
      },
    ],
    default: 'create',
  },
];

const contactFields: INodeProperties[] = [
  {
    ...accountSelector,
    displayOptions: {
      show: showOnlyForContact,
    },
  },
  {
    ...contactSelector,
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['get', 'update', 'delete', 'listConversations', 'listLabels', 'addLabels', 'updateLabels', 'removeLabels', 'setCustomAttributes', 'destroyCustomAttributes'],
      },
    },
  },
  {
    ...contactSelector,
    displayName: 'Base Contact',
    name: 'baseContactId',
    description: 'The contact that will remain after the merge and receive all data',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['merge'],
      },
    },
  },
  {
    ...contactSelector,
    displayName: 'Mergee Contact',
    name: 'mergeeContactId',
    description: 'The contact that will be merged into the base contact and permanently deleted',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['merge'],
      },
    },
  },
  {
    // eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-multi-options
    displayName: 'Labels',
    name: 'labels',
    type: 'multiOptions',
    default: [],
    description: 'Select labels to add, update, or remove. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
    typeOptions: {
      loadOptionsMethod: 'loadLabelsWithTitleValueOptions',
    },
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['addLabels', 'updateLabels', 'removeLabels'],
      },
    },
  },
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    default: '',
    placeholder: 'John Doe',
    required: true,
    description: 'Name of the contact',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    default: '',
    placeholder: 'John Doe',
    description: 'Name of the contact',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['update'],
      },
    },
  },
  {
    displayName: 'Phone Number',
    name: 'phoneNumber',
    type: 'string',
    default: '',
    placeholder: '+5511999999999',
    description: 'Phone number of the contact in E.164 format (e.g., +5511999999999)',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['create', 'update'],
      },
    },
  },
  {
    displayName: 'Email',
    name: 'email',
    type: 'string',
    default: '',
    placeholder: 'name@email.com',
    description: 'Email of the contact',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['create', 'update'],
      },
    },
  },
  {
    displayName: 'Search Query',
    name: 'searchQuery',
    type: 'string',
    default: '',
    required: true,
    description: 'Search query to find contacts (searches in name, email, phone)',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['search'],
      },
    },
  },
  {
    displayName: 'Page',
    name: 'page',
    type: 'number',
    default: 1,
    description: 'The page number to retrieve',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['list', 'search'],
      },
    },
  },
  {
    displayName: 'Sort By',
    name: 'sort',
    type: 'options',
    default: 'last_activity_at',
    description: 'Field to sort contacts by',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['list'],
      },
    },
    options: [
      {
        name: 'City',
        value: 'city',
      },
      {
        name: 'Company Name',
        value: 'company_name',
      },
      {
        name: 'Country',
        value: 'country',
      },
      {
        name: 'Created At',
        value: 'created_at',
      },
      {
        name: 'Email',
        value: 'email',
      },
      {
        name: 'Last Activity',
        value: 'last_activity_at',
      },
      {
        name: 'Name',
        value: 'name',
      },
    ],
  },
  {
    displayName: 'Sort Order',
    name: 'sortOrder',
    type: 'options',
    default: 'asc',
    description: 'Order to sort contacts',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['list'],
      },
    },
    options: [
      {
        name: 'Ascending',
        value: 'asc',
      },
      {
        name: 'Descending',
        value: 'desc',
      },
    ],
  },
  {
    displayName: 'Include Contact Inboxes',
    name: 'includeContactInboxes',
    type: 'boolean',
    default: false,
    description: 'Whether to include inbox information for each contact',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['list'],
      },
    },
  },
  {
    displayName: 'Specify Custom Attributes',
    name: 'specifyCustomAttributesCreate',
    type: 'options',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['create'],
      },
    },
    options: [
      {
        name: 'None',
        value: 'none',
        description: 'Do not set custom attributes',
      },
      {
        name: 'From Definitions',
        value: 'definition',
        description: 'Select from pre-defined contact attributes',
      },
      {
        name: 'Using Fields Below',
        value: 'keypair',
      },
      {
        name: 'JSON',
        value: 'json',
      },
    ],
    default: 'none',
  },
  {
    displayName: 'Custom Attributes',
    name: 'customAttributesDefinitionCreate',
    type: 'fixedCollection',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['create'],
        specifyCustomAttributesCreate: ['definition'],
      },
    },
    typeOptions: {
      multipleValues: true,
    },
    placeholder: 'Add Attribute',
    default: {
      attributes: [],
    },
    options: [
      {
        name: 'attributes',
        displayName: 'Attribute',
        values: [
          {
            // eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
            displayName: 'Attribute',
            name: 'key',
            type: 'options',
            default: '',
            description: 'Select the custom attribute. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
            typeOptions: {
              loadOptionsMethod: 'loadContactCustomAttributeDefinitionsOptions',
            },
          },
          {
            displayName: 'Value',
            name: 'value',
            type: 'string',
            default: '',
            description: 'Value of the custom attribute',
          },
        ],
      },
    ],
  },
  {
    displayName: 'Custom Attributes',
    name: 'customAttributesParametersCreate',
    type: 'fixedCollection',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['create'],
        specifyCustomAttributesCreate: ['keypair'],
      },
    },
    typeOptions: {
      multipleValues: true,
    },
    placeholder: 'Add Attribute',
    default: {
      attributes: [
        {
          name: '',
          value: '',
        },
      ],
    },
    options: [
      {
        name: 'attributes',
        displayName: 'Attribute',
        values: [
          {
            displayName: 'Name',
            name: 'name',
            type: 'string',
            default: '',
            description: 'Name of the custom attribute',
          },
          {
            displayName: 'Value',
            name: 'value',
            type: 'string',
            default: '',
            description: 'Value of the custom attribute',
          },
        ],
      },
    ],
  },
  {
    displayName: 'JSON',
    name: 'customAttributesJsonCreate',
    type: 'json',
    default: '{}',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['create'],
        specifyCustomAttributesCreate: ['json'],
      },
    },
  },

  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Avatar URL',
        name: 'avatarUrl',
        type: 'string',
        default: '',
        placeholder: 'https://example.com/avatar.jpg',
        description: 'The URL to a JPEG or PNG file for the contact avatar',
      },
      {
        displayName: 'Blocked',
        name: 'blocked',
        type: 'boolean',
        default: false,
        description: 'Whether the contact is blocked or not',
      },
      {
        displayName: 'City',
        name: 'city',
        type: 'string',
        default: '',
        description: 'City of the contact',
      },
      {
        displayName: 'Company Name',
        name: 'company_name',
        type: 'string',
        default: '',
        description: 'Company name of the contact',
      },
      {
        displayName: 'Country',
        name: 'country',
        type: 'string',
        default: '',
        description: 'Country of the contact',
      },
      {
        displayName: 'Country Code',
        name: 'country_code',
        type: 'string',
        default: '',
        placeholder: 'BR',
        description: 'ISO country code of the contact (e.g., BR, US)',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description or notes about the contact',
      },
      {
        displayName: 'Extra Additional Attributes',
        name: 'extraAdditionalAttributes',
        type: 'fixedCollection',
        default: {},
        placeholder: 'Add Attribute',
        description: 'Add extra additional attributes beyond the predefined fields above',
        typeOptions: {
          multipleValues: true,
        },
        options: [
          {
            name: 'attributes',
            displayName: 'Attribute',
            values: [
              {
                displayName: 'Key',
                name: 'key',
                type: 'string',
                default: '',
                description: 'Attribute key',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'Attribute value',
              },
            ],
          },
        ],
      },
      {
        displayName: 'Identifier',
        name: 'identifier',
        type: 'string',
        default: '',
        description: 'A unique identifier for the contact in an external system',
      },
      {
        displayName: 'Social Profiles',
        name: 'socialProfiles',
        type: 'fixedCollection',
        default: {},
        placeholder: 'Add Social Profile',
        typeOptions: {
          multipleValues: false,
        },
        options: [
          {
            displayName: 'Profiles',
            name: 'profiles',
            values: [
              {
                displayName: 'Facebook',
                name: 'facebook',
                type: 'string',
                default: '',
                description: 'Facebook profile URL or username',
              },
              {
                displayName: 'GitHub',
                name: 'github',
                type: 'string',
                default: '',
                description: 'GitHub profile URL or username',
              },
              {
                displayName: 'Instagram',
                name: 'instagram',
                type: 'string',
                default: '',
                description: 'Instagram profile URL or username',
              },
              {
                displayName: 'LinkedIn',
                name: 'linkedin',
                type: 'string',
                default: '',
                description: 'LinkedIn profile URL or username',
              },
              {
                displayName: 'Twitter',
                name: 'twitter',
                type: 'string',
                default: '',
                description: 'Twitter/X profile URL or username',
              },
            ],
          },
        ],
        description: 'Social media profiles of the contact',
      },
    ],
  },
  {
    displayName: 'Specify Custom Attributes',
    name: 'specifyCustomAttributesUpdate',
    type: 'options',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['update'],
      },
    },
    options: [
      {
        name: 'None',
        value: 'none',
        description: 'Do not modify custom attributes',
      },
      {
        name: 'From Definitions',
        value: 'definition',
        description: 'Select from pre-defined contact attributes',
      },
      {
        name: 'Using Fields Below',
        value: 'keypair',
      },
      {
        name: 'JSON',
        value: 'json',
      },
    ],
    default: 'none',
  },
  {
    displayName: 'Custom Attributes',
    name: 'customAttributesDefinitionUpdate',
    type: 'fixedCollection',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['update'],
        specifyCustomAttributesUpdate: ['definition'],
      },
    },
    typeOptions: {
      multipleValues: true,
    },
    placeholder: 'Add Attribute',
    default: {
      attributes: [],
    },
    options: [
      {
        name: 'attributes',
        displayName: 'Attribute',
        values: [
          {
            // eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
            displayName: 'Attribute',
            name: 'key',
            type: 'options',
            default: '',
            description: 'Select the custom attribute. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
            typeOptions: {
              loadOptionsMethod: 'loadContactCustomAttributeDefinitionsOptions',
            },
          },
          {
            displayName: 'Value',
            name: 'value',
            type: 'string',
            default: '',
            description: 'Value of the custom attribute',
          },
        ],
      },
    ],
  },
  {
    displayName: 'Custom Attributes',
    name: 'customAttributesParametersUpdate',
    type: 'fixedCollection',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['update'],
        specifyCustomAttributesUpdate: ['keypair'],
      },
    },
    typeOptions: {
      multipleValues: true,
    },
    placeholder: 'Add Attribute',
    default: {
      attributes: [
        {
          name: '',
          value: '',
        },
      ],
    },
    options: [
      {
        name: 'attributes',
        displayName: 'Attribute',
        values: [
          {
            displayName: 'Name',
            name: 'name',
            type: 'string',
            default: '',
            description: 'Name of the custom attribute',
          },
          {
            displayName: 'Value',
            name: 'value',
            type: 'string',
            default: '',
            description: 'Value of the custom attribute',
          },
        ],
      },
    ],
  },
  {
    displayName: 'JSON',
    name: 'customAttributesJsonUpdate',
    type: 'json',
    default: '{}',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['update'],
        specifyCustomAttributesUpdate: ['json'],
      },
    },
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Avatar URL',
        name: 'avatarUrl',
        type: 'string',
        default: '',
        placeholder: 'https://example.com/avatar.jpg',
        description: 'The URL to a JPEG or PNG file for the contact avatar',
      },
      {
        displayName: 'Blocked',
        name: 'blocked',
        type: 'boolean',
        default: false,
        description: 'Whether the contact is blocked or not',
      },
      {
        displayName: 'City',
        name: 'city',
        type: 'string',
        default: '',
        description: 'City of the contact',
      },
      {
        displayName: 'Company Name',
        name: 'company_name',
        type: 'string',
        default: '',
        description: 'Company name of the contact',
      },
      {
        displayName: 'Country',
        name: 'country',
        type: 'string',
        default: '',
        description: 'Country of the contact',
      },
      {
        displayName: 'Country Code',
        name: 'country_code',
        type: 'string',
        default: '',
        placeholder: 'BR',
        description: 'ISO country code of the contact (e.g., BR, US)',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description or notes about the contact',
      },
      {
        displayName: 'Extra Additional Attributes',
        name: 'extraAdditionalAttributes',
        type: 'fixedCollection',
        default: {},
        placeholder: 'Add Attribute',
        description: 'Add extra additional attributes beyond the predefined fields above',
        typeOptions: {
          multipleValues: true,
        },
        options: [
          {
            name: 'attributes',
            displayName: 'Attribute',
            values: [
              {
                displayName: 'Key',
                name: 'key',
                type: 'string',
                default: '',
                description: 'Attribute key',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'Attribute value',
              },
            ],
          },
        ],
      },
      {
        displayName: 'Identifier',
        name: 'identifier',
        type: 'string',
        default: '',
        description: 'A unique identifier for the contact in an external system',
      },
      {
        displayName: 'Social Profiles',
        name: 'socialProfiles',
        type: 'fixedCollection',
        default: {},
        placeholder: 'Add Social Profile',
        typeOptions: {
          multipleValues: false,
        },
        options: [
          {
            displayName: 'Profiles',
            name: 'profiles',
            values: [
              {
                displayName: 'Facebook',
                name: 'facebook',
                type: 'string',
                default: '',
                description: 'Facebook profile URL or username',
              },
              {
                displayName: 'GitHub',
                name: 'github',
                type: 'string',
                default: '',
                description: 'GitHub profile URL or username',
              },
              {
                displayName: 'Instagram',
                name: 'instagram',
                type: 'string',
                default: '',
                description: 'Instagram profile URL or username',
              },
              {
                displayName: 'LinkedIn',
                name: 'linkedin',
                type: 'string',
                default: '',
                description: 'LinkedIn profile URL or username',
              },
              {
                displayName: 'Twitter',
                name: 'twitter',
                type: 'string',
                default: '',
                description: 'Twitter/X profile URL or username',
              },
            ],
          },
        ],
        description: 'Social media profiles of the contact',
      },
    ],
  },
  {
    displayName: 'Specify Custom Attributes',
    name: 'specifyCustomAttributes',
    type: 'options',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['setCustomAttributes'],
      },
    },
    options: [
      {
        name: 'From Definitions',
        value: 'definition',
        description: 'Select from pre-defined contact attributes',
      },
      {
        name: 'Using Fields Below',
        value: 'keypair',
      },
      {
        name: 'JSON',
        value: 'json',
      },
    ],
    default: 'definition',
  },
  {
    displayName: 'Custom Attributes',
    name: 'customAttributesDefinition',
    type: 'fixedCollection',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['setCustomAttributes'],
        specifyCustomAttributes: ['definition'],
      },
    },
    typeOptions: {
      multipleValues: true,
    },
    placeholder: 'Add Attribute',
    default: {
      attributes: [],
    },
    options: [
      {
        name: 'attributes',
        displayName: 'Attribute',
        values: [
          {
            // eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
            displayName: 'Attribute',
            name: 'key',
            type: 'options',
            default: '',
            description: 'Select the custom attribute. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
            typeOptions: {
              loadOptionsMethod: 'loadContactCustomAttributeDefinitionsOptions',
            },
          },
          {
            displayName: 'Value',
            name: 'value',
            type: 'string',
            default: '',
            description: 'Value of the custom attribute',
          },
        ],
      },
    ],
  },
  {
    displayName: 'Custom Attributes',
    name: 'customAttributesParameters',
    type: 'fixedCollection',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['setCustomAttributes'],
        specifyCustomAttributes: ['keypair'],
      },
    },
    typeOptions: {
      multipleValues: true,
    },
    placeholder: 'Add Attribute',
    default: {
      attributes: [
        {
          name: '',
          value: '',
        },
      ],
    },
    options: [
      {
        name: 'attributes',
        displayName: 'Attribute',
        values: [
          {
            displayName: 'Name',
            name: 'name',
            type: 'string',
            default: '',
            description: 'Name of the custom attribute',
          },
          {
            displayName: 'Value',
            name: 'value',
            type: 'string',
            default: '',
            description: 'Value of the custom attribute',
          },
        ],
      },
    ],
  },
  {
    displayName: 'JSON',
    name: 'customAttributesJson',
    type: 'json',
    default: '{}',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['setCustomAttributes'],
        specifyCustomAttributes: ['json'],
      },
    },
  },
  {
    displayName: 'Custom Attributes to Destroy',
    name: 'customAttributesToDestroy',
    type: 'multiOptions',
    required: true,
    typeOptions: {
      loadOptionsMethod: 'loadContactCustomAttributeDefinitionsOptions',
    },
    default: [],
    description: 'Select the custom attributes that will be destroyed. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['destroyCustomAttributes'],
      },
    },
  }
];

export const contactDescription: INodeProperties[] = [
  ...contactOperations,
  ...contactFields,
];

export { executeContactOperation } from './operations';
