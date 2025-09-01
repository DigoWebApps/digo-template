import { createRoot } from 'react-dom/client';

import { Asset } from './asset';

import './styles.css';

const rootElement   = createRoot(document.getElementById('rootSandpack')!);
const assetInstance = new Asset();

assetInstance.setRootElement(rootElement);

assetInstance.updateUI();
