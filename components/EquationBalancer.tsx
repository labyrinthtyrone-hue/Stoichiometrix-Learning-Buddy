import React, { useState } from 'react';

interface EquationBalancerProps {
  onBalance: (reactants: string, products: string) => void;
  onClose: () => void;
}

const EquationBalancer: React.FC<EquationBalancerProps> = ({ onBalance, onClose }) => {
  const [reactants, setReactants] = useState('');
  const [products, setProducts] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reactants.trim() || !products.trim()) {
      setError('Please enter both reactants and products.');
      return;
    }
    setError('');
    onBalance(reactants, products);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4 border-2 border-black">
        <h2 className="text-xl font-bold mb-4 text-slate-800">Balance Chemical Equation</h2>
        <p className="text-sm text-slate-500 mb-6">
          Enter reactants and products. Use '+' to separate multiple substances.
          Example: <code className="bg-slate-200 p-1 rounded">H2 + O2</code>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reactants" className="block text-slate-700 text-sm font-bold mb-2">
              Reactants
            </label>
            <input
              id="reactants"
              type="text"
              value={reactants}
              onChange={(e) => setReactants(e.target.value)}
              className="shadow-inner appearance-none border-2 border-black rounded w-full py-2 px-3 bg-white text-black leading-tight focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="e.g., Na + H2O"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="products" className="block text-slate-700 text-sm font-bold mb-2">
              Products
            </label>
            <input
              id="products"
              type="text"
              value={products}
              onChange={(e) => setProducts(e.target.value)}
              className="shadow-inner appearance-none border-2 border-black rounded w-full py-2 px-3 bg-white text-black leading-tight focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="e.g., NaOH + H2"
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-violet-500 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300"
            >
              Balance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquationBalancer;