import type { AccountOperation } from './account/types';
import type { ContactOperation } from './contact/types';
import type { ConversationOperation } from './conversation/types';
import type { CustomAttributeOperation } from './customAttribute/types';
import type { InboxOperation } from './inbox/types';
import type { KanbanOperation } from './kanban/types';
import type { LabelOperation } from './label/types';
import type { MessageOperation } from './message/types';
import type { ProfileOperation } from './profile/types';
import type { WebhookOperation } from './webhook/types';

export type ChatwootResources =
	| 'account'
	| 'contact'
	| 'conversation'
	| 'customAttribute'
	| 'inbox'
	| 'kanban'
	| 'label'
	| 'message'
	| 'profile'
	| 'webhook';

export type ChatwootOperations =
	| AccountOperation
	| ContactOperation
	| ConversationOperation
	| CustomAttributeOperation
	| InboxOperation
	| KanbanOperation
	| LabelOperation
	| MessageOperation
	| ProfileOperation
	| WebhookOperation;

export type {
	AccountOperation,
	ContactOperation,
	ConversationOperation,
	CustomAttributeOperation,
	InboxOperation,
	KanbanOperation,
	LabelOperation,
	MessageOperation,
	ProfileOperation,
	WebhookOperation,
};
