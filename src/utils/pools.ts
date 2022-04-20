import { Token, TokenAmount, CETH } from '@mutantswap/sdk'
import { MCOIN } from '../constants'
import { unwrappedToken } from './wrappedCurrency'

export const getPairRenderOrder = (token0: Token, token1: Token) => {
  const currency0 = unwrappedToken(token0)
  const currency1 = unwrappedToken(token1)

  const token0IsFirst = {
    currency0,
    currency1,
    token0,
    token1
  }
  const token1IsFirst = {
    currency0: currency1,
    currency1: currency0,
    token0: token1,
    token1: token0
  }

  // If pair has CETH, put CETH second
  //      If MCOIN is the other token, it'll be first
  if (currency0 === CETH || currency1 === CETH) {
    return currency0 === CETH ? token1IsFirst : token0IsFirst
  }

  // If pair has MCOIN, put MCOIN first
  return token0.equals(MCOIN[token0.chainId]) ? token0IsFirst : token1IsFirst
}

export const isTokenAmountPositive = (stakedAmount: TokenAmount | null) => {
  return Boolean(stakedAmount?.greaterThan('0') ?? false)
}
