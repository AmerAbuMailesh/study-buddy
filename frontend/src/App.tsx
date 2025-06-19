import './App.css'
import ClerkProviderWithRoutes from './auth/ClerkProviderWithRoutes'
import { Routes, Route } from 'react-router-dom'
import { AuthenticationPage } from './auth/AuthenticationPage'
import { Layout } from './layout/Layout'
import { Statistics } from './statistics/Statistics'
import { Timer } from './timer/Timer'
import { MotivationalQuoteGenerator } from './quotes/MotivationalQuoteGenerator'
import { QuoteHistory } from './quote-history/QuoteHistory'


function App() {
  return (
    <ClerkProviderWithRoutes>
      <Routes>
        <Route path="/sign-in/*" element={<AuthenticationPage />}/>
        <Route path="/sign-up" element={<AuthenticationPage />}/>
        <Route element={<Layout />}>
          <Route path="/" element={<Timer />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/quotes" element={<MotivationalQuoteGenerator />} />
          <Route path="/history" element={<QuoteHistory />} />
        </Route>
      </Routes>
    </ClerkProviderWithRoutes>
  )
}

export default App
