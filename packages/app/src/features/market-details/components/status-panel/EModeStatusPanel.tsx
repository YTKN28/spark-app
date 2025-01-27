import { paths } from '@/config/paths'
import { formatPercentage } from '@/domain/common/format'
import { Percentage } from '@/domain/types/NumericValues'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { assets } from '@/ui/assets'
import { Link, LinkProps } from '@/ui/atoms/link/Link'
import { Panel } from '@/ui/atoms/panel/Panel'
import { links } from '@/ui/constants/links'
import { cn } from '@/ui/utils/style'

import { EModeBadge, EnabledEModeCategory } from './components/emode-badge/EModeBadge'
import { Header } from './components/Header'
import { InfoTile } from './components/info-tile/InfoTile'
import { InfoTilesGrid } from './components/info-tile/InfoTilesGrid'
import { StatusIcon } from './components/status-icon/StatusIcon'
import { StatusPanelGrid } from './components/StatusPanelGrid'
import { TokenBadge } from './components/token-badge/TokenBadge'

export interface EModeStatusPanelProps {
  maxLtv: Percentage
  liquidationThreshold: Percentage
  liquidationPenalty: Percentage
  category: EnabledEModeCategory
  eModeCategoryTokens: TokenSymbol[]
  token?: Token
}

export function EModeStatusPanel({
  maxLtv,
  liquidationThreshold,
  liquidationPenalty,
  category,
  eModeCategoryTokens,
  token,
}: EModeStatusPanelProps) {
  return (
    <Panel.Wrapper>
      <StatusPanelGrid>
        <StatusIcon status="yes" />
        <Header status="yes" variant="e-mode" />
        {token && <TokenBadge symbol={token.symbol} />}
        <InfoTilesGrid>
          <InfoTile>
            <InfoTile.Label>Max LTV</InfoTile.Label>
            <InfoTile.Value>
              <WithArrow>{formatPercentage(maxLtv)}</WithArrow>
            </InfoTile.Value>
          </InfoTile>
          <InfoTile>
            <InfoTile.Label>Liquidation threshold</InfoTile.Label>
            <InfoTile.Value>
              <WithArrow>{formatPercentage(liquidationThreshold)}</WithArrow>
            </InfoTile.Value>
          </InfoTile>
          <InfoTile>
            <InfoTile.Label>Liquidation penalty</InfoTile.Label>
            <InfoTile.Value>
              <WithArrow reverseArrow>{formatPercentage(liquidationPenalty)}</WithArrow>
            </InfoTile.Value>
          </InfoTile>
          <InfoTile>
            <InfoTile.Label>Category</InfoTile.Label>
            <InfoTile.Value>
              <EModeBadge category={category} />
            </InfoTile.Value>
          </InfoTile>
          <p className="col-span-1 text-xs text-slate-500 sm:col-span-3">
            E-Mode for {category} assets increases your LTV within the {category} category. This means that when E-Mode
            is enabled, you will have higher borrowing power for assets in this category:{' '}
            {eModeCategoryTokens.join(', ')}. You can enter E-Mode from your{' '}
            <DocsLink to={paths.dashboard}>Dashboard</DocsLink>. To learn more about E-Mode and its applied
            restrictions, visit the{' '}
            <DocsLink to={links.docs.eMode} external>
              FAQ
            </DocsLink>{' '}
            or the{' '}
            <DocsLink to={links.aaveTechnicalPaper} external>
              Aave V3 Technical Paper
            </DocsLink>
            .
          </p>
        </InfoTilesGrid>
      </StatusPanelGrid>
    </Panel.Wrapper>
  )
}

function DocsLink({ to, children, ...rest }: LinkProps) {
  return (
    <Link to={to} external className="text-slate-500 underline hover:text-slate-700" {...rest}>
      {children}
    </Link>
  )
}

interface WithArrowProps {
  children: React.ReactNode
  reverseArrow?: boolean
}
function WithArrow({ children, reverseArrow }: WithArrowProps) {
  return (
    <div className="flex min-w-[72px] flex-row justify-between gap-1 sm:min-w-fit">
      <img src={assets.greenArrowUp} className={cn('h-4 w-4', reverseArrow && 'rotate-180')} />
      {children}
    </div>
  )
}
