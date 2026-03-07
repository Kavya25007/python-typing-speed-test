# ---------------------------------------
# Mini Project: Python Typing Speed Analyzer
# Developer: Kavya
# Course: B.Tech CSE (AI&ML)- First Year
# ---------------------------------------

import tkinter as tk #GUI library
import random # for random sentence
import time # timer function

timer_start = 0
file = open("sentences.txt")
text_samples = file.readlines()
file.close()


# --------  Main Functions --------

def begin_test():
    global timer_start
    result_label.config(text= "")
    user_entry.delete(0, tk.END) # clear input
    selected_text = random.choice(text_samples).strip()
    sentence_label.config(text = selected_text)
    timer_start = time.perf_counter()
    user_entry.focus()

def calculate_result():
    global timer_start

    if timer_start == 0:
        result_label.config(text="Please start the test first!")
        return

    finish_time = time.perf_counter(
    elapsed_time = finish_time - timer_start

    user_text = user_entry.get()
    original_text = sentence_label.cget("text")

    word_count = len(user_text.split())
    minutes = elapsed_time / 60
    wpm = word_count / minutes if minutes > 0 else 0

    correct_words = 0
    original_words = original_text.split()
    typed_words = user_text.split()

    for word1 , word2 in zip(original_words , typed_words):

    if len(original_words) > 0:
    accuracy = ...
else:
    accuracy = 0

    result_label.config(
        text=f"Speed: {Typing Speed : ___ WPM
                       Accuracy Level : ___ %
                       Time Taken : ___ seconds} sec"
    )

# -------- GUI --------

root = tk.Tk()
root.title("Python Typing Speed Tester")
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

credit = tk.Label(card, text="Project Created by Kavya | AI & ML",
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
                      command = begin_test,
                      bg="#00c853",
                      fg="white",
                      width=10,
                      relief="flat")
start_btn.grid(row=0, column=0, padx=15)

check_btn = tk.Button(button_frame,
                      text="Check",
                      command = calculate_result,
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
