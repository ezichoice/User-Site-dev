import { IMAGE_SUPPORTED_FORMATS } from "@/utils/constants";
import { Icon } from '@iconify/react';
import Image from "next/image";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useEffect, useRef, useState } from "react";
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import Cropper from "react-easy-crop";

interface Props {
  prevProfile: string | null;
  setProfilePic : (file: File | string | null) => void;
  blurProfilePic: (event: React.FocusEvent<HTMLInputElement>) => void;
  imagePreviewUrl: string | null;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

const EditProfileImage = ({ prevProfile, setProfilePic, blurProfilePic, imagePreviewUrl } : Props) => {
  
  // when upload button is clicked, show the modal
  const [showModal, setShowModal] = useState<boolean>(false);

  // Decide if the image is being cropped or not
  const [cropping, setCropping] = useState<boolean>(false);

  // Below states are for setting the cropped image
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // --
  const [rotation, setRotation] = useState(0);
  const [cancelOrDelete, setCancelOrDelete] = useState<"cancel" | "delete" | "">("");
  const [prevSavedPhoto, setPrevSavedPhoto] = useState<File | null>(null);
  // --
  
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const aspectRatio = 1/1;
  
  // Refer the input element
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);

  // Set the parent state value with the file selected
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files ? event.currentTarget.files[0] : null;
    
