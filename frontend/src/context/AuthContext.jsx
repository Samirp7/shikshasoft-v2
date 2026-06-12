import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to get full profile data from your database
  const fetchUserProfile = async (authUser) => {
    if (!authUser) return null;
    
    try {
      // Tries to find the user's custom fields in your profiles/users table
      const { data, error } = await supabase
        .from('profiles') // Change 'profiles' to 'users' if your table is named users
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;
      
      // Combine Supabase auth data with your custom database fields
      return { ...authUser, ...data };
    } catch (e) {
      console.log("Profile fetch fallback:", e.message);
      // Fallback so the app doesn't crash if database fields are blank
      return {
        ...authUser,
        name: authUser.email.split('@')[0],
        school_name: 'ShikshaSoft School'
      };
    }
  };

  useEffect(() => {
    // Check active sessions on page load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const fullUser = await fetchUserProfile(session.user);
        setUser(fullUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const fullUser = await fetchUserProfile(session.user);
        setUser(fullUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login Function
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Logout Function
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to get full profile data from your database
  const fetchUserProfile = async (authUser) => {
    if (!authUser) return null;
    
    try {
      // Tries to find the user's custom fields in your profiles/users table
      const { data, error } = await supabase
        .from('profiles') // Change 'profiles' to 'users' if your table is named users
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;
      
      // Combine Supabase auth data with your custom database fields
      return { ...authUser, ...data };
    } catch (e) {
      console.log("Profile fetch fallback:", e.message);
      // Fallback so the app doesn't crash if database fields are blank
      return {
        ...authUser,
        name: authUser.email.split('@')[0],
        school_name: 'ShikshaSoft School'
      };
    }
  };

  useEffect(() => {
    // Check active sessions on page load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const fullUser = await fetchUserProfile(session.user);
        setUser(fullUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const fullUser = await fetchUserProfile(session.user);
        setUser(fullUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login Function
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Logout Function
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
