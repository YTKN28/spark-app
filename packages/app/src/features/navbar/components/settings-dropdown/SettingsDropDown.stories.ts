import { Meta, StoryObj } from '@storybook/react'
import { userEvent, within } from '@storybook/testing-library'
import { getMobileStory, getTabletStory } from '@storybook/viewports'

import { SettingsDropdown } from './SettingsDropdown'

const meta: Meta = {
  title: 'Features/Navbar/Components/SettingsDropdown',
  component: SettingsDropdown,
  args: {
    onSandboxModeClick: () => {},
    isSandboxEnabled: true,
    onDevSandBoxModeClick: () => {},
    isDevSandboxEnabled: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Desktop: Story = {
  play: async ({ canvasElement }) => {
    const button = await within(canvasElement).findByRole('button')
    await userEvent.click(button)
  },
}
export const Mobile: Story = {
  ...getMobileStory(Desktop),
  play: undefined,
}
export const Tablet: Story = {
  ...getTabletStory(Desktop),
  play: undefined,
}
