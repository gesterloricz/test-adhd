import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/footer'
import Home from './pages/home'
import Demo from './pages/demo'
import Features from './pages/features'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
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