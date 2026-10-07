import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { fetchCart } = useCart();
  const { addToast } = useToast();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }

    try {
      setLoading(true);
      const res = await wishlistAPI.getWishlist();
      if (res.data.success) {
        setWishlistItems(res.data.items || []);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      addToast('Please login to manage your wishlist.', 'warning');
      return false;
    }

    try {
      const res = await wishlistAPI.toggleWishlist(productId);
      if (res.data.success) {
        addToast(res.data.message, res.data.isWishlisted ? 'success' : 'info');
        await fetchWishlist();
        return res.data.isWishlisted;
      }
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await wishlistAPI.removeFromWishlist(productId);
      if (res.data.success) {
        addToast('Removed from wishlist.', 'info');
        await fetchWishlist();
        return true;
      }
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  };

  const moveToCart = async (productId) => {
    try {
      const res = await wishlistAPI.moveToCart(productId);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        await Promise.all([fetchWishlist(), fetchCart()]);
        return true;
      }
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  };

  const isWishlisted = (productId) => {
    return wishlistItems.some((item) => item.product_id === parseInt(productId));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        loading,
        toggleWishlist,
        removeFromWishlist,
        moveToCart,
        isWishlisted,
        fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
