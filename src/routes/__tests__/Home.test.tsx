import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Home from '../Home'
import { EventType } from '../EventForm/types'

// Mock react-router
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  }
})

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123',
  },
})

describe('Home', () => {
  const mockEventList: EventType[] = [
    {
      id: '1',
      title: 'Dinner Party',
      personList: [{ name: 'John' }, { name: 'Jane' }],
      expense: {
        items: [
          {
            title: 'Pizza',
            price: '50000',
            payer: { name: 'John' },
            receiver: ['John', 'Jane'],
          },
        ],
        tax: { value: '0', type: 'AMOUNT' },
        discount: { value: '0', type: 'AMOUNT' },
        serviceCharge: { value: '0', type: 'AMOUNT' },
      },
    },
  ]

  const mockHandleDeleteEventById = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders title and subtitle', () => {
    render(
      <Home 
        eventList={mockEventList} 
        handleDeleteEventById={mockHandleDeleteEventById} 
      />
    )
    
    expect(screen.getByText('Split Bareng')).toBeInTheDocument()
    expect(screen.getByText('Split bill simpel, cepet, bareng-bareng!')).toBeInTheDocument()
  })

  it('renders event cards when events exist', () => {
    render(
      <Home 
        eventList={mockEventList} 
        handleDeleteEventById={mockHandleDeleteEventById} 
      />
    )
    
    expect(screen.getByText('Dinner Party')).toBeInTheDocument()
    expect(screen.getByText('2 orang')).toBeInTheDocument()
    expect(screen.getByText('Rp 50.000')).toBeInTheDocument()
  })

  it('renders empty state when no events exist', () => {
    render(
      <Home 
        eventList={[]} 
        handleDeleteEventById={mockHandleDeleteEventById} 
      />
    )
    
    expect(screen.getByText('Belum ada acara nih')).toBeInTheDocument()
    expect(screen.getByText('Yuk, bikin acara patungan baru!')).toBeInTheDocument()
    expect(screen.queryByText('Split bill simpel, cepet, bareng-bareng!')).not.toBeInTheDocument()
  })

  it('renders add new event button', () => {
    render(
      <Home 
        eventList={mockEventList} 
        handleDeleteEventById={mockHandleDeleteEventById} 
      />
    )
    
    const addButton = screen.getByRole('link', { name: /new event/i })
    expect(addButton).toBeInTheDocument()
    expect(addButton).toHaveAttribute('href', '/acara/test-uuid-123/edit/general')
  })

  it('shows delete confirmation dialog when delete button is clicked', () => {
    render(
      <Home 
        eventList={mockEventList} 
        handleDeleteEventById={mockHandleDeleteEventById} 
      />
    )
    
    const deleteButton = screen.getByRole('button', { name: /hapus/i })
    fireEvent.click(deleteButton)
    
    expect(screen.getByText('Hapus transaksi ini?')).toBeInTheDocument()
    expect(screen.getByText('Batal')).toBeInTheDocument()
    expect(screen.getByText('Ya, hapus')).toBeInTheDocument()
  })

  it('calls handleDeleteEventById when delete is confirmed', () => {
    render(
      <Home 
        eventList={mockEventList} 
        handleDeleteEventById={mockHandleDeleteEventById} 
      />
    )
    
    const deleteButton = screen.getByRole('button', { name: /hapus/i })
    fireEvent.click(deleteButton)
    
    const confirmDeleteButton = screen.getByText('Ya, hapus')
    fireEvent.click(confirmDeleteButton)
    
    expect(mockHandleDeleteEventById).toHaveBeenCalledWith('1')
  })

  it('closes delete dialog when cancel is clicked', () => {
    render(
      <Home 
        eventList={mockEventList} 
        handleDeleteEventById={mockHandleDeleteEventById} 
      />
    )
    
    const deleteButton = screen.getByRole('button', { name: /hapus/i })
    fireEvent.click(deleteButton)
    
    expect(screen.getByText('Hapus transaksi ini?')).toBeInTheDocument()
    
    const cancelButton = screen.getByText('Batal')
    fireEvent.click(cancelButton)
    
    expect(screen.queryByText('Hapus transaksi ini?')).not.toBeInTheDocument()
  })
})