    clearCropStates();

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCroppedImageUrl(reader.result as string);
        setCropping(true);
      }
      reader.readAsDataURL(file);
    }

    
  }

  // When the upload image button is clicked, trigger the input element.
  const onUploadImg = () => {
    inputFileRef.current?.click();
  }

  // When the delete image button is clicked, reset the parent state value and file input value.
  const handleClearImage = () => {
    
    confirmAlert({
      title: '',
      message: 'Are you sure to DELETE profile picture?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {setCancelOrDelete("delete")}
        },
        {
          label: 'No',
          onClick: () => {setCancelOrDelete("")}
        }
      ]
    });
  }

  const handleCancelImage = () => {
    
    confirmAlert({
      title: '',
      message: 'Are you sure to CANCEL image upload?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {setCancelOrDelete("cancel")}
        },
        {
          label: 'No',
          onClick: () => {setCancelOrDelete("")}
        }
      ]
    });
  }

  const handleSaveImage = () => {
    confirmAlert({
      title: '',
      message: 'Are you sure to SAVE profile picture?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => onCropSave()
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  }

  useEffect(() => {
    if (!cancelOrDelete) return;

    if (inputFileRef.current)
      inputFileRef.current.value = "";

    if (cancelOrDelete === "delete")
      setProfilePic(null);
    else if (cancelOrDelete === "cancel")
      setProfilePic(prevSavedPhoto || prevProfile);
    
    clearCropStates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelOrDelete])
    
  // When the cropping stops, the cropped area is set.
  const onCropComplete = (croppedAreaPercentage: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  }

  // Load an image from the URL and returns a promise that resolves to an HTMLImageElement
  const createImage = async (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new window.Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImage = async (croppedArea: Area, rotation: number) => {
    const image = await createImage(croppedImageUrl!);
    const canvasEl = document.createElement("canvas");
    const ctx = canvasEl.getContext("2d");

    if (!ctx) return null;

    // Apply rotation
    const radians = (rotation * Math.PI) / 180;
    const { width: imgWidth, height: imgHeight } = image;
    const s_x = Math.abs(Math.cos(radians));
    const s_y = Math.abs(Math.sin(radians));
    canvasEl.width = imgWidth * s_x + imgHeight * s_y;
    canvasEl.height = imgWidth * s_y + imgHeight * s_x;

    // translate and rotate the canvas
    ctx.translate(canvasEl.width / 2, canvasEl.height / 2);
    ctx.rotate(radians);
    ctx.drawImage(image, -imgWidth / 2, -imgHeight / 2);

    // crop the image from the rotated canvas
    const croppedCanvas = document.createElement("canvas");
    const croppedCtx = croppedCanvas.getContext("2d");
    if (!croppedCtx) return null;

    croppedCanvas.width = croppedArea.width;
    croppedCanvas.height = croppedArea.height;

    // draw the cropped image
    croppedCtx.drawImage(
      canvasEl,
      croppedArea.x,
      croppedArea.y,
      croppedArea.width,
      croppedArea.height,
      0,
      0,
      croppedArea.width,
      croppedArea.height
    );

    return new Promise((resolve, reject) => {
      croppedCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas is empty"));
        }
      }, "image/jpeg");
    });
  }

  // clear crop states
  const clearCropStates = () => {
    setCroppedArea(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropping(false);
    setRotation(0);
    setCroppedImageUrl(null);

    setShowModal(false);
    setCancelOrDelete("");
  }

  const onCropSave = () => {
    if (!croppedArea || !croppedImageUrl) return;
    
    try {
      const croppedImageBlob = getCroppedImage(croppedArea, rotation);
      if (croppedImageBlob) {
        croppedImageBlob.then((blob) => {
          const now = new Date();
          const timestampString = now.toISOString().replace(/[:.]/g, "-").replace(/Z$/, "");
          const croppedFile = new File([blob as Blob], `${timestampString}.jpeg`, { type: "image/jpeg" });
          setProfilePic(croppedFile);
          setPrevSavedPhoto(croppedFile);
          clearCropStates();
        }).catch((error) => {
          console.error("Error cropping image: ", error);
          setProfilePic(null);
          clearCropStates();
        });
      }
    } catch (error) {
      console.error("Error cropping image: ", error);
      setProfilePic(null);
      clearCropStates();
    }
    
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        {
          cropping ? (
            <>
            <div className="relative w-[450px] h-[350px] bg-gradient-to-r from-blue-500 to-indigo-500">
              <div>
              <Cropper
                image={croppedImageUrl!}
                aspect={aspectRatio}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                style={{
                  containerStyle: {
                    width: "450px",
                    height: "300px",    
                    backgroundColor: "#fff",
                  }
                }}
              />
              </div>
              <div className="absolute w-full bottom-1 left-0 flex items-center justify-center gap-4 px-10">
                <div className="flex flex-col items-center gap-1 w-full">
                  <label htmlFor="zoom" className="text-white">Zoom</label>
                  <Slider 
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(value) => setZoom(value as number)}
                  className="w-full"
                  />
                </div>
                <div className="flex flex-col items-center gap-1 w-full">
                  <label htmlFor="rotation" className="text-white">Rotation</label>
                  <Slider 
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  onChange={(value) => setRotation(value as number)}
                  className="w-full"
                  />
                </div>
              </div>
            </div>
            {/* Cancel & Save cropped image buttons */}
            <div className="flex items-center justify-center gap-4 mt-2">
              <button type="button" onClick={handleSaveImage} className="flex items-center justify-center gap-1 text-sm bg-gray-200 border border-black hover:bg-green-200 px-2 py-1 rounded-md">
                <Icon icon="bi:check-lg" />
                <span>Save</span>
              </button>
              <button type="button" onClick={handleCancelImage} className="flex items-center justify-center gap-1 text-sm bg-gray-200 border border-black hover:bg-red-200 px-2 py-1 rounded-md">
                <Icon icon="bi:x-circle" />
                <span>Cancel</span>
              </button>
            </div>
            </>
          ) : showModal ? (
            <>
            {/* hide the input element */}
            <input
              id="profilePic"
              name="profilePic"
              type="file"
              ref={inputFileRef}
              accept={IMAGE_SUPPORTED_FORMATS.join(",")}
              onChange={handleChange}
              onBlur={blurProfilePic}
              className="hidden"
            />
            <div className="relative w-[450px] h-[350px] p-14 bg-gradient-to-r from-blue-500 to-indigo-500">
              <div className="flex flex-col justify-center items-center w-full h-full !bg-white">
                <button type="button" onClick={onUploadImg} className="flex flex-col items-center justify-center gap-2 group">
                  <Icon icon="bi:cloud-upload" className="text-6xl text-gray-400 group group-hover:text-blue-500" />
                  <span className="group group-hover:text-blue-500">Select a profile picture</span>
                </button>
              </div>
              <button type="button" onClick={handleCancelImage} className="absolute top-3 right-3 flex items-center justify-center gap-1 text-sm rounded-full">
                <span className="text-sm px-2 py-0.5 text-red-500 hover:bg-red-200 rounded-md bg-white">Cancel</span>
              </button>
            </div>
            </>
          ) : (
            <>
            <div className="w-[200px] h-[200px]">
              {
                imagePreviewUrl ? (
                  <Image
                  src={imagePreviewUrl}
                  alt="Profile Picture"
                  width={200}
                  height={200}
                  className="w-[200px] h-[200px] rounded-full object-cover"
                  />
                ) : (
                  <Image
                  src="/profile.png"
                  alt="Profile Picture"
                  width={200}
                  height={200}
                  className="w-[200px] h-[200px] rounded-full object-cover"
                  />
                )
              }
            </div>
            {/* Upload Image & Delete image buttons */}
            <div className="flex items-center justify-center gap-4 mt-2">
              
              <button type="button" onClick={() => setShowModal(true)} className="flex items-center justify-center gap-1 text-sm bg-gray-200 border border-black hover:bg-green-200 px-2 py-1 rounded-md">
                <Icon icon="bi:upload" />
                <span>Upload profile picture</span>
              </button>
              {imagePreviewUrl && <button type="button" onClick={handleClearImage} className="flex items-center justify-center gap-1 text-sm bg-gray-200 border border-black hover:bg-red-200 px-2 py-1 rounded-md">
                <Icon icon="bi:trash" />
                <span>Delete</span>
              </button>}
            </div>
            </>
          )
        }
      </div>
    </div>
  )
}

export default EditProfileImage;