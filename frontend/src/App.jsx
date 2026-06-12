import { Suspense } from 'react';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner fullPage message="Loading page..." />}>
          <AppRoutes />
        </Suspense>
      </main>
    </div>
  );
}

export default App;
