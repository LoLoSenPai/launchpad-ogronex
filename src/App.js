import Home from './Pages/Home';
import { SaleStatusProvider } from './Context/SaleStatusContext';
import { WaitingBuyProvider } from './Context/WaitingBuyContext';

function App() {
  return (
    <>
      <WaitingBuyProvider>
        <SaleStatusProvider>
          <Home />
        </SaleStatusProvider>
      </WaitingBuyProvider>
    </>
  );
}

export default App;
