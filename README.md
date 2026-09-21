# Verilog Simulator

A web-based Verilog simulation project that allows users to write Verilog code, compile it, and view simulation output through a browser interface.

## Features

* Write Verilog code in the browser
* Compile Verilog using Icarus Verilog
* Run simulations using VVP
* Display simulation output
* Web-based frontend
* Node.js and Express backend
* Docker support

## Technologies Used

* **Verilog HDL**
* **Icarus Verilog**
* **Node.js**
* **Express.js**
* **HTML**
* **CSS**
* **JavaScript**
* **Docker**

## Project Structure

```text
verilog-new-project/
├── public/
├── verilog-backend/
├── verilog-fronend/
├── server.js
├── package.json
├── package-lock.json
├── Dockerfile
└── .gitignore
```

## How It Works

```text
User enters Verilog code
          ↓
      Frontend
          ↓
   Node.js / Express
          ↓
    Icarus Verilog
          ↓
      Compilation
          ↓
       VVP
          ↓
 Simulation Output
          ↓
      Frontend
```

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/harshapasupuleti859-png/verilog-new-project.git
cd verilog-new-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Check Icarus Verilog

Make sure `iverilog` and `vvp` are installed.

```bash
iverilog -V
vvp -V
```

### 4. Start the application

```bash
node server.js
```

Open the application in your browser at the local address shown by the server.

## Example Verilog

```verilog
module testbench;

    initial begin
        $display("Hello, Verilog!");
        $finish;
    end

endmodule
```

## Future Improvements

* SystemVerilog support
* Syntax highlighting
* Waveform visualization
* Multiple source-file support
* RTL schematic visualization
* Improved compilation error messages
* Project/workspace management
* Testbench generation

## Learning Outcomes

This project helped develop practical knowledge of:

* Verilog HDL
* RTL simulation
* Testbench development
* Icarus Verilog
* Node.js
* Express.js
* REST APIs
* Frontend and backend integration
* Docker

## Author

**Harsha Pasupuleti**

B.E. VLSI Design and Technology

GitHub: https://github.com/harshapasupuleti859-png

## License

This project is created for educational and learning purposes.
