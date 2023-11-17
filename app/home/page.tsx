"use client";

import { Button, Toast } from "@ensdomains/thorin";
import { ChangeEvent, useEffect, useState } from "react";
import { useAccount } from "wagmi";

interface FileData {
  cid: string;
  filePath: string;
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
  const { address } = useAccount();

  const fetchImages = async () => {
    try {
      const list = await fetch("/api/list");
      const data = await list.json();
      setFiles(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const data = await fetch("/api/upload?address=" + address, {
      method: "POST",
      body: formData,
    });

    const dataParsed = await data.json();

    setFiles([
      ...files,
      { cid: dataParsed.cid, filePath: dataParsed.filePath },
    ]);

    setToastState({
      title: "Uploaded image successfully!",
      description: `path: ${dataParsed.filePath}`,
      open: true,
    });
  };

  const handleDownload = async (cid: string, filePath: string) => {
    const res = await fetch(
      "/api/download?cid=" + cid + "&filePath=" + filePath
    );
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filePath;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <h2 className="text-base-black">Upload Image</h2>
      <input type="file" onChange={handleUpload} />
      <h2 className="text-base-black">List Image</h2>
      <div>
        {files.map((file) => (
          <div
            key={file.cid}
            className="flex items-center justify-center space-x-2 space-y-2"
          >
            <p className="text-base-black">{file.filePath}</p>
            <Button
              onClick={() => handleDownload(file.cid, file.filePath)}
              width="28"
            >
              Download
            </Button>
          </div>
        ))}
      </div>
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
    </>
  );
}
