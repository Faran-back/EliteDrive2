import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupConsoleErrorHandler } from './utils/logging.ts';

// Setup crash-resistant error console logging
setupConsoleErrorHandler();

createRoot(document.getElementById('root')!).render(<App />);

