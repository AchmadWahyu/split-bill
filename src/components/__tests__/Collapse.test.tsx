import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../../test/test-utils'
import { Collapse } from '../Collapse'

describe('Collapse', () => {
  it('renders header content and chevron icon', () => {
    const headerContent = 'Click to expand'
    const collapsedContent = 'This is hidden content'
    
    render(
      <Collapse 
        headerContent={headerContent} 
        collapsedContent={collapsedContent} 
      />
    )
    
    expect(screen.getByText(headerContent)).toBeInTheDocument()
    // Initially, collapsed content should not be in the DOM
    expect(screen.queryByText(collapsedContent)).not.toBeInTheDocument()
  })

  it('shows collapsed content when clicked', () => {
    const headerContent = 'Click to expand'
    const collapsedContent = 'This is hidden content'
    
    render(
      <Collapse 
        headerContent={headerContent} 
        collapsedContent={collapsedContent} 
      />
    )
    
    const header = screen.getByText(headerContent)
    fireEvent.click(header)
    
    expect(screen.getByText(collapsedContent)).toBeVisible()
  })

  it('toggles collapsed content on multiple clicks', () => {
    const headerContent = 'Click to expand'
    const collapsedContent = 'This is hidden content'
    
    render(
      <Collapse 
        headerContent={headerContent} 
        collapsedContent={collapsedContent} 
      />
    )
    
    const header = screen.getByText(headerContent)
    
    // First click - show content
    fireEvent.click(header)
    expect(screen.getByText(collapsedContent)).toBeVisible()
    
    // Second click - hide content
    fireEvent.click(header)
    expect(screen.queryByText(collapsedContent)).not.toBeInTheDocument()
  })

  it('applies rotation class to chevron when expanded', () => {
    const headerContent = 'Click to expand'
    const collapsedContent = 'This is hidden content'
    
    render(
      <Collapse 
        headerContent={headerContent} 
        collapsedContent={collapsedContent} 
      />
    )
    
    const header = screen.getByText(headerContent)
    const chevron = header.parentElement?.querySelector('svg')
    
    expect(chevron).toHaveClass('ease-in-out', 'duration-300')
    expect(chevron).not.toHaveClass('rotate-90')
    
    fireEvent.click(header)
    
    expect(chevron).toHaveClass('rotate-90', 'ease-in-out', 'duration-300')
  })
})