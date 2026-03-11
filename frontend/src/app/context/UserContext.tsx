"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_BACKEND, UserWithHouse } from '../utils';
import { getCookie} from "../utils";

// Define the shape of our context data
interface UserContextType {
    user: UserWithHouse | null;
    isLoading: boolean;
    logout: () => void;
    fetchUser: () => Promise<void>;
}

// Create the context with a default value of undefined
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create the Provider component
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserWithHouse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchUser = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_BACKEND}/api/user/`, { credentials: 'include' });
            if (response.status === 401) { // Unauthorized
                console.log("YOU GOT ADMINIFIED")
                setUser(null);
                return;
            }
            if (!response.ok) {
                throw new Error("Failed to fetch user");
            }
            const data = await response.json();

                setUser(currentUser => {
                // Your smart logic: Check if a logged-in user was removed from a house
                console.log("this is your house mate ",currentUser?.house)
                console.log("who is ts diva ? : ",currentUser)
                console.log("well the data says that " , data.house) 
                if (currentUser && currentUser.house && !data.house) {
                    router.push('/user-house-deleted');
                }
                // In all cases, set the user to the new data from the API
                return data;
            });
        } catch (error) {
            console.error("Fetch user error:", error);
            setUser(null); // Set user to null on any fetch error
        } finally {
            setIsLoading(false);
        }
    }, [router]); // Include user in dependencies to compare old vs new state

    // Fetch user on initial load
    useEffect(() => {
        fetchUser();
    },[fetchUser] ); // Run only once on mount

    // Add the "re-fetch on focus" event listener
    useEffect(() => {
        window.addEventListener('focus', fetchUser);
        const intervalId = setInterval(fetchUser, 60000);
        return () => {
            window.removeEventListener('focus', fetchUser);
            clearInterval(intervalId);
        };
    }, [fetchUser]);

    const logout = async () => {
        try {
            // Tell the backend to destroy the user's session
            await fetch(`${API_BASE_BACKEND}/api/logout/`, {
                method: 'POST',
                credentials: 'include', // Important to send the session cookie
                headers: {
                    // Django's security requires a CSRF token for POST requests
                    'X-CSRFToken': getCookie('csrftoken') || '',
                },
            });
        } catch (error) {
            console.error("Error during backend logout:", error);
        } finally {
            // This ensures the frontend logs out even if the backend call fails
            setUser(null);
            // Redirect to the login page to complete the logout flow
            router.push('/');
        }
    };

    const value = { user, isLoading, logout ,fetchUser};

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

// Create a custom hook to easily access the context
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};