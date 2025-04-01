import './index.css'

import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app'

dayjs.extend(isSameOrBefore)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
