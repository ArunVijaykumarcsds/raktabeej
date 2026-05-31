import { Header } from './components'
import { HomePage } from './pages/HomePage'

export function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HomePage />
      </main>
    </div>
  )
}
