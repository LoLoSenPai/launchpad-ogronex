import Home from './Pages/Home';
import { SaleStatusProvider } from './Context/SaleStatusContext';

function App() {
  return (
    <>
      <SaleStatusProvider>
        <Home />
      </SaleStatusProvider>
    </>
  );
}

export default App;
