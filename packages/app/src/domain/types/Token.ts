import BigNumber from 'bignumber.js'
import invariant from 'tiny-invariant'
import { zeroAddress } from 'viem'

import { findSignificantPrecision } from '../common/format'
import { CheckedAddress } from './CheckedAddress'
import { BaseUnitNumber, NormalizedUnitNumber } from './NumericValues'
import { TokenSymbol } from './TokenSymbol'

export class Token {
  readonly symbol: TokenSymbol
  readonly name: string
  readonly decimals: number
  readonly address: CheckedAddress
  readonly unitPriceUsd: NormalizedUnitNumber
  readonly isAToken: boolean

  constructor({
    symbol,
    name,
    decimals,
    address,
    unitPriceUsd,
    isAToken = false,
  }: {
    symbol: TokenSymbol
    name: string
    decimals: number
    address: CheckedAddress
    unitPriceUsd: string
    isAToken?: boolean
  }) {
    // sanity checks
    invariant(decimals >= 2, 'decimals value should be greater than 2')
    invariant(decimals <= 30, 'decimals value should be less than 30')

    this.decimals = decimals
    this.symbol = symbol
    this.name = name
    this.address = address
    this.unitPriceUsd = NormalizedUnitNumber(unitPriceUsd)
    this.isAToken = isAToken
  }

  public formatUSD(
    value: NormalizedUnitNumber,
    { compact = false, showCents = 'always' }: FormatUSDOptions = {},
  ): string {
    const USDValue = this.toUSD(value)
    if (value.gt(0) && USDValue.lt(0.01)) {
      return '<$0.01'
    }

    if (compact && USDValue.gte(1000)) {
      return '$' + formatCompact(USDValue)
    }

    const fractionDigitsConfig = {
      always: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
      never: { minimumFractionDigits: 0, maximumFractionDigits: 0 },
      'when-not-round': { minimumFractionDigits: value.isInteger() ? 0 : 2, maximumFractionDigits: 2 },
    } satisfies Record<string, { minimumFractionDigits: number; maximumFractionDigits: number }>

    const usdFormatter = getNumberFormatter({
      style: 'currency',
      currency: 'USD',
      ...fractionDigitsConfig[showCents],
    })
    return usdFormatter.format(USDValue.toNumber())
  }

  public format(value: NormalizedUnitNumber, { style }: FormatOptions): string {
    if (style === 'auto') {
      return formatAuto(value, this.unitPriceUsd)
    }
    return formatCompact(value)
  }

  public toBaseUnit(value: NormalizedUnitNumber): BaseUnitNumber {
    return BaseUnitNumber(value.shiftedBy(this.decimals))
  }

  public fromBaseUnit(value: BaseUnitNumber): NormalizedUnitNumber {
    return NormalizedUnitNumber(value.shiftedBy(-this.decimals))
  }

  public toUSD(value: NormalizedUnitNumber): NormalizedUnitNumber {
    return NormalizedUnitNumber(value.multipliedBy(this.unitPriceUsd))
  }

  public clone({
    address,
    symbol,
    name,
    isAToken,
  }: {
    address?: CheckedAddress
    symbol?: TokenSymbol
    name?: string
    isAToken?: boolean
  }): Token {
    return new Token({
      address: address ?? this.address,
      symbol: symbol ?? this.symbol,
      name: name ?? this.name,
      isAToken: isAToken ?? this.isAToken,
      decimals: this.decimals,
      unitPriceUsd: this.unitPriceUsd.toFixed(),
    })
  }

  public createAToken(address: CheckedAddress): Token {
    return this.clone({
      address,
      symbol: TokenSymbol(`a${this.symbol}`),
      isAToken: true,
    })
  }
}

export interface FormatUSDOptions {
  compact?: boolean
  showCents?: 'always' | 'when-not-round' | 'never'
}

export interface FormatOptions {
  style?: 'auto' | 'compact'
}

export const USD_MOCK_TOKEN = new Token({
  address: CheckedAddress(zeroAddress),
  symbol: TokenSymbol('USD'),
  name: 'US Dollar',
  decimals: 2,
  unitPriceUsd: '1',
})

function formatAuto(value: NormalizedUnitNumber, unitPriceUsd: NormalizedUnitNumber): string {
  const precision = findSignificantPrecision(unitPriceUsd)
  const leastSignificantValue = BigNumber(1).shiftedBy(-precision)
  const rounded = BigNumber(value.toFixed(precision))
  if (value.gt(0) && rounded.lt(leastSignificantValue)) {
    return `<${leastSignificantValue.toFixed()}`
  }

  const formatter = getNumberFormatter({
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.max(precision, 2),
  })

  return formatter.format(value.toNumber())
}

function formatCompact(value: NormalizedUnitNumber): string {
  const n = value.toNumber()
  if (n === 0) return '0'
  if (n < 0.001) return '<0.001'
  if (n < 1) return getNumberFormatter({ maximumFractionDigits: 3 }).format(n)

  const significantDigits = countSignificantDigits(n)
  const fractionDigits = Math.max(0, 4 - significantDigits)

  return getNumberFormatter({
    maximumFractionDigits: fractionDigits,
    notation: 'compact',
  }).format(n)
}

function countSignificantDigits(n: number): number {
  const totalDigits = Math.floor(Math.log10(Math.abs(n))) + 1
  const significantDigits = totalDigits % 3 || 3
  return significantDigits
}

function getNumberFormatter(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  return new Intl.NumberFormat('en-US', options)
}
