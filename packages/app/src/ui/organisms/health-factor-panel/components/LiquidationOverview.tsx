import { ReactNode } from 'react'

import { LiquidationDetails } from '@/domain/market-info/getLiquidationDetails'
import { USD_MOCK_TOKEN } from '@/domain/types/Token'
import { Typography } from '@/ui/atoms/typography/Typography'
import { Info } from '@/ui/molecules/info/Info'
import { cn } from '@/ui/utils/style'

import { HealthFactorPanelProps } from '../HealthFactorPanel'

interface LiquidationOverview {
  liquidationDetails: LiquidationDetails | undefined
  variant: HealthFactorPanelProps['variant']
}

export function LiquidationOverview({ liquidationDetails, variant }: LiquidationOverview) {
  if (variant === 'with-liquidation-price') {
    return liquidationDetails ? <LiquidationPrices liquidationDetails={liquidationDetails} variant={variant} /> : null
  }

  return (
    <div className="mt-6 flex flex-col">
      <Typography variant="prompt" className="text-base">
        If the health factor drops below 1, the liquidation of your collateral might be triggered.
      </Typography>
      {liquidationDetails && (
        <LiquidationPrices liquidationDetails={liquidationDetails} variant={variant} className="mt-8" />
      )}
    </div>
  )
}

interface DetailsRowProps {
  children: ReactNode
  variant: HealthFactorPanelProps['variant']
}

function DetailsRow({ children, variant }: DetailsRowProps) {
  return (
    <div
      className={cn(
        'border-basics-dark-grey/20 flex flex-row justify-between border-t py-1',
        variant === 'full-details' && 'py-3',
      )}
    >
      {children}
    </div>
  )
}

interface LiquidationPricesProps {
  liquidationDetails: LiquidationDetails
  variant: HealthFactorPanelProps['variant']
  className?: string
}

function LiquidationPrices({ liquidationDetails, variant, className }: LiquidationPricesProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <DetailsRow variant={variant}>
        <div className="flex flex-row items-center gap-1">
          Liquidation Price
          <Info>Price of the collateral asset at which the position will be liquidated.</Info>
        </div>
        <div>{USD_MOCK_TOKEN.formatUSD(liquidationDetails.liquidationPrice)}</div>
      </DetailsRow>
      <DetailsRow variant={variant}>
        <div className="flex flex-row items-center gap-1">
          Current {liquidationDetails.tokenWithPrice.symbol} Price
          <Info>Current price of the collateral asset.</Info>
        </div>
        <div>{USD_MOCK_TOKEN.formatUSD(liquidationDetails.tokenWithPrice.priceInUSD)}</div>
      </DetailsRow>
    </div>
  )
}
