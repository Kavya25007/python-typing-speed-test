# ---------------------------------------
# Project: Python Typing Speed Test
# Created by: Kavya
# Year: 1st Year B.Tech (AI & ML)
# ---------------------------------------

import tkinter as tk
import random
import time

start_time = 0

sentences = [
    "python programming improves logical thinking",
    "practice daily to increase typing speed",
    "artificial intelligence is the future of technology"
]

# -------- Functions --------

def start_test():
    global start_time
    result_label.config(text="")
    user_entry.delete(0, tk.END)
    sentence = random.choice(sentences)
    sentence_label.config(text=sentence)
    start_time = time.time()

def check_result():
    global start_time

    if start_time == 0:
        result_label.config(text="Click Start First!")
        return

    end_time = time.time()
    total_time = end_time - start_time

    typed = user_entry.get()
    original = sentence_label.cget("text")

    words = len(typed.split())
    minutes = total_time / 60
    wpm = words / minutes if minutes > 0 else 0

    correct = 0
    original_words = original.split()
    typed_words = typed.split()

    for i in range(len(original_words)):
        if i < len(typed_words) and original_words[i] == typed_words[i]:
            correct += 1

    accuracy = (correct / len(original_words)) * 100

    result_label.config(
        text=f"WPM: {round(wpm,2)}   Accuracy: {round(accuracy,2)}%   Time: {round(total_time,2)} sec"
    )

# -------- GUI --------

root = tk.Tk()
root.title("Typing Speed Test - Premium UI")
root.geometry("800x500")
root.resizable(False, False)

# -------- Gradient Background --------

canvas = tk.Canvas(root, width=800, height=500)
canvas.pack(fill="both", expand=True)

for i in range(0, 500):
    r = int(30 + (i/500)*40)
    g = int(30 + (i/500)*20)
    b = int(60 + (i/500)*80)
    color = f'#{r:02x}{g:02x}{b:02x}'
    canvas.create_line(0, i, 800, i, fill=color)

# -------- Main Card Frame --------

card = tk.Frame(root, bg="#1e1e2f", bd=0)
card.place(relx=0.5, rely=0.5, anchor="center", width=650, height=380)

title = tk.Label(card, text="Typing Speed Test",
                 font=("Arial", 24, "bold"),
                 bg="#1e1e2f", fg="cyan")
title.pack(pady=10)

credit = tk.Label(card, text="Developed by Kavya",
                  font=("Arial", 10),
                  bg="#1e1e2f", fg="lightgrey")
credit.pack()

sentence_label = tk.Label(card,
                          text="Click Start to begin",
                          wraplength=600,
                          font=("Arial", 14),
                          bg="#2e2e40",
                          fg="white",
                          padx=10,
                          pady=10)
sentence_label.pack(pady=20)

user_entry = tk.Entry(card,
                      font=("Arial", 14),
                      width=50,
                      bg="#50507a",
                      fg="white",
                      insertbackground="white",
                      relief="flat")
user_entry.pack(pady=10)

button_frame = tk.Frame(card, bg="#1e1e2f")
button_frame.pack(pady=15)

start_btn = tk.Button(button_frame,
                      text="Start",
                      command=start_test,
                      bg="#00c853",
                      fg="white",
                      width=10,
                      relief="flat")
start_btn.grid(row=0, column=0, padx=15)

check_btn = tk.Button(button_frame,
                      text="Check",
                      command=check_result,
                      bg="#2962ff",
                      fg="white",
                      width=10,
                      relief="flat")
check_btn.grid(row=0, column=1, padx=15)

result_label = tk.Label(card,
                        text="",
                        font=("Arial", 14, "bold"),
                        bg="#1e1e2f",
                        fg="yellow")
result_label.pack(pady=15)

root.mainloop()