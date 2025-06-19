import { useState, useEffect } from "react"
import { MotivationalQuote } from "./MotivationalQuote"
import { useApi } from "../utils/api"

interface QuotaData {
    remaining: number
    next_reset_time?: string
}

interface QuoteData {
    text: string
    author?: string
}

export function MotivationalQuoteGenerator() {
    const [quote, setQuote] = useState<QuoteData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [quota, setQuota] = useState<QuotaData | null>(null)
    const { makeRequest } = useApi()

    useEffect(() => {
        fetchQuota()
    }, [])

    const fetchQuota = async () => {
        try {
            const data = await makeRequest("/quota")
            setQuota(data)
        } catch (error) {
            console.log(error)
        }
    }

    const generateQuote = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const data = await makeRequest("/generate-quote", {
            method: "POST",
            }
        )
        setQuote(data)
        fetchQuota()
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to generate quote.")
        } finally {
            setIsLoading(false)
        }
    }

    const getNextResetTime = () => {
        if (!quota?.next_reset_time) return null
        const resetDate = new Date(quota.next_reset_time)
        resetDate.setHours(resetDate.getHours() + 24)
        return resetDate
    }

    return <div className="quote-container">
        <h2>Motivational Quote Generator</h2>
        <div className="quota-display">
            <p>You have {quota?.remaining || 0} quotes remaining today.</p>
            {quota?.remaining === 0 && (
                <p>
                    You have reached your daily quote limit. Please try again tomorrow.
                </p>
            )}
            {quota?.next_reset_time && (
                <p>Next reset: {getNextResetTime()?.toLocaleString()}</p>
            )}
        </div>
        <button onClick={generateQuote} 
        disabled={isLoading || quota?.remaining === 0}
        className="generate-button"
        >
            {isLoading ? "Generating..." : "Generate Quote"}
        </button>
        {error && <div className="error-message">
            <p>{error}</p>
        </div>}
        {quote && <MotivationalQuote quote={quote} />}
    </div>
}