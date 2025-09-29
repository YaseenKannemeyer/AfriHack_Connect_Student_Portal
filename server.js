// server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// Map<userId (string), Set<ws>>
const clients = new Map();

wss.on('connection', ws => {
  let userId;

  ws.on('message', msg => {
    try {
      const data = JSON.parse(msg);
      // --- REGISTER ---
      if (data.type === 'register') {
        userId = String(data.id);  // always string
        if (!clients.has(userId)) clients.set(userId, new Set());
        clients.get(userId).add(ws);
        console.log(`Registered: ${data.name} (${data.userType})`);
      }

      // --- MESSAGE ---
      if (data.type === 'message') {
        if (data.to === 'all') {
          // broadcast to all except sender
          clients.forEach((wsSet, id) => {
            if (id !== userId) {
              wsSet.forEach(clientWs => clientWs.send(JSON.stringify(data)));
            }
          });
        } else {
          const targetWsSet = clients.get(String(data.to));
          if (targetWsSet) {
            targetWsSet.forEach(clientWs => clientWs.send(JSON.stringify(data)));
          }
        }
      }
    } catch (err) {
      console.error('Error parsing message:', err);
    }
  });

  ws.on('close', () => {
    if (userId && clients.has(userId)) {
      const wsSet = clients.get(userId);
      wsSet.delete(ws);
      if (wsSet.size === 0) clients.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  });
});

console.log('WebSocket server running on ws://localhost:8080');
