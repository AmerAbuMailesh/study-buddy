import { useState, useEffect } from 'react'

export function MySubjects() {
    const [customSubjects, setCustomSubjects] = useState(() => {
        const saved = localStorage.getItem('timer-custom-subjects')
        return saved ? JSON.parse(saved) : []
    })
    const [newSubject, setNewSubject] = useState('')

    // Save to localStorage whenever customSubjects changes
    useEffect(() => {
        localStorage.setItem('timer-custom-subjects', JSON.stringify(customSubjects))
    }, [customSubjects])

    const handleAddSubject = () => {
        const trimmedSubject = newSubject.trim()
        if (trimmedSubject && !customSubjects.includes(trimmedSubject)) {
            const updatedCustomSubjects = [...customSubjects, trimmedSubject]
            setCustomSubjects(updatedCustomSubjects)
            setNewSubject('')
        }
    }

    const handleRemoveSubject = (subjectToRemove: string) => {
        const updatedCustomSubjects = customSubjects.filter((subject: string) => subject !== subjectToRemove)
        setCustomSubjects(updatedCustomSubjects)
        
        // If the removed subject was the selected one in timer, clear it
        const currentSelected = localStorage.getItem('timer-subject')
        if (currentSelected === subjectToRemove) {
            if (updatedCustomSubjects.length > 0) {
                localStorage.setItem('timer-subject', updatedCustomSubjects[0])
            } else {
                localStorage.removeItem('timer-subject')
            }
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddSubject()
        }
    }

    return (
        <div className="subjects-container">
            <h2>My Subjects</h2>
            <p className="subjects-description">
                Manage your study subjects here. These will be available for selection in the timer.
            </p>

            <div className="add-subject-section">
                <h3>Add New Subject</h3>
                <div className="add-subject-form">
                    <input
                        type="text"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="e.g., Mathematics, History, Programming..."
                        className="subject-input"
                        autoFocus
                    />
                    <button
                        onClick={handleAddSubject}
                        disabled={!newSubject.trim()}
                        className="add-subject-button"
                    >
                        Add Subject
                    </button>
                </div>
            </div>

            <div className="subjects-list-section">
                <h3>Your Subjects ({customSubjects.length})</h3>
                {customSubjects.length === 0 ? (
                    <div className="empty-subjects">
                        <p>No subjects added yet.</p>
                        <p>Add your first subject above to get started!</p>
                    </div>
                ) : (
                    <div className="subjects-grid">
                        {customSubjects.map((subject: string) => (
                            <div key={subject} className="subject-card">
                                <span className="subject-name">{subject}</span>
                                <button
                                    onClick={() => handleRemoveSubject(subject)}
                                    className="remove-subject-button"
                                    title="Remove subject"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
} 