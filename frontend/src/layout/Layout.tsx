import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"
import { Outlet, Link, Navigate } from "react-router-dom"
export function Layout() {
    return <div className="app-layout">
        <header className="app-header">
            <div className="header-content">
                <h1>Study Buddy</h1>
                <nav>
                    <SignedIn>
                        <Link to="/">Timer</Link>
                        <Link to="/subjects">My Subjects</Link>
                        <Link to="/statistics">Statistics</Link>
                        <Link to="/quotes">Quotes</Link>
                        <Link to="/history">History</Link>
                        <UserButton />
                    </SignedIn>
                </nav>
            </div>
        </header>

        <main className="app-main">
            <SignedOut>
                <Navigate to="/sign-in" replace/>
            </SignedOut>
            <SignedIn>
                <Outlet />
            </SignedIn>
        </main>
    </div>
}