import tkinter as tk
from tkinter import filedialog
import subprocess
import os

def decrypt_file():
    # input file
    filename = filedialog.askopenfilename(
        title="Select a file to decrypt",
        filetypes=(
            ("All png files", "*.png"),
            ("All jpg files", "*.jpg"),
            ("All jpeg files", "*.jpeg"),
        )
    )
    if not filename:
        return

    # output file
    splitPath = os.path.split(filename)
    output_filename = splitPath[0] + "/decrypted_" + splitPath[1]

    # execute decrypt
    command = ["/usr/local/bin/gpg", "--output", output_filename, "--decrypt", filename]
    process = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # display result
    if process.returncode == 0:
        tk.messagebox.showinfo("Success", f"File decrypted as {output_filename}")
    else:
        tk.messagebox.showerror("Error", process.stderr.decode())

# Ready For GUI
root = tk.Tk()
root.title("GPG Decryptor")

# Button
decrypt_button = tk.Button(
    root,
    text="Decrypt File",
    command=decrypt_file,
    bg='light blue',
    fg='black',
    activebackground='light blue',
    activeforeground='black',
    highlightbackground='#3E4149',
)
decrypt_button.pack(pady=20, padx=20)

# Boot GUI
root.mainloop()
