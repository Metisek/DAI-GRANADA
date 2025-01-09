// src/components/ProductList.jsx
import { useProducts } from '../hooks/useProducts';
import { Link } from 'react-router-dom';

const ProductList = () => {
  const { products, isLoading, isError } = useProducts();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading products</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <div key={product.id} className="card">
          <img src={product.image} alt={product.title} className="w-full h-48 object-cover rounded-t-lg" />
          <div className="p-4">
            <h2 className="text-lg font-bold">{product.title}</h2>
            <p className="text-gray-700">${product.price}</p>
            <Link to={`/product/${product.id}`}>
              <button className="btn btn-primary mt-2">Buy Now</button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;