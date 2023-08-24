import Home from './Pages/Home';
import { SaleStatusProvider } from './Context/SaleStatusContext';
import { WaitingBuyProvider } from './Context/WaitingBuyContext';
import { AnimationProvider } from './Context/AnimationContext';

function App() {
  return (
    <>
      <WaitingBuyProvider>
        <AnimationProvider>
          <SaleStatusProvider>
            <Home />
          </SaleStatusProvider>
        </AnimationProvider>
      </WaitingBuyProvider>
    </>
  );
}

export default App;
