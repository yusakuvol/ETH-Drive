"use client";

import InputImage from "@/app/home/_components/InputImage/InputImage";
import { useGetImageUrl } from "@/app/home/_hooks/useGetImageUrl/useGetImageUrl";
import {
  Button,
  Card,
  Dialog,
  PlusSVG,
  ScrollBox,
  Skeleton,
  Toast,
} from "@ensdomains/thorin";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";

interface FileData {
  cid: string;
  uploadedBy: string;
  uploadedAt: string;
  fileName: string;
}

interface Toast {
  open: boolean;
  title: string;
  description: string;
}

export default function Home() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [toastState, setToastState] = useState<Toast>({
    open: false,
    title: "",
    description: "",
  });
  const [dialogState, setDialogState] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const { address } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { imageUrl } = useGetImageUrl({ file: imageFile });

  const fetchImages = async () => {
    try {
      const list = await fetch("/api/list");
      const data = await list.json();
      setFiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async () => {
    if (!imageFile) {
      setToastState({
        title: "No file selected!",
        description: `Please select a file to upload`,
        open: true,
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", imageFile);

    const data = await fetch(`/api/upload?address=${address}`, {
      method: "POST",
      body: formData,
    });

    const dataParsed = await data.json();

    setFiles([
      {
        cid: dataParsed.cid,
        uploadedBy: dataParsed.uploadedBy,
        uploadedAt: dataParsed.uploadedAt,
        fileName: dataParsed.fileName,
      },
      ...files,
    ]);

    setUploading(false);
    setDialogState(false);

    setToastState({
      title: "Uploaded image successfully!",
      description: `file: ${dataParsed.fileName}`,
      open: true,
    });
    handleClickCancelButton();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget?.files && e.currentTarget.files[0]) {
      const targetFile = e.currentTarget.files[0];
      setImageFile(targetFile);
    }
  };

  const handleDownload = async (cid: string, filePath: string) => {
    const res = await fetch(`/api/download?cid=${cid}&filePath=${filePath}`);
    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filePath;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClickCancelButton = () => {
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 mt-4">
      <Card className="w-2/3">
        <div className="flex items-center justify-between px-6">
          <p className="text-base-black text-lg">
            Upload your image to <span className="font-bold">IPFS</span> and
            share it with your <span className="font-bold">ENS</span> domain.
          </p>
          <Button
            onClick={() => setDialogState(true)}
            prefix={<PlusSVG />}
            width="48"
          >
            Upload
          </Button>
        </div>
      </Card>
      <ScrollBox className="bg-white w-2/3 h-[500px] rounded-2xl">
        {fetching ? (
          <div className="space-y-4 flex flex-col justify-center items-center mt-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton loading={true} className="h-8" key={index}>
                DummyDummyDummyDummyDummyDummyDummyDummyDummyDummyDummyDummyDummyDummyDummyDummy
              </Skeleton>
            ))}
          </div>
        ) : (
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-base-black">
              <thead>
                <tr className="border">
                  <th scope="col" className="px-6 py-3">
                    FileName
                  </th>
                  <th scope="col" className="px-6 py-3">
                    UploadedBy
                  </th>
                  <th scope="col" className="px-6 py-3">
                    UploadedAt
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr className="text-base-black mt-4 border" key={file.cid}>
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-base-black whitespace-nowrap"
                    >
                      {file.fileName}
                    </th>
                    <td scope="row" className="px-6 py-4">
                      {file.uploadedBy}
                    </td>
                    <td scope="row" className="px-6 py-4">
                      {file.uploadedAt}
                    </td>
                    <td scope="row" className="px-6 py-4">
                      <Button
                        onClick={() => handleDownload(file.cid, file.uploadedBy + '/' + file.fileName)}
                        width="28"
                        colorStyle="accentSecondary"
                      >
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ScrollBox>
      <Dialog
        open={dialogState}
        variant="blank"
        onDismiss={() => setDialogState(false)}
      >
        <Dialog.Heading title="Upload Image" />
        <div className="text-base-black w-96 flex items-center justify-center">
          <label
            htmlFor="image"
            className="w-80 h-80 border flex items-center justify-center cursor-pointer relative rounded text-base-gray text-lg"
          >
            {imageUrl && imageFile ? (
              <Image className="object-cover" src={imageUrl} alt="image" fill />
            ) : (
              <>
                <PlusSVG />
                <span className="ml-2">Select a file</span>
              </>
            )}
            <InputImage
              ref={fileInputRef}
              id="image"
              onChange={handleFileChange}
            />
          </label>
        </div>
        <Dialog.Footer
          leading={
            <Button
              colorStyle="accentSecondary"
              onClick={() => {
                setDialogState(false);
                handleClickCancelButton();
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
          }
          trailing={
            <Button
              onClick={handleUpload}
              disabled={!Boolean(imageFile) || uploading}
              loading={uploading}
            >
              {uploading ? "Uploading" : "Upload"}
            </Button>
          }
        />
      </Dialog>
      <Toast
        open={toastState.open}
        title={toastState.title}
        description={toastState.description}
        variant="desktop"
        onClose={() =>
          setToastState({
            title: "",
            description: "",
            open: false,
          })
        }
      ></Toast>
    </div>
  );
}
