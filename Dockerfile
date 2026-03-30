# Use the lightweight Debian-based Node.js 18 image
# We need Debian (slim) instead of Alpine to easily apt-get standard Icarus Verilog
FROM node:18-slim

# Install system dependencies (Icarus Verilog and VVP)
RUN apt-get update && apt-get install -y iverilog \
    && rm -rf /var/lib/apt/lists/*

# Set our application standard deployment working directory
WORKDIR /app

# Copy package dependency info over first to cache node_modules safely
COPY package*.json ./

# Install ONLY production node dependencies 
RUN npm install --production

# Copy all application files (Public HTML, CSS, JS, server)
COPY . .

# Let the host (Render/Railway/Fly) know which port we actually listen on
EXPOSE 3000

# Tell the container exactly how to boot up
CMD ["node", "server.js"]
