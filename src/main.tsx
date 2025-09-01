import ReactDOM          from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import DigoTemplate from 'app/digo-template';

import 'styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <DigoTemplate />
  </BrowserRouter>,
);
