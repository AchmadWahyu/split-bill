import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test/test-utils'
import { BottomNav } from '../BottomNav'

describe('BottomNav', () => {
  const defaultProps = {
    primaryButtonText: 'Save',
    secondaryButtonText: 'Cancel',
    onClickPrimaryButton: vi.fn(),
    onClickSecondaryButton: vi.fn(),
  }

  it('renders both buttons with correct text', () => {
    render(<BottomNav {...defaultProps} />)
    
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('calls onClickPrimaryButton when primary button is clicked', () => {
    const mockPrimaryClick = vi.fn()
    render(<BottomNav {...defaultProps} onClickPrimaryButton={mockPrimaryClick} />)
    
    const primaryButton = screen.getByText('Save')
    fireEvent.click(primaryButton)
    
    expect(mockPrimaryClick).toHaveBeenCalledTimes(1)
  })

  it('calls onClickSecondaryButton when secondary button is clicked', () => {
    const mockSecondaryClick = vi.fn()
    render(<BottomNav {...defaultProps} onClickSecondaryButton={mockSecondaryClick} />)
    
    const secondaryButton = screen.getByText('Cancel')
    fireEvent.click(secondaryButton)
    
    expect(mockSecondaryClick).toHaveBeenCalledTimes(1)
  })

  it('applies fixed positioning when fixedPosition is true', () => {
    render(<BottomNav {...defaultProps} fixedPosition={true} />)
    
    const container = screen.getByText('Save').closest('div')
    expect(container).toHaveClass('fixed', 'bottom-4', '-mx-8', 'px-8', 'py-4')
  })

  it('does not apply fixed positioning when fixedPosition is false', () => {
    render(<BottomNav {...defaultProps} fixedPosition={false} />)
    
    const container = screen.getByText('Save').closest('div')
    expect(container).not.toHaveClass('fixed', 'bottom-4', '-mx-8', 'px-8', 'py-4')
  })

  it('applies custom container className', () => {
    const customClass = 'custom-container-class'
    render(<BottomNav {...defaultProps} containerClassName={customClass} />)
    
    const container = screen.getByText('Save').closest('div')
    expect(container).toHaveClass(customClass)
  })

  it('renders with default props when optional props are not provided', () => {
    render(
      <BottomNav 
        primaryButtonText="Save"
        secondaryButtonText="Cancel"
      />
    )
    
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })
})