import { useState, useEffect } from "react" 


export interface QuoteData {
    text: string
    author?: string
    id?: string
}

interface MotivationalQuoteProps {
    quote: QuoteData
}

export function MotivationalQuote({ quote }: MotivationalQuoteProps) {
    return <div className="quote-display">
        <blockquote>
            <p>"{quote.text}"</p>
            {quote.author && <cite>— {quote.author}</cite>}
        </blockquote>
    </div>
}