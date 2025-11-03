# 🧠 SJF CPU Scheduling Simulator

An **interactive web-based simulator** that visualizes how the **Shortest Job First (SJF)** CPU scheduling algorithm works — complete with real-time Gantt chart animation, detailed statistics, event logs, and dynamic charts.

---

## 🚀 Demo

🎬 **Try it yourself:**  
Download or clone the repository and open **`home.html`** in any modern browser — no installations needed.

---

## 🧩 Features at a Glance

| Category | Description |
|-----------|--------------|
| 🖥️ **Live Simulation** | Step-by-step animation of CPU scheduling using a Gantt chart |
| ⚙️ **Process Input** | Add processes with Burst & Arrival times interactively |
| 🎨 **Dynamic Visualization** | Play, Pause, Step Forward, and **Step Back** through the timeline |
| 📊 **Detailed Statistics** | Displays per-process and overall CPU metrics |
| 🧾 **Event Log** | Logs arrivals, executions, and completions of processes |
| 📈 **Performance Chart** | Compares Waiting vs Turnaround Time using a live bar chart |
| ⚡ **Adjustable Controls** | Change speed, scale, and re-run simulations instantly |
| 💡 **Clean UI** | Light-themed, responsive, and student-friendly interface |

---

## 📘 What You’ll Learn

This simulator helps you **understand and visualize**:
- How the **Shortest Job First (Non-Preemptive)** algorithm selects processes  
- How **arrival and burst times** affect waiting and turnaround time  
- Key CPU performance metrics:  
  - Average Waiting Time  
  - Average Turnaround Time  
  - CPU Utilization  
  - Throughput  
  - Idle Time  
- How process scheduling actually looks in real-time

---

## 🧮 Example Workflow

1. Enter process details like:
   ```
   P1 → Arrival: 0, Burst: 6  
   P2 → Arrival: 2, Burst: 4  
   P3 → Arrival: 4, Burst: 5
   ```
2. Click **Start Simulation**  
3. Watch the **Gantt Chart** animate in real-time  
4. Use:
   - ▶ **Play** / ⏸ **Pause**
   - ⏩ **Step Forward**
   - ⏪ **Step Back**
5. View all stats and events after execution completes

---

## 🧠 Key Components

| File | Purpose |
|------|----------|
| `home.html` | Defines structure and layout of the simulator |
| `style.css` | Handles responsive design, theming, and layout |
| `script.js` | Core simulation logic, animation, and interactivity |

---

## 📊 Example Stats Shown

- **Average Waiting Time:** 4.67 units  
- **Average Turnaround Time:** 8.33 units  
- **CPU Utilization:** 92%  
- **Throughput:** 0.25 processes/unit  
- **Idle Time:** 2 units  

(Values vary based on input.)

---

## 🧰 Tech Stack

- **HTML5** – structure and layout  
- **CSS3** – clean, responsive light theme  
- **Vanilla JavaScript (ES6)** – logic, animation, and event handling  
- **Canvas API** – for Gantt chart and bar chart drawing  

---

## 📅 Future Enhancements

🔜 Planned or possible future updates:
- [ ] **Preemptive SJF (SRTF)** mode  
- [ ] **Round Robin** and **Priority Scheduling** support  
- [ ] **Dark Mode** toggle  
- [ ] **CSV Import/Export** for process data  
- [ ] **Keyboard Shortcuts** (Space = Play/Pause, Arrows = Step)

---

## 💬 Project Motivation

This simulator was created as part of the **Operating Systems (DA-1)** coursework for **Fall 2025-26**, under the **School of Computer Science & Engineering**.  
The goal was to make CPU scheduling **interactive, visual, and intuitive** for students learning process management.

---

## 👨‍💻 Author

**Tony Stark**  
📧 *your.email@example.com*  
💼 Developer | CS Student | Tech Enthusiast  

> “Turning textbook algorithms into visual experiences!”

---

## 📜 License

This project is open-source under the **MIT License**.  
Feel free to fork, modify, and improve it for educational use.
