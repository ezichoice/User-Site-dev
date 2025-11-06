"use client";

import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UserDetails {
  name: string;
  email: string;
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  social_links: Record<string, string> | null;
  avatar_url?: string; // Add this property
}

interface AuthContextType {
  isLoggedIn: boolean;
  userDetails: UserDetails | null;
  userImg: string;
  loading: boolean;

  checkUserSession: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  setUserImg: React.Dispatch<React.SetStateAction<string>>;

  isProfileCompleted: boolean;
  provider: string;
  socialUserImg: string;
  setIsUserUpdated: React.Dispatch<React.SetStateAction<boolean>>;
  type?: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [userImg, setUserImg] = useState<string>("");
  const [socialUserImg, setSocialUserImg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isProfileCompleted, setIsProfileCompleted] = useState<boolean>(false);
  const [isUserUpdated, setIsUserUpdated] = useState<boolean>(false);
  const [provider, setProvider] = useState<string>("");
  const [type, setType] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setIsLoggedIn(true);
        const details = transformUserToUserDetails(session.user);
        setUserDetails(details);
        setProvider(session.user.app_metadata.provider || "");
        if (session.user.app_metadata.provider !== "email") {
          const avatarUrl = session.user.user_metadata.avatar_url;
          setSocialUserImg(avatarUrl && avatarUrl !== "" ? avatarUrl : "/profile.png");
        }
      } else {
        setIsLoggedIn(false);
        setUserDetails(null);
        setUserImg("");
      }
      setLoading(false);
    });

    checkUserSession();

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    
    const getUser = async () => {
      const {
          data: { user },
        } = await supabase.auth.getUser();
      return user;
    }

    const getAvatarUrl = async (userId: string) => {
      
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url, user_type")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching avatar_url: ", error);
        return {
          avatarUrl: null,
          userType: null,
        };
      }

      return {
        avatarUrl: data?.avatar_url,
        userType: data.user_type,
      }
    }

    const fetchAndSetAvatarUrl = async () => {
      const user = await getUser();
      
      if (!user?.id) return;

      const { avatarUrl, userType } = await getAvatarUrl(user?.id!);
      
      if (userType)
        setIsProfileCompleted(true);

      setType(userType);

      if (user?.app_metadata.provider !== "email") {
        if (avatarUrl) 
          setUserImg(avatarUrl);
        else
          setUserImg(socialUserImg);
        return
      }

      if (isLoggedIn) {
        setUserImg(avatarUrl && avatarUrl !== "" ? avatarUrl : "/profile.png");
      }
    }

    fetchAndSetAvatarUrl();

  }, [isLoggedIn, userImg, isProfileCompleted, isUserUpdated, socialUserImg]);

  const fetchUserProfile = async (userId: string): Promise<any | null> => {
    const { data, error } = await supabase
      .from("profiles") // Correct type argument
      .select(
        "id, full_name, email, username, avatar_url, bio, social_links,userDetails(is_blocked)"
      )
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error(
        "Error fetching profile:",
        error?.message || "No data returned"
      );
      return null;
    }

    // TypeScript infers 'data' as 'ProfileData' here
    return {
      ...data,
      social_links: data.social_links || {},
    };
  };

  const checkUserSession = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setIsLoggedIn(true);
      const transformedDetails = transformUserToUserDetails(user);
      setUserDetails(transformedDetails);

      const profileData = await fetchUserProfile(user.id);
      if (profileData) {
        setUserDetails({
          name: profileData.full_name || "Unknown Name",
          email: profileData.email,
          id: profileData.id,
          full_name: profileData.full_name,
          username: profileData.username,
          bio: profileData.bio || null, // Ensure bio is included
          social_links: profileData.social_links || {}, // Ensure social_links is included
        });
      }
    } else {
      setIsLoggedIn(false);
      setUserDetails(null);
      setUserImg("");
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error.message);
        return;
      }
      await checkUserSession();
      
      router.push("/auth/login");
    } catch (error) {
      console.error("An unexpected error occurred during sign-out:", error);
    } finally {
      setLoading(false);
    }
  };

  const transformUserToUserDetails = (user: User): UserDetails => {
    return {
      name: user.user_metadata.full_name || "Unknown Name",
      email: user.email || "Unknown Email",
      id: user.id,
      full_name: user.user_metadata.full_name || null,
      username: user.user_metadata.username || null,
      bio: user.user_metadata.bio || null, // Include bio if applicable
      social_links: user.user_metadata.social_links || {}, // Default to an empty object if undefined
    };
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userDetails,
        userImg,
        setUserImg,
        loading,
        checkUserSession,
        handleSignOut,
        isProfileCompleted,
        provider,
        socialUserImg,
        setIsUserUpdated,
        type
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
