import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function PlainLayout() {
  return (
    <div className="min-h-screen text-[#1A202C]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
