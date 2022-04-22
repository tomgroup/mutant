import { TransactionResponse } from '@ethersproject/providers'
import { TokenAmount, CurrencyAmount, CETH } from '@mutantswap/sdk'
import { useCallback, useMemo } from 'react'
import { useTokenAllowance } from '../data/Allowances'
import { useTransactionAdder } from '../state/transactions/hooks'
import { useClaimContract } from './useContract'
import { useActiveWeb3React } from './index'

export enum ClaimState {
  UNKNOWN,
  NOT_CLAIMED,
  PENDING,
  CLAIMED
}

export function useClaimCallback(amountToClaim?: CurrencyAmount, spender?: string): [ClaimState, () => Promise<void>] {
  const { account } = useActiveWeb3React()
  const claimContract = useClaimContract()
  const addTransaction = useTransactionAdder()
  const token = amountToClaim instanceof TokenAmount ? amountToClaim.token : undefined
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)

  const claimState: ClaimState = useMemo(() => {
    if (!amountToClaim || !account) return ClaimState.UNKNOWN
    if (!currentAllowance) return ClaimState.UNKNOWN
    if (amountToClaim.currency === CETH) return ClaimState.CLAIMED

    return currentAllowance.greaterThan(amountToClaim) ? ClaimState.NOT_CLAIMED : ClaimState.CLAIMED
  }, [account, amountToClaim])
  const claim = useCallback(async (): Promise<void> => {
    if (claimContract == null) return
    return claimContract
      .claim()
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: 'Claim'
        })
      })
      .catch((error: Error) => {
        console.debug('Failed to approve token', error)
        throw error
      })
  }, [claimState, claimContract, account, addTransaction])

  return [claimState, claim]
}