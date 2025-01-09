// src/components/ProductDetail.jsx
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

const ProductDetail = () => {
  const { id } = useParams();
  const { data: product, error } = useSWR(`https://fakestoreapi.com/products/${id}`, fetcher);

  if (!product) return <div>Loading...</div>;
  if (error) return <div>Error loading product</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <img src={product.image} alt={product.title} className="w-full h-96 object-cover" />
      <h1 className="text-2xl font-bold mt-4">{product.title}</h1>
      <p className="text-gray-700 mt-2">${product.price}</p>
      <p className="mt-4">{product.description}</p>
    </div>
  );
};

export default ProductDetail;