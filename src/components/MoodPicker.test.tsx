import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import MoodPicker from './MoodPicker'

afterEach(() => {
  cleanup()
})

describe('MoodPicker Component', () => {
  it('renders all 5 mood emoji buttons', () => {
    render(<MoodPicker examType="JEE" onSave={vi.fn()} />)
    const moodLabels = ['Very Low', 'Low', 'Okay', 'Good', 'Great']
    moodLabels.forEach(label => {
      expect(screen.getByLabelText(`Mood: ${label}`)).toBeTruthy()
    })
  })

  it('clicking a mood button updates the selected mood visually', async () => {
    render(<MoodPicker examType="JEE" onSave={vi.fn()} />)
    const goodMoodBtn = screen.getByLabelText('Mood: Good')
    expect(goodMoodBtn.className).not.toContain('selected')
    await userEvent.click(goodMoodBtn)
    expect(goodMoodBtn.className).toContain('selected')
  })

  it('submit button is disabled or not present when mood is not selected', () => {
    render(<MoodPicker examType="JEE" onSave={vi.fn()} />)
    const saveBtn = screen.queryByRole('button', { name: /Save mood log/i })
    expect(saveBtn).toBeNull()
  })

  it('calls onSave with correct mood and stress values on submit', async () => {
    const onSaveMock = vi.fn()
    render(<MoodPicker examType="JEE" onSave={onSaveMock} />)

    // Click a mood button
    const goodMoodBtn = screen.getByLabelText('Mood: Good')
    await userEvent.click(goodMoodBtn)

    // Submit button should now be rendered
    const saveBtn = screen.getByRole('button', { name: /Save mood log/i })
    await userEvent.click(saveBtn)

    // Default stress level is 5
    expect(onSaveMock).toHaveBeenCalledWith(4, 5, '')
  })
})
