import {
  BorrowEligibilityStatus,
  CollateralEligibilityStatus,
  SupplyAvailabilityStatus,
} from '@/domain/market-info/reserve-status'
import { NormalizedUnitNumber, Percentage } from '@/domain/types/NumericValues'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'

import { InterestYieldChartProps } from './components/charts/interest-yield/InterestYieldChart'
import { EnabledEModeCategory } from './components/status-panel/components/emode-badge/EModeBadge'

export interface SupplyReplacementInfo {
  token: Token
  totalSupplied: NormalizedUnitNumber
  supplyAPY: Percentage
}
export interface MarketOverview {
  supply?: {
    status: SupplyAvailabilityStatus
    totalSupplied: NormalizedUnitNumber
    supplyCap?: NormalizedUnitNumber
    apy: Percentage
  }
  collateral: {
    status: CollateralEligibilityStatus
    token: Token
    debtCeiling: NormalizedUnitNumber
    debt: NormalizedUnitNumber
    maxLtv: Percentage
    liquidationThreshold: Percentage
    liquidationPenalty: Percentage
    supplyReplacement?: SupplyReplacementInfo
  }
  borrow: {
    status: BorrowEligibilityStatus
    totalBorrowed: NormalizedUnitNumber
    borrowCap?: NormalizedUnitNumber
    apy: Percentage
    reserveFactor: Percentage
    chartProps: InterestYieldChartProps
    showTokenBadge?: boolean
  }
  lend?: {
    status: 'yes' // only for dai
    token: Token
    totalLent: NormalizedUnitNumber
    apy: Percentage
  }
  eMode?: {
    maxLtv: Percentage
    liquidationThreshold: Percentage
    liquidationPenalty: Percentage
    category: EnabledEModeCategory
    eModeCategoryTokens: TokenSymbol[]
    token?: Token
  }
  summary:
    | {
        type: 'default'
        marketSize: NormalizedUnitNumber
        borrowed: NormalizedUnitNumber
        available: NormalizedUnitNumber
        utilizationRate: Percentage
      }
    | {
        type: 'dai'
        marketSize: NormalizedUnitNumber
        borrowed: NormalizedUnitNumber
        instantlyAvailable: NormalizedUnitNumber
        makerDaoCapacity: NormalizedUnitNumber
        totalAvailable: NormalizedUnitNumber
        utilizationRate: Percentage
      }
}

export interface WalletOverview {
  guestMode: boolean
  token: Token
  tokenBalance: NormalizedUnitNumber
  lend?: {
    available: NormalizedUnitNumber
    token: Token
  }
  deposit: {
    available: NormalizedUnitNumber
    token: Token
  }
  borrow: {
    available: NormalizedUnitNumber
    token: Token
  }
}
