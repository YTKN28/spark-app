import { Trans } from '@lingui/macro'

import { paths } from '@/config/paths'
import { DSRBadge } from '@/features/savings/components/navbar-item/DSRBadge'
import { cn } from '@/ui/utils/style'

import { MakerInfoQueryResults } from '../types'
import { NavLink } from './nav-link/NavLink'

export interface PageLinksProps {
  mobileMenuCollapsed: boolean
  closeMobileMenu: () => void
  makerInfo: MakerInfoQueryResults
  blockedPages: (keyof typeof paths)[]
}

export function PageLinks({ mobileMenuCollapsed, closeMobileMenu, makerInfo, blockedPages }: PageLinksProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 py-6',
        'lg:flex lg:flex-row lg:justify-evenly lg:gap-0 lg:py-0 lg:pt-0',
        'xl:ml-20 xl:justify-normal xl:gap-12',
        mobileMenuCollapsed && 'hidden lg:flex',
      )}
    >
      <NavLink to={paths.easyBorrow} onClick={closeMobileMenu}>
        <Trans>Borrow</Trans>
      </NavLink>
      <NavLink to={paths.dashboard} onClick={closeMobileMenu}>
        <Trans>Dashboard</Trans>
      </NavLink>
      {!blockedPages.some((page) => page === 'savings') && ( // some instead of includes for better type inference
        <NavLink
          to={paths.savings}
          onClick={closeMobileMenu}
          postfix={
            makerInfo.isChainSupported ? (
              <DSRBadge dsr={makerInfo.data?.DSR} isLoading={makerInfo.isLoading} />
            ) : undefined
          }
        >
          <Trans>Cash & Savings</Trans>
        </NavLink>
      )}
      <NavLink to={paths.markets} onClick={closeMobileMenu}>
        <Trans>Markets</Trans>
      </NavLink>
    </div>
  )
}
