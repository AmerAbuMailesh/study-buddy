import { useState, useEffect } from "react"
import { MotivationalQuote, type QuoteData } from "../quotes/MotivationalQuote"
import { useApi } from "../utils/api"

export function QuoteHistory() {
    const {makeRequest} = useApi()
    const [quoteHistory, setQuoteHistory] = useState<QuoteData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchQuoteHistory()
    }, [])

    const fetchQuoteHistory = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await makeRequest("/my-history")
            setQuoteHistory(response.quotes)
        } catch (error) {
            setError("Failed to fetch quote history")
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div className="loading">Loading quote history...</div>
    }

    if (error) {
        return <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchQuoteHistory}>Try Again</button>
        </div>
    }

    return <div className="history-panel">
        <h2>Quote History</h2>
        {quoteHistory.length === 0 ? <p>No quote history found.</p> : 
            <div className="history-list">
                {quoteHistory.map((quote) => {
                    return <MotivationalQuote 
                                quote={quote} 
                                key={quote.id || quote.text}
                            />
                })}
            </div>
        }
    </div>
}