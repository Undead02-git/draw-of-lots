# ⚖️ Draw of Lots - Moot Court Edition

A professional, automated tool designed for conducting the "Draw of Lots" for Moot Court competitions. This application ensures fair, randomized, and constraint-based pairings for Preliminary rounds.

Developed specifically for the **4th P.N. Mathur National Moot Court Competition, 2025** by **Sagar Kadyan**, but adaptable for any competition requiring structured randomization.

---

## 🎯 The Vision & Objective

Conducting a "Draw of Lots" for a Moot Court competition is more than just a procedural step—it's the foundation of fairness and competitive integrity. Traditionally, manual draws are prone to human error, resulting in repeat matchups or awkward role assignments that can compromise the spirit of the competition. **Draw of Lots - Moot Court Edition** was born from a need to replace paper slips and spreadsheets with a robust, automated engine that guarantees precision. By intelligently managing side-swapping (Petitioners to Respondents) and ensuring no team faces the same opponent twice, this app eliminates the "luck of the draw" from technical logistics. Beyond its logic, the built-in reveal animations bring a high-stakes, professional "Grand Slam" atmosphere to the live draw, ensuring that the only thing participants need to focus on is their oral advocacy.

---

## 🚀 How to Use (No Tech Knowledge Required)

### 1. Prepare your Excel File
The app reads team names from an Excel file (`.xlsx`).
*   Open Excel and create a new sheet.
*   In the **first row of the first column**, type exactly: `Team Codes`
*   List all your team codes (e.g., TC-01, TC-02, etc.) directly under that heading.
*   **Important:** You must have an **even number** of teams.

### 2. Run the App
*   **Desktop Version:** Simply double-click the `Draw of Lots.exe` file.
*   **Web Version:** Open the provided link in Chrome or Edge.

### 3. Generate Pairings
1.  **Upload:** Click the "Upload" box and select your Excel file.
2.  **Round 1:** Click **"Generate Round 1"**. Watch the animation reveal the pairings!
3.  **Round 2:** Once Round 1 is done, click **"Generate Round 2"**. 
    *   *Note:* The app automatically swaps sides (Petitioners become Respondents) and ensures no team faces the same opponent twice!
4.  **Export:** Click **"Export"** to download a beautifully formatted Excel file containing all the pairings for your records.

---

## ✨ Key Features

*   **Smart Randomization:** Ensures no two teams face each other twice across rounds.
*   **Automatic Role Reversal:** Automatically handles the Petitioner/Respondent switch for Round 2.
*   **Live Reveal Animation:** A dramatic, high-stakes animation for revealing pairings during the live draw.
*   **Error Checking:** Warns you if you have an odd number of teams or incorrect file formatting.
*   **Persistence:** If you accidentally close the app, it remembers your last generated pairings.
*   **Excel Integration:** Seamlessly import teams and export results.

---

## 🛠️ Installation & Developer Setup

If you want to run this from the source code or build your own version:

### Prerequisites
*   [Node.js](https://nodejs.org/) (Recommended: Latest LTS)

### Setup
1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/draw-of-lots.git
    cd draw-of-lots
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run in development mode:
    ```bash
    npm run dev
    ```

### Building the Desktop App (.exe)
To create a standalone Windows installer:
1.  Export the web files:
    ```bash
    npm run build
    ```
2.  Package the application:
    ```bash
    npm run dist
    ```
The installer will be generated in the `dist` folder.

---

## 📝 Technologies Used

*   **Next.js 15** - Web Framework
*   **Electron** - Desktop Application Wrapper
*   **Tailwind CSS** - Styling
*   **Shadcn/UI** - Interface Components
*   **Lucide React** - Icons
*   **XLSX** - Excel Processing

---

## 📜 License

This project is open-source. Please check the `LICENSE` file for details.

Developed with ❤️ by **Sagar Kadyan** for the Moot Court community.
