import { createRoot } from 'react-dom/client';
import './styles.css';
import { Asset }      from './asset';

const rootElement   = createRoot(document.getElementById('rootSandpack')!);
const assetInstance = new Asset();

assetInstance.setRootElement(rootElement);

assetInstance.updateUI();
