import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'

import { getNativeAssetInfo } from '@/config/chain/utils/getNativeAssetInfo'
import { TokenWithBalance, TokenWithValue } from '@/domain/common/types'
import { useConditionalFreeze } from '@/domain/hooks/useConditionalFreeze'
import { useAaveDataLayer } from '@/domain/market-info/aave-data-layer/useAaveDataLayer'
import { updatePositionSummary } from '@/domain/market-info/updatePositionSummary'
import { useMarketInfo } from '@/domain/market-info/useMarketInfo'
import { Token } from '@/domain/types/Token'
import { useWalletInfo } from '@/domain/wallet/useWalletInfo'
import { Objective } from '@/features/actions/logic/types'

import { AssetInputSchema, getActionAsset } from '../../common/logic/form'
import { useUpdateFormMaxValue } from '../../common/logic/useUpdateFormMaxValue'
import { FormFieldsForDialog, PageState, PageStatus } from '../../common/types'
import { getTokenSupply, getWithdrawOptions } from './assets'
import { getFormFieldsForWithdrawDialog, getWithdrawDialogFormValidator } from './form'
import { getWithdrawInFullOptions } from './getWithdrawInFullOptions'
import { createWithdrawObjectives } from './objectives'
import { PositionOverview } from './types'

export interface UseWithdrawDialogOptions {
  initialToken: Token
}

export interface UseWithdrawDialogResult {
  withdrawOptions: TokenWithBalance[]
  assetsToWithdrawFields: FormFieldsForDialog
  withdrawAsset: TokenWithValue
  objectives: Objective[]
  pageStatus: PageStatus
  form: UseFormReturn<AssetInputSchema>
  currentPositionOverview: PositionOverview
  updatedPositionOverview?: PositionOverview
}

export function useWithdrawDialog({ initialToken }: UseWithdrawDialogOptions): UseWithdrawDialogResult {
  const { aaveData } = useAaveDataLayer()
  const { marketInfo } = useMarketInfo()
  const walletInfo = useWalletInfo()
  const nativeAssetInfo = getNativeAssetInfo(marketInfo.chainId)

  const [pageStatus, setPageStatus] = useState<PageState>('form')

  const form = useForm<AssetInputSchema>({
    resolver: zodResolver(getWithdrawDialogFormValidator({ marketInfo, aaveData, nativeAssetInfo })),
    defaultValues: {
      symbol: initialToken.symbol,
      value: '',
    },
    mode: 'onChange',
  })

  const { withdrawInFull, maxWithdrawValue } = getWithdrawInFullOptions(form, marketInfo)
  useUpdateFormMaxValue({ isMaxSet: withdrawInFull, maxValue: maxWithdrawValue, token: initialToken, form })

  const withdrawOptions = getWithdrawOptions({
    token: initialToken,
    marketInfo,
    walletInfo,
    nativeAssetInfo,
  })

  const withdrawAsset = useConditionalFreeze(
    getActionAsset(form, marketInfo, maxWithdrawValue),
    pageStatus === 'success',
  )

  const assetsToWithdrawFields = getFormFieldsForWithdrawDialog(form, marketInfo, walletInfo, maxWithdrawValue)

  const tokenSupply = getTokenSupply(marketInfo, withdrawAsset)

  const objectives = createWithdrawObjectives(withdrawAsset, { all: withdrawInFull })

  const currentPositionOverview = {
    healthFactor: marketInfo.userPositionSummary.healthFactor,
    tokenSupply,
    supplyAPY: withdrawAsset.reserve.supplyAPY,
  }
  const updatedUserSummary = updatePositionSummary({
    withdrawals: [withdrawAsset],
    marketInfo,
    aaveData,
    nativeAssetInfo,
  })
  const updatedPositionOverview = withdrawAsset.value.eq(0)
    ? undefined
    : {
        ...currentPositionOverview,
        healthFactor: updatedUserSummary.healthFactor,
        tokenSupply,
      }

  return {
    form,
    withdrawOptions,
    assetsToWithdrawFields,
    withdrawAsset,
    objectives,
    pageStatus: {
      state: pageStatus,
      actionsEnabled: withdrawAsset.value.gt(0) && form.formState.isValid,
      goToSuccessScreen: () => setPageStatus('success'),
    },
    currentPositionOverview,
    updatedPositionOverview,
  }
}
