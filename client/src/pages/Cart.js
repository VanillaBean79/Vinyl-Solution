import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';

function Cart() {
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);

  const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Your Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map(item => (
            <div key={item.id} style={styles.item}>
              <img src={item.image_url} alt={item.record?.title} style={styles.image} />
              <div style={{ flex: 1 }}>
                <h3>{item.record?.title} by {item.record?.artist}</h3>
                <p>Price: ${item.price}</p>
                <button onClick={() => removeFromCart(item.id)} style={styles.remove}>Remove</button>
              </div>
            </div>
          ))}
          <hr />
          <h3>Total: ${total}</h3>
          <button onClick={clearCart} style={styles.clear}>Clear Cart</button>
          <button style={styles.checkout}>Proceed to Checkout</button>
        </>
      )}
    </div>
  );
}

const styles = {
  item: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    alignItems: 'center',
  },
  image: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
  },
  remove: {
    backgroundColor: '#b00',
    color: '#fff',
    border: 'none',
    padding: '0.5rem',
    cursor: 'pointer',
  },
  clear: {
    backgroundColor: '#666',
    color: '#fff',
    border: 'none',
    padding: '0.7rem 1.2rem',
    marginTop: '1rem',
    cursor: 'pointer',
    marginRight: '1rem',
  },
  checkout: {
    backgroundColor: '#008080',
    color: '#fff',
    border: 'none',
    padding: '0.7rem 1.2rem',
    marginTop: '1rem',
    cursor: 'pointer',
  }
};

export default Cart;
