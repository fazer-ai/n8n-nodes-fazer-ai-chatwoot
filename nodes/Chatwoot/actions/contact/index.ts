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
        name: 'Set Custom Attribute',
        value: 'setCustomAttributes',
        description: 'Set custom attributes on a contact',
        action: 'Set custom attribute on contact',
      },
      {
        name: 'Destroy Custom Attributes',
        value: 'destroyCustomAttributes',
        description: 'Destroy all custom attributes of a contact',
        action: 'Destroy all custom attributes of contact',
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
        operation: ['get', 'update', 'delete', 'setCustomAttributes', 'destroyCustomAttributes'],
      },
    },
  },
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    default: '',
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
    name: 'nameOptional',
    type: 'string',
    default: '',
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
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        ...showOnlyForContact,
        operation: ['create', 'update'],
      },
    },
    options: [
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
        name: 'Using Fields Below',
        value: 'keypair',
      },
      {
        name: 'Using JSON',
        value: 'json',
      },
    ],
    default: 'keypair',
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
    description: 'Custom attributes as JSON object (key-value pairs)',
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
