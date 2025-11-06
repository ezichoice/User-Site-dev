"use client";

import EditProfile from "@/components/profilePageCom/EditProfile";
import { useAuth } from "@/context/authContext";
import { supabase } from "@/lib/supabase";
import { Icon } from '@iconify/react';
import { toPng } from 'html-to-image';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import QRCode from "react-qr-code";
import { ClipLoader } from "react-spinners";

interface Profile {
  id: string;
  full_name: string;
  user_name: string;
  avatar_url: string;
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { userImg, provider, type } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [error, setError] = useState<string | null>(null);

  // We'll store the user's email separately so we can show a QR code
  const [userEmail, setUserEmail] = useState<string>("");
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          throw new Error(
            sessionError?.message || "No authenticated user found."
          );
        }

        // Capture the user’s email for the QR code
        setUserEmail(session.user.email ?? "");
        
        // Fetch the user's profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          throw new Error(profileError.message);
        }

        setProfile(profileData);

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
          router.push("/auth/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [router, isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader size={50} color="#3b82f6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const shareQRCode = async () => {
    const qrCodeElement = document.querySelector('#qr-code');
    if (!qrCodeElement) {
      console.error('QR code element not found');
      return;
    }

    try {
      // create a Promise that resolves to a Blob
      // toPng is a function from the html-to-image library that converts a DOM node to a PNG data URL
      const blob = await new Promise<Blob | null>((resolve) => {
        toPng(qrCodeElement as HTMLElement, {
          width: 512,
          height: 512
        })
          .then((dataUrl) => fetch(dataUrl).then(res => res.blob()))
          .then((blob) => resolve(blob))
          .catch(() => resolve(null));
      });

      // if blob is null, throw an error
      if (!blob) {
        throw new Error('Failed to convert QR code to image');
      }
      // create a File from the Blob
      const file = new File([blob as Blob], 'qrcode.png', { type: 'image/png' });

      // Use the Web Share API to share the file
      // check if the files property is supported
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // triggers the native share dialog, which allows sharing to apps like WhatsApp, Email, etc.
        await navigator.share({
          files: [file],
          title: 'My QR Code',
          text: 'Here is my QR code!',
        });
        console.log('QR code shared successfully');
      } else {
        alert('Sharing not supported on this browser. Please download the QR code instead.');
      }

    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  }

  const downloadQRCode = () => {
    const qrCodeElement = document.querySelector('#qr-code');
    if (!qrCodeElement) return;

    // convert the QR code element to a PNG image and trigger a download
    toPng(qrCodeElement as HTMLElement, {
      width: 512,
      height: 512
    })
      .then((dataUrl) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = dataUrl;
        downloadLink.download = 'qrcode.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      })
      .catch((error) => {
        console.error('Error downloading QR code:', error);
      });
  };

  const showQRCode = () => {
    confirmAlert({
      customUI: ({ onClose }) => {  
        return (
          <div className='relative bg-white h-screen max-h-[500px] px-10 rounded-md shadow-lg shadow-indigo-500 border-2 border-blue-500 flex flex-col items-center justify-center gap-4 w-screen max-w-4xl'>
            <button className='absolute p-1 text-white rounded-md top-1 right-1' onClick={onClose}>
              <Icon icon="bi:x-circle" className="text-red-500 hover:bg-red-500 hover:text-white rounded-full" />
            </button>
            <QRCode 
            value={JSON.stringify({ email: userEmail, username: profile?.user_name! })} 
            id="qr-code" 
            fgColor="#000000"
            bgColor="#ffffff"
            />
            <div className="flex items-center justify-center gap-4">
            <button className='py-1 px-2 bg-white rounded-md text-blue-500 hover:bg-blue-500 hover:text-white flex items-center gap-2' onClick={shareQRCode}>
              <Icon icon="bi:share" className="" /> Share
            </button>
            <button className='py-1 px-2 bg-white rounded-md text-blue-500 hover:bg-blue-500 hover:text-white flex items-center gap-2' onClick={downloadQRCode}>
              <Icon icon="bi:download" className="" /> Download
            </button>
            </div>
          </div>
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-md shadow-lg p-6 relative">
        {/* Profile Banner */}
        <div className="w-full h-32 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md absolute top-0 left-0 z-0" />

        {/* Edit button (absolute in top-right) */}
        {!isEditing && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-4 justify-center">
            <button
              onClick={handleEditClick}
              className="text-white hover:underline"
            >
              Edit Profile
            </button>
            {provider === "email" && (
              <>
              <p className="text-white">|</p>
              <Link
              href="/auth/forgot-password?from=profile_page"
              className="text-white hover:underline"
              >
                Change Password
              </Link>
              </>
              )}
          </div>
        )}

        {/* Profile Content */}
        <div className="relative z-10 mt-20 flex flex-col items-center space-y-4">
          

          {/* Basic Profile Info */}
          {!isEditing ? (
            <>
              {/* Profile Image */}
              <div className="relative w-24 h-24 rounded-full ring-4 ring-white overflow-hidden">
                <Image
                  src={userImg || "/profile.png"}
                  alt="User Avatar"
                  fill
                  className="object-cover"
                />
              </div>
            
              <div className="text-center">
                <span className="w-auto border-2 bg-blue-600 text-white px-2 py-1 rounded-md mb-2 text-sm">
                  {
                  type === "pension" ?
                    "PENSIONER" :
                    type === "student" ?
                    "STUDENT" :
                    "FREE USER"
                  }
                </span>
                <h1 className="text-2xl font-bold">
                  {profile?.full_name || "Unnamed User"}
                </h1>
                {/* QR Code for the user */}
                {profile?.user_name && (
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-gray-700 font-medium">&{profile.user_name}</span>
                    <div className="flex flex-col items-center relative">
                      <div className="bg-white p-1 rounded-md relative group">
                        <Icon icon="bi:qr-code-scan" className="text-4xl text-gray-700 cursor-pointer hover:text-indigo-500" onClick={showQRCode} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : profile?.id && (
            <EditProfile userId={profile?.id} userEmail={userEmail} provider={provider} setIsEditing={setIsEditing} />
          )}

          
          
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
