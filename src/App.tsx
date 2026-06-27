import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PlayLocal from './pages/PlayLocal';
import PlayAI from './pages/PlayAI';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/local" element={<PlayLocal />} />
      <Route path="/ai" element={<PlayAI />} />
    </Routes>
  );
}