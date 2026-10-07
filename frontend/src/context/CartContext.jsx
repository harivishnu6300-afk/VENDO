import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    originalTotal: 0,
    discount: 0,
    shipping: 0,
    total: 0,
    itemCount: 0,
    amountForFreeShipping: 999
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setCartSummary({
        subtotal: 0,
        originalTotal: 0,
        discount: 0,
        shipping: 0,
        total: 0,
        itemCount: 0,
        amountForFreeShipping: 999
      });
      return;
    }

    try {
      setLoading(true);
      const res = await cartAPI.getCart();
      if (res.data.success) {
        setCartItems(res.data.items || []);
        setCartSummary(res.data.summary || {});
      }
    } catch (err) {
      console.error('Error fetching cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      addToast('Please login to add items to your cart.', 'warning');
      return false;
    }

    try {
      const res = await cartAPI.addToCart(productId, quantity);
      if (res.data.success) {
        addToast(res.data.message || 'Added to cart!', 'success');
        await fetchCart();
        return true;
      }
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await cartAPI.updateCartItem(itemId, quantity);
      if (res.data.success) {
        await fetchCart();
        return true;
      }
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await cartAPI.removeFromCart(itemId);
      if (res.data.success) {
        addToast('Item removed from cart.', 'info');
        await fetchCart();
        return true;
      }
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const res = await cartAPI.clearCart();
      if (res.data.success) {
        await fetchCart();
        return true;
      }
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartSummary,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
