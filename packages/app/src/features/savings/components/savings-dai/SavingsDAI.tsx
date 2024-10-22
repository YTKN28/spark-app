import BigNumber from 'bignumber.js'

import { formatPercentage } from '@/domain/common/format'
import { TokenWithBalance } from '@/domain/common/types'
import { OpenDialogFunction } from '@/domain/state/dialogs'
import { NormalizedUnitNumber, Percentage } from '@/domain/types/NumericValues'
import { USD_MOCK_TOKEN } from '@/domain/types/Token'
import { SavingsWithdrawDialog } from '@/features/dialogs/savings/withdraw/SavingsWithdrawDialog'
import { Button } from '@/ui/atoms/button/Button'
import { Panel } from '@/ui/atoms/panel/Panel'

import { Projections } from '../../types'
import { SavingsInfoTile } from '../savings-info-tile/SavingsInfoTile'
import { DSRLabel } from '../savings-opportunity/components/DSRLabel'

export interface SavingsDAIProps {
  depositedUSD: NormalizedUnitNumber
  depositedUSDPrecision: number
  sDAIBalance: TokenWithBalance
  DSR: Percentage
  projections: Projections
  openDialog: OpenDialogFunction
}

export function SavingsDAI({
  depositedUSD,
  depositedUSDPrecision,
  sDAIBalance,
  DSR,
  projections,
  openDialog,
}: SavingsDAIProps) {
  const compactProjections = projections.thirtyDays.gt(1_000)

  return (
    <Panel.Wrapper className="flex min-h-[260px] w-full flex-1 flex-col justify-between self-stretch px-6 py-6 md:px-[32px]">
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-1">
          <h2 className="text-basics-black whitespace-nowrap text-base font-semibold sm:text-xl">Savings DAI</h2>
        </div>
        <div className="flex flex-row gap-2">
          <Button variant="secondary" size="sm" onClick={() => openDialog(SavingsWithdrawDialog, {})}>
            Withdraw
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 sm:gap-2">
        <div className="flex flex-row items-end justify-center slashed-zero tabular-nums">
          <div className="text-3xl font-semibold md:text-5xl">{getWholePart(depositedUSD)}</div>
          {depositedUSDPrecision > 0 && (
            <div className="text-lg font-semibold md:text-2xl">
              {getFractionalPart(depositedUSD, depositedUSDPrecision)}
            </div>
          )}
        </div>
        <div className="text-basics-dark-grey text-xs font-semibold tracking-wide">
          ={sDAIBalance.token.format(sDAIBalance.balance, { style: 'auto' })} {sDAIBalance.token.symbol}
        </div>
      </div>
      <div className="flex flex-row items-end justify-between border-t pt-6">
        <SavingsInfoTile>
          <SavingsInfoTile.Label tooltipContent="This is how much you'll earn in 30 days">
            <div className="hidden md:block">30-day projection</div>
            <div className="md:hidden"> 30-day </div>
          </SavingsInfoTile.Label>
          <SavingsInfoTile.Value color="green">
            +
            {USD_MOCK_TOKEN.formatUSD(projections.thirtyDays, {
              showCents: 'when-not-round',
              compact: compactProjections,
            })}
          </SavingsInfoTile.Value>
        </SavingsInfoTile>
        <SavingsInfoTile>
          <SavingsInfoTile.Label tooltipContent="This is how much you'll earn in 1 year">
            <div className="hidden md:block"> 1-year projection </div>
            <div className="md:hidden"> 1-year </div>
          </SavingsInfoTile.Label>
          <SavingsInfoTile.Value color="green">
            +
            {USD_MOCK_TOKEN.formatUSD(projections.oneYear, {
              showCents: 'when-not-round',
              compact: compactProjections,
            })}
          </SavingsInfoTile.Value>
        </SavingsInfoTile>
        <SavingsInfoTile>
          <DSRLabel />
          <SavingsInfoTile.Value color="green">
            {formatPercentage(DSR, { minimumFractionDigits: 0 })}
          </SavingsInfoTile.Value>
        </SavingsInfoTile>
      </div>
    </Panel.Wrapper>
  )
}

function getWholePart(value: BigNumber): string {
  const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
  return formatter.format(value.integerValue(BigNumber.ROUND_DOWN).toNumber())
}

function getFractionalPart(value: BigNumber, precision: number): string {
  precision = Math.max(precision, 2)
  return value.minus(value.integerValue(BigNumber.ROUND_DOWN)).toFixed(precision).slice(1)
}
