import { Page, test } from '@playwright/test'

import { borrowValidationIssueToMessage } from '@/domain/market-validators/validateBorrow'
import { ActionsPageObject } from '@/features/actions/ActionsContainer.PageObject'
import { DEFAULT_BLOCK_NUMBER } from '@/test/e2e/constants'
import { setup } from '@/test/e2e/setup'
import { setupFork } from '@/test/e2e/setupFork'
import { screenshot } from '@/test/e2e/utils'

import { BorrowPageObject } from './Borrow.PageObject'
import { DashboardPageObject } from './Dashboard.PageObject'

test.describe('Borrow page', () => {
  const fork = setupFork(DEFAULT_BLOCK_NUMBER)

  test.describe('deposit ETH, borrow DAI', () => {
    let borrowPage: BorrowPageObject
    let actionsContainer: ActionsPageObject
    const deposit = {
      asset: 'ETH',
      amount: 1,
    }
    const borrow = {
      asset: 'DAI',
      amount: 1000,
    }
    const expectedLtv = '44.07%'
    const expectedHealthFactor = '1.87'

    test.beforeEach(async ({ page }) => {
      await setup(page, fork, {
        initialPage: 'easyBorrow',
        account: {
          type: 'connected',
          assetBalances: {
            ETH: 10,
          },
        },
      })

      borrowPage = new BorrowPageObject(page)
      actionsContainer = new ActionsPageObject(page)
    })

    test('calculates LTV correctly', async () => {
      await borrowPage.fillDepositAssetAction(0, deposit.asset, deposit.amount)
      await borrowPage.fillBorrowAssetAction(borrow.amount)

      await borrowPage.submitAction()

      await borrowPage.expectLtv(expectedLtv)
      await borrowPage.expectHealthFactor(expectedHealthFactor)
    })

    test('builds action plan', async ({ page }) => {
      await borrowPage.fillDepositAssetAction(0, deposit.asset, deposit.amount)
      await borrowPage.fillBorrowAssetAction(borrow.amount)

      await borrowPage.submitAction()

      await actionsContainer.expectActions([
        {
          type: 'deposit',
          asset: 'ETH',
          amount: deposit.amount,
        },
        {
          type: 'borrow',
          asset: 'DAI',
          amount: borrow.amount,
        },
      ])
      await screenshot(page, 'deposit-eth-actions-plan')
    })

    test('successfully builds position', async ({ page }) => {
      await borrowPage.fillDepositAssetAction(0, deposit.asset, deposit.amount)
      await borrowPage.fillBorrowAssetAction(borrow.amount)

      await borrowPage.submitAction()

      await actionsContainer.acceptAllActionsAction(2)

      await borrowPage.expectSuccessPage([deposit], borrow, fork)
      await screenshot(page, 'deposit-eth-success')
    })

    test('HF matches after position is created', async ({ page }) => {
      await borrowPage.fillDepositAssetAction(0, deposit.asset, deposit.amount)
      await borrowPage.fillBorrowAssetAction(borrow.amount)

      await borrowPage.submitAction()
      await actionsContainer.acceptAllActionsAction(2)

      await expectHFOnDashboard(page, borrowPage, expectedHealthFactor)
    })
  })

  test.describe('deposit wstETH and rETH, borrow DAI', () => {
    let borrowPage: BorrowPageObject
    let actionsContainer: ActionsPageObject
    const wstETHdeposit = {
      asset: 'wstETH',
      amount: 1,
    }
    const rETHdeposit = {
      asset: 'rETH',
      amount: 1,
    }
    const borrow = {
      asset: 'DAI',
      amount: 1000,
    }
    const expectedLTV = '19.57%'
    const expectedHealthFactor = '4.06'

    test.beforeEach(async ({ page }) => {
      await setup(page, fork, {
        initialPage: 'easyBorrow',
        account: {
          type: 'connected',
          assetBalances: {
            wstETH: 10,
            rETH: 10,
          },
        },
      })

      borrowPage = new BorrowPageObject(page)
      actionsContainer = new ActionsPageObject(page)
    })

    test('calculates LTV correctly', async () => {
      await borrowPage.addNewDepositAssetAction()
      await borrowPage.fillDepositAssetAction(0, wstETHdeposit.asset, wstETHdeposit.amount)
      await borrowPage.fillDepositAssetAction(1, rETHdeposit.asset, rETHdeposit.amount)
      await borrowPage.fillBorrowAssetAction(borrow.amount)

      await borrowPage.submitAction()

      await borrowPage.expectLtv(expectedLTV)
      await borrowPage.expectHealthFactor(expectedHealthFactor)
    })

    test('uses permits in action plan for assets with permit support', async ({ page }) => {
      await borrowPage.fillDepositAssetAction(0, wstETHdeposit.asset, wstETHdeposit.amount)
      await borrowPage.fillBorrowAssetAction(borrow.amount)

      await borrowPage.submitAction()

      await actionsContainer.expectActions([
        {
          type: 'permit',
          ...wstETHdeposit,
        },
        {
          type: 'deposit',
          ...wstETHdeposit,
        },
        {
          type: 'borrow',
          asset: 'DAI',
          amount: borrow.amount,
        },
      ])
      await screenshot(page, 'deposit-wsteth-permit-actions-plan')
    })

    test('uses approve in action plan for assets with no permit support', async ({ page }) => {
      await borrowPage.fillDepositAssetAction(0, rETHdeposit.asset, rETHdeposit.amount)
      await borrowPage.fillBorrowAssetAction(borrow.amount)

      await borrowPage.submitAction()

      await actionsContainer.expectActions([
        {
          type: 'approve',
          ...rETHdeposit,
        },
        {
          type: 'deposit',
          ...rETHdeposit,
        },
        {
          type: 'borrow',
          asset: 'DAI',
          amount: borrow.amount,
        },
      ])
      await screenshot(page, 'deposit-reth-approve-actions-plan')
    })

    test('can switch to approves in action plan', async ({ page }) => {
      await borrowPage.fillDepositAssetAction(0, wstETHdeposit.asset, wstETHdeposit.amount)
      await borrowPage.fillBorrowAssetAction(borrow.amount)

      await borrowPage.submitAction()

      await actionsContainer.switchPreferPermitsAction()
      await actionsContainer.expectActions([
        {
          type: 'approve',
          ...wstETHdeposit,
        },
        {
          type: 'deposit',
          ...wstETHdeposit,
        },
        {
          type: 'borrow',
          asset: 'DAI',
          amount: borrow.amount,
        },
      ])
      await screenshot(page, 'deposit-wsteth-approve-actions-plan')
    })

    test('builds action plan for 2 assets', async ({ page }) => {
      await borrowPage.addNewDepositAssetAction()
      await borrowPage.fillDepositAssetAction(0, wstETHdeposit.asset, wstETHdeposit.amount)
      await borrowPage.fillDepositAssetAction(1, rETHdeposit.asset, rETHdeposit.amount)
      await borrowPage.fillBorrowAssetAction(borrow.amount)

      await borrowPage.submitAction()

      await actionsContainer.expectActions([
        {
          type: 'permit',
          ...wstETHdeposit,
        },
        {
          type: 'deposit',
          ...wstETHdeposit,
        },
        {
          type: 'approve',
          ...rETHdeposit,
        },
        {
          type: 'deposit',
          ...rETHdeposit,
        },
        {
          type: 'borrow',
          asset: 'DAI',
          amount: borrow.amount,
        },
      ])
      await screenshot(page, 'deposit-wsteth-reth-actions-plan')
    })

    test('successfully builds position', async ({ page }) => {
      await borrowPage.addNewDepositAssetAction()
      await borrowPage.fillDepositAssetAction(0, wstETHdeposit.asset, wstETHdeposit.amount)
      await borrowPage.fillDepositAssetAction(1, rETHdeposit.asset, rETHdeposit.amount)
      await borrowPage.fillBorrowAssetAction(borrow.amount)

      await borrowPage.submitAction()

      await actionsContainer.acceptAllActionsAction(5)

      await borrowPage.expectSuccessPage([wstETHdeposit, rETHdeposit], borrow, fork)
      await screenshot(page, 'deposit-wsteth-reth-success')
    })

    test('successfully builds position using only approves', async ({ page }) => {
      await borrowPage.addNewDepositAssetAction()
      await borrowPage.fillDepositAssetAction(0, wstETHdeposit.asset, wstETHdeposit.amount)
      await borrowPage.fillDepositAssetAction(1, rETHdeposit.asset, rETHdeposit.amount)
      await borrowPage.fillBorrowAssetAction(borrow.amount)

      await borrowPage.submitAction()

      await actionsContainer.switchPreferPermitsAction()
      await actionsContainer.acceptAllActionsAction(5)

      await borrowPage.expectSuccessPage([wstETHdeposit, rETHdeposit], borrow, fork)
      await screenshot(page, 'deposit-wsteth-reth-success')
    })

    test('HF matches after position is created', async ({ page }) => {
      await borrowPage.addNewDepositAssetAction()
      await borrowPage.fillDepositAssetAction(0, wstETHdeposit.asset, wstETHdeposit.amount)
      await borrowPage.fillDepositAssetAction(1, rETHdeposit.asset, rETHdeposit.amount)
      await borrowPage.fillBorrowAssetAction(borrow.amount)

      await borrowPage.submitAction()
      await actionsContainer.acceptAllActionsAction(5)

      await expectHFOnDashboard(page, borrowPage, expectedHealthFactor)
    })
  })

  test.describe('no new deposit, existing position, borrow DAI', () => {
    let borrowPage: BorrowPageObject
    let actionsContainer: ActionsPageObject

    const borrow = {
      asset: 'DAI',
      amount: 1000,
    }
    const expectedLTV = '8.04%'
    const expectedHealthFactor = '9.89'

    test.beforeEach(async ({ page }) => {
      await setup(page, fork, {
        initialPage: 'easyBorrow',
        account: {
          type: 'connected',
          assetBalances: {
            ETH: 10,
            rETH: 10,
          },
        },
      })

      borrowPage = new BorrowPageObject(page)
      actionsContainer = new ActionsPageObject(page)
      await borrowPage.depositAssetsActions({ rETH: 5 }, 1000)
      await page.reload()
    })

    test('calculates LTV correctly', async () => {
      await borrowPage.fillBorrowAssetAction(borrow.amount)

      await borrowPage.submitAction()

      await borrowPage.expectLtv(expectedLTV)
      await borrowPage.expectHealthFactor(expectedHealthFactor)
    })

    test('builds action plan', async ({ page }) => {
      await borrowPage.fillBorrowAssetAction(borrow.amount)

      await borrowPage.submitAction()

      await actionsContainer.expectActions([
        {
          type: 'borrow',
          asset: 'DAI',
          amount: borrow.amount,
        },
      ])
      await screenshot(page, 'borrow-with-no-deposit-actions-plan')
    })

    test('successfully borrows', async ({ page }) => {
      await borrowPage.fillBorrowAssetAction(borrow.amount)

      await borrowPage.submitAction()

      await actionsContainer.acceptAllActionsAction(1)

      await borrowPage.expectSuccessPage([], borrow, fork)
      await screenshot(page, 'borrow-with-no-deposit-success')
    })

    test('HF matches after position is created', async ({ page }) => {
      await borrowPage.fillBorrowAssetAction(borrow.amount)

      await borrowPage.submitAction()
      await actionsContainer.acceptAllActionsAction(1)

      await expectHFOnDashboard(page, borrowPage, expectedHealthFactor)
    })
  })

  test.describe('no wallet connected', () => {
    let borrowPage: BorrowPageObject
    const deposit = {
      asset: 'rETH',
      amount: 1,
    }
    const borrow = {
      asset: 'DAI',
      amount: 1000,
    }

    test.beforeEach(async ({ page }) => {
      await setup(page, fork, {
        initialPage: 'easyBorrow',
        account: {
          type: 'not-connected',
        },
      })

      borrowPage = new BorrowPageObject(page)
    })

    test('shows borrow rate correctly', async ({ page }) => {
      await borrowPage.fillDepositAssetAction(0, deposit.asset, deposit.amount)
      await borrowPage.fillBorrowAssetAction(borrow.amount)
      await borrowPage.expectLtv('40.19%')
      await screenshot(page, 'borrow-form-not-connected-correct-ltv')
    })

    test('form is interactive', async ({ page }) => {
      await borrowPage.fillDepositAssetAction(0, deposit.asset, deposit.amount)
      await borrowPage.fillBorrowAssetAction(borrow.amount)
      await screenshot(page, 'borrow-form-not-connected-interactive')
    })
  })

  test.describe('form validation', () => {
    let borrowPage: BorrowPageObject

    test.beforeEach(async ({ page }) => {
      await setup(page, fork, {
        initialPage: 'easyBorrow',
        account: {
          type: 'connected',
          assetBalances: {
            ETH: 10,
            rETH: 10,
            WBTC: 10_000,
          },
        },
      })

      borrowPage = new BorrowPageObject(page)
    })

    test('is invalid when depositing more than available', async ({ page }) => {
      const deposit = {
        asset: 'ETH',
        amount: 100,
      }
      await borrowPage.fillDepositAssetAction(0, deposit.asset, deposit.amount)
      await borrowPage.expectAssetInputInvalid('Exceeds your balance')
      await screenshot(page, 'borrow-form-deposit-more-than-available')
    })

    test('is invalid when borrowing more than collateral', async ({ page }) => {
      const deposit = {
        asset: 'ETH',
        amount: 1,
      }
      const borrow = {
        asset: 'DAI',
        amount: 10_000,
      }
      await borrowPage.fillDepositAssetAction(0, deposit.asset, deposit.amount)
      await borrowPage.fillBorrowAssetAction(borrow.amount)
      await borrowPage.expectAssetInputInvalid(borrowValidationIssueToMessage['insufficient-collateral'])
      await screenshot(page, 'borrow-form-borrow-more-than-available')
    })

    test('is invalid when borrowing more than available', async ({ page }) => {
      const deposit = {
        asset: 'ETH',
        amount: 1,
      }
      const borrow = {
        asset: 'DAI',
        amount: 100_000_000,
      }
      await borrowPage.fillDepositAssetAction(0, deposit.asset, deposit.amount)
      await borrowPage.fillBorrowAssetAction(borrow.amount)
      await borrowPage.expectAssetInputInvalid(borrowValidationIssueToMessage['exceeds-liquidity'])
      await screenshot(page, 'borrow-form-borrow-more-than-available')
    })

    test('is valid when not depositing anything but having existing position', async ({ page }) => {
      await borrowPage.depositAssetsActions({ rETH: 5 }, 1000)
      await page.reload()

      await borrowPage.fillBorrowAssetAction(1000)
      await borrowPage.expectBorrowButtonActive()
      await screenshot(page, 'borrow-form-has-position')
    })

    test('is invalid when breaching supply cap', async () => {
      await borrowPage.fillDepositAssetAction(0, 'WBTC', 10_000)
      await borrowPage.expectAssetInputInvalid('Deposit cap reached')
    })
  })
})

async function expectHFOnDashboard(
  page: Page,
  borrowPage: BorrowPageObject,
  expectedHealthFactor: string,
): Promise<void> {
  await borrowPage.viewInDashboardAction()
  const dashboardPage = new DashboardPageObject(page)

  await dashboardPage.expectHealthFactor(expectedHealthFactor)
}
