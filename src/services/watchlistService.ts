import { Stock, Watchlist } from '../types/finance';
import api from './api';

// Get all watchlists
export const getWatchlists = async (): Promise<Watchlist[]> => {
    try {
        const response = await api.getWatchlists();
        return response;
    } catch (error) {
        console.error('Error fetching watchlists:', error);
        return [];
    }
};

// Update a watchlist name
export const updateWatchlistName = async (id: string, newName: string): Promise<Watchlist[]> => {
    try {
        await fetch(`http://localhost:8070/api/watchlists/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name: newName })
        });
        return await getWatchlists();
    } catch (error) {
        console.error('Error updating watchlist:', error);
        return [];
    }
};

// Add a stock to a watchlist
export const addStockToWatchlist = async (watchlistId: string, stockId: string): Promise<Watchlist[]> => {
    try {
        await api.addStockToWatchlist(parseInt(watchlistId), stockId);
        return await getWatchlists();
    } catch (error) {
        console.error('Error adding stock to watchlist:', error);
        return [];
    }
};

// Remove a stock from a watchlist
export const removeStockFromWatchlist = async (watchlistId: string, stockId: string): Promise<Watchlist[]> => {
    try {
        await fetch(`http://localhost:8070/api/watchlists/${watchlistId}/stocks/${stockId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return await getWatchlists();
    } catch (error) {
        console.error('Error removing stock from watchlist:', error);
        return [];
    }
};

// Get stocks for a specific watchlist
export const getWatchlistStocks = async (watchlistId: string): Promise<Stock[]> => {
    try {
        const response = await api.getWatchlistStocks(parseInt(watchlistId));
        return response;
    } catch (error) {
        console.error('Error fetching watchlist stocks:', error);
        return [];
    }
};

// Create a new watchlist
export const createWatchlist = async (name: string): Promise<Watchlist[]> => {
    try {
        await api.createWatchlist(name);
        return await getWatchlists();
    } catch (error) {
        console.error('Error creating watchlist:', error);
        return [];
    }
};

// Delete a watchlist
export const deleteWatchlist = async (watchlistId: string): Promise<Watchlist[]> => {
    try {
        await fetch(`http://localhost:8070/api/watchlists/${watchlistId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return await getWatchlists();
    } catch (error) {
        console.error('Error deleting watchlist:', error);
        return [];
    }
};

// Reset watchlists to default
export const resetWatchlists = async (): Promise<Watchlist[]> => {
    try {
        await fetch('http://localhost:8070/api/watchlists/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return await getWatchlists();
    } catch (error) {
        console.error('Error resetting watchlists:', error);
        return [];
    }
};
