document.getElementById('editProductForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const productData = Object.fromEntries(formData.entries());
    const productId = productData.product_id;

    try {
      const response = await fetch(`/product/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        alert('Product updated successfully!');
        location.reload(); // Reload the page to reflect the changes
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred while updating the product.');
    }
  });