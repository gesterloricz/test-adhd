import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/footer'
import Home from './pages/home'
import Demo from './pages/demo'
import Features from './pages/features'

function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col font-sans bg-background text-foreground">
        <Header />
        
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/features" element={<Features />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  )
}

export default App