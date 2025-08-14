import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/test-utils'
import { ErrorMessageForm } from '../ErrorMessageForm'

describe('ErrorMessageForm', () => {
  it('renders error message with correct text', () => {
    const errorText = 'This is an error message'
    render(<ErrorMessageForm text={errorText} />)
    
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(errorText)).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    const customClass = 'custom-error-class'
    render(<ErrorMessageForm text="Error" className={customClass} />)
    
    const errorElement = screen.getByRole('alert')
    expect(errorElement).toHaveClass(customClass)
    expect(errorElement).toHaveClass('text-sm', 'text-red-600', 'mt-2', 'ml-2')
  })

  it('renders without custom className', () => {
    render(<ErrorMessageForm text="Error" />)
    
    const errorElement = screen.getByRole('alert')
    expect(errorElement).toHaveClass('text-sm', 'text-red-600', 'mt-2', 'ml-2')
  })
})