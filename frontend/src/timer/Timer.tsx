import { useState, useEffect, useRef } from 'react'
import { useApi } from '../utils/api'
import { Link } from 'react-router-dom'

export function Timer() {
    const [timeLeft, setTimeLeft] = useState(() => {
        const saved = localStorage.getItem('timer-time-left')
        return saved ? parseInt(saved) : 25 * 60
    })
    const [isRunning, setIsRunning] = useState(() => {
        const saved = localStorage.getItem('timer-is-running')
        return saved === 'true'
    })
    const [selectedPreset, setSelectedPreset] = useState(() => {
        const saved = localStorage.getItem('timer-preset')
        return saved ? parseInt(saved) : 25
    })
    const [selectedSubject, setSelectedSubject] = useState(() => {
        const saved = localStorage.getItem('timer-subject')
        const customSubjects = localStorage.getItem('timer-custom-subjects')
        const parsedCustom = customSubjects ? JSON.parse(customSubjects) : []
        
        // If there's a saved subject and it exists in custom subjects, use it
        if (saved && parsedCustom.includes(saved)) {
            return saved
        }
        // If there are custom subjects, use the first one
        if (parsedCustom.length > 0) {
            return parsedCustom[0]
        }
        // Otherwise, no subject selected
        return ''
    })
    const [customSubjects, setCustomSubjects] = useState(() => {
        const saved = localStorage.getItem('timer-custom-subjects')
        return saved ? JSON.parse(saved) : []
    })
    const [startTime, setStartTime] = useState(() => {
        const saved = localStorage.getItem('timer-start-time')
        return saved ? parseInt(saved) : Date.now()
    })
    const [isSaving, setIsSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState('')
    const [timerCompleted, setTimerCompleted] = useState(false)
    const intervalRef = useRef<number | null>(null)
    const { makeRequest } = useApi()

    const presets = [
        { label: '1 min', value: 1 },
        { label: '5 min', value: 5 },
        { label: '15 min', value: 15 },
        { label: '25 min', value: 25 },
        { label: '30 min', value: 30 },
        { label: '45 min', value: 45 },
        { label: '60 min', value: 60 }
    ]

    // Save timer session to database
    const saveTimerSession = async (subject: string, duration: number) => {
        try {
            setIsSaving(true)
            console.log('Saving timer session:', { subject, duration })
            const response = await makeRequest('/timer-session', {
                method: 'POST',
                body: JSON.stringify({
                    subject: subject,
                    duration: duration
                })
            })
            setSaveMessage(response.message || 'Timer session saved!')
            setTimeout(() => setSaveMessage(''), 3000)
        } catch (error) {
            console.error('Failed to save timer session:', error)
            setSaveMessage('Failed to save session. Please try again.')
            setTimeout(() => setSaveMessage(''), 3000)
        } finally {
            setIsSaving(false)
        }
    }

    // Handle timer completion - separate effect for cleaner logic
    useEffect(() => {
        if (timerCompleted) {
            const completedDuration = selectedPreset * 60
            saveTimerSession(selectedSubject, completedDuration)
            setTimerCompleted(false) // Reset the flag
        }
    }, [timerCompleted, selectedPreset, selectedSubject])

    // Listen for changes to custom subjects from other tabs/components
    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('timer-custom-subjects')
            const newCustomSubjects = saved ? JSON.parse(saved) : []
            setCustomSubjects(newCustomSubjects)
            
            // Check if selected subject still exists
            const currentSelected = localStorage.getItem('timer-subject')
            if (currentSelected && !newCustomSubjects.includes(currentSelected)) {
                if (newCustomSubjects.length > 0) {
                    setSelectedSubject(newCustomSubjects[0])
                    localStorage.setItem('timer-subject', newCustomSubjects[0])
                } else {
                    setSelectedSubject('')
                    localStorage.removeItem('timer-subject')
                }
            }
        }

        window.addEventListener('storage', handleStorageChange)
        
        // Also check on component mount/focus
        const handleFocus = () => handleStorageChange()
        window.addEventListener('focus', handleFocus)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('focus', handleFocus)
        }
    }, [])

    // Save to localStorage whenever states change
    useEffect(() => {
        localStorage.setItem('timer-time-left', timeLeft.toString())
    }, [timeLeft])

    useEffect(() => {
        localStorage.setItem('timer-is-running', isRunning.toString())
    }, [isRunning])

    useEffect(() => {
        localStorage.setItem('timer-preset', selectedPreset.toString())
    }, [selectedPreset])

    useEffect(() => {
        localStorage.setItem('timer-subject', selectedSubject)
    }, [selectedSubject])

    useEffect(() => {
        localStorage.setItem('timer-start-time', startTime.toString())
    }, [startTime])

    // Timer logic - clean and focused
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsRunning(false)
                        setTimerCompleted(true) // Trigger completion handler
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isRunning, timeLeft])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleStart = () => {
        if (timeLeft > 0) {
            setIsRunning(true)
            setStartTime(Date.now())
            setSaveMessage('')
            setTimerCompleted(false)
        }
    }

    const handlePause = () => {
        setIsRunning(false)
    }

    const handleReset = () => {
        setIsRunning(false)
        setTimeLeft(selectedPreset * 60)
        setStartTime(Date.now())
        setSaveMessage('')
        setTimerCompleted(false)
    }

    const handlePresetChange = (minutes: number) => {
        setSelectedPreset(minutes)
        setTimeLeft(minutes * 60)
        setIsRunning(false)
        setSaveMessage('')
        setTimerCompleted(false)
    }

    const handleSubjectChange = (subject: string) => {
        setSelectedSubject(subject)
    }

    const getProgressPercentage = () => {
        const totalTime = selectedPreset * 60
        return ((totalTime - timeLeft) / totalTime) * 100
    }

    return (
        <div className="timer-container">
            <h2>Study Timer</h2>
            
            <div className="timer-settings">
                <div className="timer-presets">
                    <label htmlFor="timer-select">Timer Duration:</label>
                    <select 
                        id="timer-select"
                        value={selectedPreset}
                        onChange={(e) => handlePresetChange(Number(e.target.value))}
                        disabled={isRunning}
                        className="timer-select"
                    >
                        {presets.map(preset => (
                            <option key={preset.value} value={preset.value}>
                                {preset.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="subject-selector">
                    <label htmlFor="subject-select">Subject:</label>
                    
                    {customSubjects.length === 0 ? (
                        <div className="no-subjects-state">
                            <p className="no-subjects-message">
                                No subjects available. 
                                <Link to="/subjects" className="subjects-link"> Add subjects</Link> to get started!
                            </p>
                        </div>
                    ) : (
                        <select 
                            id="subject-select"
                            value={selectedSubject}
                            onChange={(e) => handleSubjectChange(e.target.value)}
                            disabled={isRunning}
                            className="subject-select"
                        >
                            {customSubjects.map((subject: string) => (
                                <option key={subject} value={subject}>
                                    {subject}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className="current-session">
                {selectedSubject ? (
                    <p>📚 Studying: <strong>{selectedSubject}</strong></p>
                ) : (
                    <p className="no-subject-selected">
                        📚 <Link to="/subjects" className="subjects-link">Add a subject</Link> to start studying
                    </p>
                )}
            </div>

            <div className="timer-display">
                <div className="timer-circle">
                    <svg className="timer-progress" viewBox="0 0 120 120">
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                        />
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="var(--primary-color)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 54}`}
                            strokeDashoffset={`${2 * Math.PI * 54 * (1 - getProgressPercentage() / 100)}`}
                            transform="rotate(-90 60 60)"
                            style={{ transition: 'stroke-dashoffset 1s ease' }}
                        />
                    </svg>
                    <div className="timer-time">
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            <div className="timer-controls">
                {!isRunning ? (
                    <button 
                        onClick={handleStart} 
                        className="control-button start-button"
                        disabled={timeLeft === 0 || !selectedSubject}
                    >
                        {timeLeft === 0 ? 'Finished!' : !selectedSubject ? 'Select Subject First' : 'Start'}
                    </button>
                ) : (
                    <button 
                        onClick={handlePause} 
                        className="control-button pause-button"
                    >
                        Pause
                    </button>
                )}
                <button 
                    onClick={handleReset} 
                    className="control-button reset-button"
                >
                    Reset
                </button>
            </div>

            {saveMessage && (
                <div className={`save-message ${saveMessage.includes('Failed') ? 'error' : 'success'}`}>
                    {isSaving ? 'Saving session...' : saveMessage}
                </div>
            )}

            {timeLeft === 0 && (
                <div className="timer-finished">
                    <p>🎉 Time's up! Great work studying{selectedSubject ? ` ${selectedSubject}` : ''}!</p>
                    {isSaving && <p>💾 Saving your study session...</p>}
                </div>
            )}
        </div>
    )
}