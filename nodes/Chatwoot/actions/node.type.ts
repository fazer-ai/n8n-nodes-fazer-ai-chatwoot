import type { AccountOperation } from './account/types';
import type { AgentOperation } from './agent/types';
import type { ContactOperation } from './contact/types';
import type { ConversationOperation } from './conversation/types';
import type { CustomAttributeOperation } from './customAttribute/types';
import type { InboxOperation } from './inbox/types';
import type { KanbanBoardOperation } from './kanbanBoard/types';
import type { KanbanStepOperation } from './kanbanStep/types';
import type { KanbanTaskOperation } from './kanbanTask/types';
import type { LabelOperation } from './label/types';
import type { ProfileOperation } from './profile/types';
import type { TeamOperation } from './team/types';

export type ChatwootResources =
	| 'account'
	| 'agent'
	| 'contact'
	| 'conversation'
	| 'customAttribute'
	| 'inbox'
	| 'kanbanBoard'
	| 'kanbanStep'
	| 'kanbanTask'
	| 'label'
	| 'profile'
	| 'team';

export type ChatwootOperations =
	| AccountOperation
	| AgentOperation
	| ContactOperation
	| ConversationOperation
	| CustomAttributeOperation
	| InboxOperation
	| KanbanBoardOperation
	| KanbanStepOperation
	| KanbanTaskOperation
	| LabelOperation
	| ProfileOperation
	| TeamOperation;

export type {
	AccountOperation,
	AgentOperation,
	ContactOperation,
	ConversationOperation,
	CustomAttributeOperation,
	InboxOperation,
	KanbanBoardOperation,
	KanbanStepOperation,
	KanbanTaskOperation,
	LabelOperation,
	ProfileOperation,
	TeamOperation,
};
