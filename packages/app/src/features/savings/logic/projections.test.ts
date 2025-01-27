import { NormalizedUnitNumber } from '@/domain/types/NumericValues'
import { bigNumberify } from '@/utils/bigNumber'

import { convertDaiToShares, convertSharesToDai } from './projections'

describe(convertSharesToDai.name, () => {
  it('accounts for dsr', () => {
    const timestamp = 1000
    const shares = NormalizedUnitNumber(100)
    const fivePercentYield = convertSharesToDai({
      timestamp: timestamp + 24 * 60 * 60,
      shares,
      potParams: {
        dsr: bigNumberify('1000000564701133626865910626'), // 5% / day
        rho: bigNumberify(timestamp),
        chi: bigNumberify('1000000000000000000000000000'), // 1
      },
    })
    expect(fivePercentYield.minus(NormalizedUnitNumber(105)).abs().lt(1e-18)).toEqual(true)

    const tenPercentYield = convertSharesToDai({
      timestamp: timestamp + 24 * 60 * 60,
      shares,
      potParams: {
        dsr: bigNumberify('1000001103127689513476993127'), // 10% / day
        rho: bigNumberify(timestamp),
        chi: bigNumberify('1000000000000000000000000000'), // 1
      },
    })
    expect(tenPercentYield.minus(NormalizedUnitNumber(110)).abs().lt(1e-18)).toEqual(true)
  })

  it('accounts for chi', () => {
    const timestamp = 1000
    const shares = NormalizedUnitNumber(100)
    const fivePercentYield = convertSharesToDai({
      timestamp: timestamp + 24 * 60 * 60,
      shares,
      potParams: {
        dsr: bigNumberify('1000000564701133626865910626'), // 5% / day
        rho: bigNumberify(timestamp),
        chi: bigNumberify('1050000000000000000000000000'), // 1.05
      },
    })
    expect(fivePercentYield.minus(NormalizedUnitNumber(110.25)).abs().lt(1e-18)).toEqual(true)

    const tenPercentYield = convertSharesToDai({
      timestamp: timestamp + 24 * 60 * 60,
      shares,
      potParams: {
        dsr: bigNumberify('1000001103127689513476993127'), // 10% / day
        rho: bigNumberify(timestamp),
        chi: bigNumberify('1050000000000000000000000000'), // 1.05
      },
    })
    expect(tenPercentYield.minus(NormalizedUnitNumber(115.5)).abs().lt(1e-18)).toEqual(true)
  })
})

describe(convertDaiToShares.name, () => {
  it('accounts for dsr', () => {
    const timestamp = 1000
    const dai = NormalizedUnitNumber(105)
    const result = convertDaiToShares({
      timestamp: timestamp + 24 * 60 * 60,
      dai,
      potParams: {
        dsr: bigNumberify('1000000564701133626865910626'), // 5% / day
        rho: bigNumberify(timestamp),
        chi: bigNumberify('1000000000000000000000000000'), // 1
      },
    })
    expect(result.minus(NormalizedUnitNumber(100)).abs().lt(1e-18)).toEqual(true)
  })

  it('accounts for chi', () => {
    const timestamp = 1000
    const dai = NormalizedUnitNumber(110.25)
    const result = convertDaiToShares({
      timestamp: timestamp + 24 * 60 * 60,
      dai,
      potParams: {
        dsr: bigNumberify('1000000564701133626865910626'), // 5% / day
        rho: bigNumberify(timestamp),
        chi: bigNumberify('1050000000000000000000000000'), // 1.05
      },
    })
    expect(result.minus(NormalizedUnitNumber(100)).abs().lt(1e-18)).toEqual(true)
  })
})
