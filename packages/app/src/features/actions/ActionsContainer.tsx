import { withSuspense } from '@/ui/utils/withSuspense'
import { RequireKeys } from '@/utils/types'
import { useDebounce } from '@/utils/useDebounce'

import { ActionsSkeleton } from './components/skeleton/ActionsSkeleton'
import { stringifyObjectivesDeep, stringifyObjectivesToStableActions } from './logic/stringifyObjectives'
import { Objective } from './logic/types'
import { useActionHandlers } from './logic/useActionHandlers'
import { ActionsView } from './views/ActionsView'

export interface ActionsContainerProps {
  objectives: Objective[]
  onFinish?: () => void // called only once, after render when all actions are marked successful
  variant?: 'default' | 'dialog'
  enabled?: boolean
}

function ActionsContainer({
  objectives,
  onFinish,
  variant = 'default',
  enabled,
}: RequireKeys<ActionsContainerProps, 'enabled'>) {
  const { handlers, actionsSettings, gasPrice, settingsDisabled } = useActionHandlers(objectives, {
    enabled,
    onFinish,
  })

  return (
    <ActionsView
      variant={variant}
      actionHandlers={handlers}
      actionsSettings={actionsSettings}
      settingsDisabled={settingsDisabled}
      gasPrice={gasPrice}
    />
  )
}

// @note: rerenders ActionsContainer when actions change. This is needed to not break the rule of hooks
function ActionsContainerWithKey(props: ActionsContainerProps) {
  const instantKey = stringifyObjectivesDeep(props.objectives)
  const { debouncedValue: debouncedActions, isDebouncing } = useDebounce(props.objectives, instantKey)
  const enabled = (props.enabled ?? true) && !isDebouncing

  return (
    <ActionsContainer
      {...props}
      objectives={debouncedActions}
      enabled={enabled}
      key={stringifyObjectivesToStableActions(debouncedActions)}
    />
  )
}
const ActionsContainerWithSuspense = withSuspense(ActionsContainerWithKey, ActionsSkeleton)
export { ActionsContainerWithSuspense as ActionsContainer }
