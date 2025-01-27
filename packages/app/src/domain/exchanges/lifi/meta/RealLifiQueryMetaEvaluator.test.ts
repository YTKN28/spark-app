import { CheckedAddress } from '@/domain/types/CheckedAddress'
import { testAddresses } from '@/test/integration/constants'

import { LifiQuoteMeta } from '.'
import {
  LIFI_DEFAULT_FEE,
  LIFI_DEFAULT_FEE_INTEGRATOR_KEY,
  LIFI_WAIVED_FEE,
  LIFI_WAIVED_FEE_INTEGRATOR_KEY,
  RealLifiQueryMetaEvaluator,
} from './RealLifiQueryMetaEvaluator'

const dai = testAddresses.token
const sdai = testAddresses.token2
const usdc = testAddresses.token3
const usdt = testAddresses.token4

function evaluate(params: {
  fromToken: CheckedAddress
  toToken: CheckedAddress
  dai?: CheckedAddress
  sdai?: CheckedAddress
  usdc?: CheckedAddress
}): LifiQuoteMeta {
  return new RealLifiQueryMetaEvaluator({ dai, sdai, usdc }).evaluate({
    fromToken: params.fromToken,
    toToken: params.toToken,
  })
}

describe(RealLifiQueryMetaEvaluator.name, () => {
  it('should return the default fee and integrator key when the route is not waived', () => {
    expect(
      evaluate({
        dai,
        sdai,
        usdc,
        fromToken: usdt,
        toToken: dai,
      }),
    ).toEqual({ fee: LIFI_DEFAULT_FEE, integratorKey: LIFI_DEFAULT_FEE_INTEGRATOR_KEY })
  })

  it('returns waived fee and integrator key for sdai to dai route', () => {
    expect(
      evaluate({
        dai,
        sdai,
        usdc,
        fromToken: sdai,
        toToken: dai,
      }),
    ).toEqual({ fee: LIFI_WAIVED_FEE, integratorKey: LIFI_WAIVED_FEE_INTEGRATOR_KEY })
  })

  it('returns waived fee and integrator key for dai to sdai route', () => {
    expect(
      evaluate({
        dai,
        sdai,
        usdc,
        fromToken: dai,
        toToken: sdai,
      }),
    ).toEqual({ fee: LIFI_WAIVED_FEE, integratorKey: LIFI_WAIVED_FEE_INTEGRATOR_KEY })
  })
})
